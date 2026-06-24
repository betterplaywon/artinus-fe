import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button, Flex, Stack, Text, TextInput } from '@mantine/core';
import { PHONE_PATTERN, type SignupFormValues } from '../schema';
import { usePhoneVerification, type VerificationStatus } from './usePhoneVerification';

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

// 입력+버튼 행: base 세로 스택(좁은 폭 줄깨짐·터치영역) / sm 가로. 전환점은 페이지와 sm 로 통일. (ADR 0007)
const ROW_DIRECTION = { base: 'column', sm: 'row' } as const;
const ROW_ALIGN = { base: 'stretch', sm: 'flex-end' } as const;
const INPUT_GROW = { sm: 1 } as const; // 가로 모드에서만 남는 공간을 채운다

// 인증 피드백. verified/expired/errorMessage 는 상태 머신상 상호배타라(성공·만료 시 errorMessage 정리)
// 흩어진 삼항 대신 "상태 → {색, 메시지}" 단일 매핑으로 환원한다.
type Feedback = { color: 'green' | 'red'; message: string };

const STATUS_FEEDBACK: Partial<Record<VerificationStatus, Feedback>> = {
  verified: { color: 'green', message: '✓ 인증이 완료되었습니다.' },
  expired: { color: 'red', message: '인증 시간이 만료되었습니다. ‘재전송’을 눌러 다시 시도해 주세요.' },
};

// 정적 안내(성공/만료)가 있으면 그것을, 없으면 동적 errorMessage(불일치·일시오류)를, 둘 다 없으면 null.
function selectFeedback(status: VerificationStatus, errorMessage: string | null): Feedback | null {
  const staticFeedback = STATUS_FEEDBACK[status];
  if (staticFeedback) return staticFeedback;
  if (errorMessage) return { color: 'red', message: errorMessage };
  return null;
}

/**
 * 휴대폰 인증 필드 — 번호 입력 → 인증번호 받기 → 코드 입력/검증 흐름.
 *
 * 폼 연동: 검증 성공 시 setValue('phoneVerified', true) 로 제출 게이트를 충족시킨다.
 * (인증 상태 자체는 usePhoneVerification 이 관리하고, 폼에는 결과만 반영)
 */
export function PhoneVerificationField() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<SignupFormValues>();
  const [code, setCode] = useState('');
  const phone = watch('phone');

  // isVerifying(검증 진행 중)은 useMutation.isPending 에서 파생된다 — 컴포넌트는 로딩 상태를 손수 관리하지 않는다.
  const { status, isVerifying, remainingSeconds, errorMessage, start, verify } = usePhoneVerification(
    () => {
      setValue('phoneVerified', true, { shouldValidate: true });
    },
  );

  const isVerified = status === 'verified';
  const showCodeInput = status === 'sent'; // 코드 입력/검증/불일치/일시오류 모두 'sent' 한 상태로 수렴
  const phoneValid = PHONE_PATTERN.test(phone ?? '');

  // 현재 상태에서 노출할 안내 하나(없으면 null).
  const feedback = selectFeedback(status, errorMessage);

  // 확인(검증) 버튼 비활성: 검증 중이거나, 타이머 만료, 또는 코드 미입력. (긴 불리언을 의미 있는 이름으로)
  const cannotVerify = isVerifying || remainingSeconds === 0 || code.length === 0;

  // 인증번호 받기/재전송 시 직전에 입력한(틀린) 코드를 비운다.
  const handleStart = () => {
    setCode('');
    start();
  };

  return (
    <Stack gap="xs">
      <Flex direction={ROW_DIRECTION} align={ROW_ALIGN} gap="sm">
        <TextInput
          label="휴대폰 번호"
          placeholder="01012345678"
          withAsterisk
          flex={INPUT_GROW}
          disabled={isVerified}
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Button
          variant="light"
          onClick={handleStart}
          // 검증 요청 진행 중엔 재전송 차단 — 진행 중 요청을 무효화하는 경합을 막는다.
          disabled={isVerified || isVerifying || !phoneValid}
        >
          {status === 'idle' ? '인증번호 받기' : '재전송'}
        </Button>
      </Flex>

      {showCodeInput && (
        <Flex direction={ROW_DIRECTION} align={ROW_ALIGN} gap="sm">
          <TextInput
            label="인증번호"
            placeholder="6자리 (테스트: 123456)"
            flex={INPUT_GROW}
            value={code}
            onChange={(event) => setCode(event.currentTarget.value)}
            rightSection={
              remainingSeconds > 0 && (
                <Text size="sm" c="red">
                  {formatTime(remainingSeconds)}
                </Text>
              )
            }
            rightSectionWidth={52}
          />
          <Button onClick={() => verify(phone, code)} loading={isVerifying} disabled={cannotVerify}>
            확인
          </Button>
        </Flex>
      )}

      {feedback && (
        <Text c={feedback.color} size="sm">
          {feedback.message}
        </Text>
      )}
    </Stack>
  );
}
