import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { HttpError } from '../../lib';
import { verifyCode } from './verifyApi';

// 설계 의도: 인증 상태 머신 (see docs/design-notes/0005-phone-verification-state-machine.md)

/** 인증 제한 시간(초). README: 3분 카운트다운. */
export const VERIFICATION_SECONDS = 180;

export type VerificationStatus =
  | 'idle' // 인증 시작 전
  | 'sent' // 인증번호 입력 대기(타이머 진행) — 코드 불일치/일시오류도 이 상태에 머문다(errorMessage 로 안내)
  | 'verified' // 인증 성공
  | 'expired'; // 타이머 만료

export interface UsePhoneVerification {
  status: VerificationStatus;
  /** 검증 요청 진행 중 (= react-query useMutation.isPending). 별도 'verifying' 상태를 두지 않고 파생한다. */
  isVerifying: boolean;
  remainingSeconds: number;
  errorMessage: string | null;
  start: () => void;
  verify: (mobile: string, code: string) => void;
  reset: () => void;
}

/** 검증 요청 실패(onError) 사유 → 사용자 안내 문구. 5xx 는 일시 오류, 그 외는 일반 실패로 구분한다. */
function verifyErrorMessage(error: unknown): string {
  if (error instanceof HttpError && error.status >= 500) {
    return '일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.';
  }
  return '인증에 실패했어요. 다시 시도해 주세요.';
}

/**
 * 휴대폰 인증 상태 머신.
 *
 * 설계 의도:
 * - 인증은 "값"이 아니라 "프로세스"다(발송→입력→검증→성공/만료). 단, **라이브러리/파생으로 환원 가능한 것은
 *   상태로 두지 않는다**:
 *   - "검증 진행 중" = react-query `useMutation.isPending`(= isVerifying). 로딩 표시는 라이브러리가 관리.
 *   - "코드 불일치/일시오류" = 'sent' 유지 + errorMessage 안내(재시도 가능). 별도 'failed' 상태 불필요.
 *   → 상태는 idle|sent|verified|expired 4개로 줄고, **도메인 고유 복잡도(타이머·경합)만** 남는다.
 * - 만료 판단은 README 요구대로 "클라이언트 타이머"로만 한다(서버 발송 API 없음).
 * - **경합 차단(도메인 고유 — 라이브러리로 못 없앤다)**: 검증 응답은 0.5~1.5초 지연되므로 그 사이 타이머가
 *   만료될 수 있다. 응답 콜백은 `statusRef`(최신 상태)로 "아직 'sent' 인가"를 재확인하고, 만료/리셋됐으면
 *   응답을 버린다. → "만료 후엔 성공/재시도 모두 불가"라는 불변식(verified+expired 같은 불가능 상태 차단).
 * - 동기 중복 제출은 `pendingRef`로 차단한다(`isPending`은 다음 렌더에 반영되어 같은 틱 보호엔 부족).
 * - 자동 재시도 금지(retry:false): 인증 검증은 사용자가 의도적으로만 다시 시도해야 한다.
 */
export function usePhoneVerification(onVerified: () => void): UsePhoneVerification {
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // 콜백 클로저의 stale 값 문제를 피하기 위해 최신 status 를 ref 로도 추적한다(경합 차단용).
  const statusRef = useRef<VerificationStatus>(status);
  // 같은 틱 내 중복 제출 차단용(useMutation.isPending 은 다음 렌더에 반영되므로 동기 보호엔 부족).
  const pendingRef = useRef(false);

  const updateStatus = useCallback((next: VerificationStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    setErrorMessage(null);
    updateStatus('sent');
    setRemainingSeconds(VERIFICATION_SECONDS);
    clearTimer();
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          // 만료 전이. 부수효과는 모두 멱등하므로 StrictMode 이중 호출에도 안전하다.
          clearTimer();
          updateStatus('expired');
          setErrorMessage(null); // 만료 시엔 만료 안내 하나만 노출(직전 불일치 에러 정리)
          return 0;
        }
        return next;
      });
    }, 1000);
  }, [clearTimer, updateStatus]);

  const mutation = useMutation({
    mutationFn: ({ mobile, code }: { mobile: string; code: string }) => verifyCode({ mobile, code }),
    retry: false,
  });

  const verify = useCallback(
    (mobile: string, code: string) => {
      if (pendingRef.current) return; // 중복 요청 방지(동기)
      if (statusRef.current !== 'sent') return; // 코드 입력 대기 중에만 검증(만료/성공/유휴 제외)
      pendingRef.current = true;
      setErrorMessage(null);
      mutation.mutate(
        { mobile, code },
        {
          onSuccess: (res) => {
            // 응답 도착 시점에 이미 만료(또는 reset)됐다면 결과를 버린다 — 만료된 인증의 성공 확정 방지.
            if (statusRef.current !== 'sent') return;
            if (res.verified) {
              clearTimer();
              updateStatus('verified');
              onVerified();
            } else {
              setErrorMessage('인증번호가 일치하지 않습니다. 다시 확인해 주세요.'); // 'sent' 유지 → 재시도 가능
            }
          },
          onError: (error) => {
            if (statusRef.current !== 'sent') return; // 만료/리셋됐으면 상태를 되돌리지 않는다
            setErrorMessage(verifyErrorMessage(error)); // 일시 오류 → 'sent' 유지, 타이머 그대로 재시도 가능
          },
          onSettled: () => {
            pendingRef.current = false; // 성공/실패 무관하게 동기 잠금 해제
          },
        },
      );
    },
    [mutation, clearTimer, updateStatus, onVerified],
  );

  const reset = useCallback(() => {
    clearTimer();
    updateStatus('idle');
    setRemainingSeconds(0);
    setErrorMessage(null);
  }, [clearTimer, updateStatus]);

  // 언마운트 시 타이머 정리(누수 방지) + 동기 잠금 해제(혹시 in-flight 였어도 ref 를 깨끗이 둔다)
  useEffect(
    () => () => {
      clearTimer();
      pendingRef.current = false;
    },
    [clearTimer],
  );

  return { status, isVerifying: mutation.isPending, remainingSeconds, errorMessage, start, verify, reset };
}
