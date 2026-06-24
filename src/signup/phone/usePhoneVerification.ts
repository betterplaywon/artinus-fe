import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { HttpError } from '@/lib';
import { verifyCode } from './verifyApi';

// 설계 의도: 인증 상태 머신 (see docs/design-notes/0005-phone-verification-state-machine.md)

/** 인증 제한 시간(초). README: 3분 카운트다운. */
export const VERIFICATION_SECONDS = 180;

export type VerificationStatus =
  | 'idle' // 인증 시작 전
  | 'sent' // 인증번호 입력 대기(타이머 진행)
  | 'verifying' // 검증 요청 중
  | 'verified' // 인증 성공
  | 'failed' // 코드 불일치(재시도 가능)
  | 'expired'; // 타이머 만료

export interface UsePhoneVerification {
  status: VerificationStatus;
  remainingSeconds: number;
  errorMessage: string | null;
  start: () => void;
  verify: (mobile: string, code: string) => void;
  reset: () => void;
}

/**
 * 휴대폰 인증 상태 머신.
 *
 * 설계 의도:
 * - 인증은 "값"이 아니라 "프로세스"다(발송→입력→검증→성공/실패/만료). 명시적 status 로 모델링해
 *   각 상태에서 가능한 동작만 허용한다.
 * - 만료 판단은 README 요구대로 "클라이언트 타이머"로만 한다(서버 발송 API 없음).
 * - **경합 차단**: 검증 응답은 0.5~1.5초 지연되므로 그 사이 타이머가 만료될 수 있다. 응답 콜백은
 *   `statusRef`(최신 상태)로 "아직 verifying 인가"를 재확인하고, 만료(expired)로 전이됐으면 응답을
 *   버린다. → "만료 후엔 성공/재시도 모두 불가"라는 불변식을 지킨다(verified+expired 같은 불가능 상태 차단).
 * - 자동 재시도 금지(retry:false): 인증 검증은 사용자가 의도적으로만 다시 시도해야 한다.
 */
export function usePhoneVerification(onVerified: () => void): UsePhoneVerification {
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // 콜백 클로저의 stale 값 문제를 피하기 위해 최신 status 를 ref 로도 추적한다.
  const statusRef = useRef<VerificationStatus>(status);

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
      if (mutation.isPending) return; // 중복 요청 방지
      if (statusRef.current !== 'sent' && statusRef.current !== 'failed') return; // 만료/성공/검증중엔 불가
      setErrorMessage(null);
      updateStatus('verifying');
      mutation.mutate(
        { mobile, code },
        {
          onSuccess: (res) => {
            // 응답 도착 시점에 이미 만료(또는 reset)됐다면 결과를 버린다 — 만료된 인증의 성공 확정 방지.
            if (statusRef.current !== 'verifying') return;
            if (res.verified) {
              clearTimer();
              updateStatus('verified');
              onVerified();
            } else {
              updateStatus('failed');
              setErrorMessage('인증번호가 일치하지 않습니다. 다시 확인해 주세요.');
            }
          },
          onError: (error) => {
            // 만료 등으로 더 이상 verifying 이 아니면 상태를 되돌리지 않는다(만료 유지).
            if (statusRef.current !== 'verifying') return;
            updateStatus('sent'); // 일시 오류 → 타이머 유지, 재시도 가능
            setErrorMessage(
              error instanceof HttpError && error.status >= 500
                ? '일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.'
                : '인증에 실패했어요. 다시 시도해 주세요.',
            );
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

  // 언마운트 시 타이머 정리(누수 방지)
  useEffect(() => () => clearTimer(), [clearTimer]);

  return { status, remainingSeconds, errorMessage, start, verify, reset };
}
