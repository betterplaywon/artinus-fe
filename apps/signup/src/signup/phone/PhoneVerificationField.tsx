import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { PHONE_PATTERN, type SignupFormValues } from '../schema';
import { usePhoneVerification } from './usePhoneVerification';

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
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

  const { status, remainingSeconds, errorMessage, start, verify } = usePhoneVerification(() => {
    setValue('phoneVerified', true, { shouldValidate: true });
  });

  const isVerified = status === 'verified';
  const showCodeInput = status === 'sent' || status === 'verifying' || status === 'failed';
  const phoneValid = PHONE_PATTERN.test(phone ?? '');

  // 인증번호 받기/재전송 시 직전에 입력한(틀린) 코드를 비운다.
  const handleStart = () => {
    setCode('');
    start();
  };

  return (
    <Stack gap="xs">
      <Group align="flex-end" gap="sm" wrap="nowrap">
        <TextInput
          label="휴대폰 번호"
          placeholder="01012345678"
          withAsterisk
          flex={1}
          disabled={isVerified}
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Button variant="light" onClick={handleStart} disabled={isVerified || !phoneValid}>
          {status === 'idle' ? '인증번호 받기' : '재전송'}
        </Button>
      </Group>

      {showCodeInput ? (
        <Group align="flex-end" gap="sm" wrap="nowrap">
          <TextInput
            label="인증번호"
            placeholder="6자리 (테스트: 123456)"
            flex={1}
            value={code}
            onChange={(event) => setCode(event.currentTarget.value)}
            rightSection={
              remainingSeconds > 0 ? (
                <Text size="sm" c="red">
                  {formatTime(remainingSeconds)}
                </Text>
              ) : null
            }
            rightSectionWidth={52}
          />
          <Button
            onClick={() => verify(phone, code)}
            loading={status === 'verifying'}
            disabled={status === 'verifying' || remainingSeconds === 0 || code.length === 0}
          >
            확인
          </Button>
        </Group>
      ) : null}

      {isVerified ? (
        <Text c="green" size="sm">
          ✓ 인증이 완료되었습니다.
        </Text>
      ) : null}
      {status === 'expired' ? (
        <Text c="red" size="sm">
          인증 시간이 만료되었습니다. ‘재전송’을 눌러 다시 시도해 주세요.
        </Text>
      ) : null}
      {errorMessage ? (
        <Text c="red" size="sm">
          {errorMessage}
        </Text>
      ) : null}
    </Stack>
  );
}
