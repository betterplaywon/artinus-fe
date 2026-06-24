import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { HttpError } from '../../lib';
import { verifyCode } from './verifyApi';

// 휴대폰 인증 상태 머신. 상태를 4개로 줄인 근거·경합 처리·대안 비교는 README '휴대폰 인증' / ADR 0005 참조.

/** 인증 제한 시간(초). 요구사항: 3분 카운트다운. */
export const VERIFICATION_SECONDS = 180;

export type VerificationStatus =
  | 'idle' // 인증 시작 전
  | 'sent' // 코드 입력 대기(타이머 진행) — 불일치·일시오류도 이 상태에 머문다(errorMessage 로 안내)
  | 'verified' // 인증 성공
  | 'expired'; // 타이머 만료

export interface UsePhoneVerification {
  status: VerificationStatus;
  /** 검증 요청 진행 중 (= useMutation.isPending 파생). 별도 상태로 두지 않는다. */
  isVerifying: boolean;
  remainingSeconds: number;
  errorMessage: string | null;
  start: () => void;
  verify: (mobile: string, code: string) => void;
  reset: () => void;
}

/** 검증 실패(onError) 사유 → 안내 문구. 5xx 는 일시 오류, 그 외는 일반 실패. */
function verifyErrorMessage(error: unknown): string {
  if (error instanceof HttpError && error.status >= 500) {
    return '일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.';
  }
  return '인증에 실패했어요. 다시 시도해 주세요.';
}

export function usePhoneVerification(onVerified: () => void): UsePhoneVerification {
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // 비동기 콜백의 stale 클로저를 피해 최신 status 를 동기로 읽는 ref(경합 차단용).
  const statusRef = useRef<VerificationStatus>(status);
  // 같은 틱 내 중복 제출 차단용(isPending 은 다음 렌더 반영이라 동기 보호엔 부족).
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
    // 만료 절대시각 기준으로 매 틱 남은 초를 파생한다. setState 업데이터는 순수하게 두고,
    // 만료 전이(부수효과)는 업데이터 밖에서 한 번만 실행한다. (백그라운드 탭 throttling 에도 정확)
    const expiresAt = Date.now() + VERIFICATION_SECONDS * 1000;
    intervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining === 0) {
        clearTimer();
        updateStatus('expired');
        setErrorMessage(null); // 만료 안내 하나만 남기고 직전 불일치 에러는 정리
      }
    }, 1000);
  }, [clearTimer, updateStatus]);

  const mutation = useMutation({
    mutationFn: ({ mobile, code }: { mobile: string; code: string }) => verifyCode({ mobile, code }),
    retry: false, // 인증 검증은 사용자가 의도적으로만 재시도(자동 재시도 금지).
  });
  // mutate 만 의존한다 — mutation 객체 전체는 렌더마다 새 참조라 의존성에 넣으면 메모이제이션이 무효가 된다.
  const { mutate } = mutation;

  const verify = useCallback(
    (mobile: string, code: string) => {
      if (pendingRef.current) return; // 동기 중복 요청 방지
      if (statusRef.current !== 'sent') return; // 코드 입력 대기 중에만 검증(만료/성공/유휴 제외)
      pendingRef.current = true;
      setErrorMessage(null);
      mutate(
        { mobile, code },
        {
          onSuccess: (res) => {
            // 응답 도착 시 이미 만료(또는 reset)됐다면 결과를 버린다 — 만료된 인증의 성공 확정 방지.
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
    [mutate, clearTimer, updateStatus, onVerified],
  );

  const reset = useCallback(() => {
    clearTimer();
    updateStatus('idle');
    setRemainingSeconds(0);
    setErrorMessage(null);
  }, [clearTimer, updateStatus]);

  // 언마운트 시 타이머 정리(누수 방지) + 동기 잠금 해제.
  useEffect(
    () => () => {
      clearTimer();
      pendingRef.current = false;
    },
    [clearTimer],
  );

  return { status, isVerifying: mutation.isPending, remainingSeconds, errorMessage, start, verify, reset };
}
