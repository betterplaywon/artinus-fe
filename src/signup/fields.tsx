import { useFormContext } from 'react-hook-form';
import { PasswordInput, TextInput } from '@mantine/core';
import type { SignupFormValues } from './schema';

// 입력 항목 컴포넌트들. 각 필드는 useFormContext 로 폼에 연결돼 등록·에러 표시를 자급한다.
// (키→컴포넌트 매핑은 fieldRegistry.ts. 이 파일은 컴포넌트만 export — react-refresh 호환)

export function IdField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SignupFormValues>();
  return (
    <TextInput
      label="아이디"
      placeholder="영문/숫자 4–20자"
      withAsterisk
      error={errors.id?.message}
      {...register('id')}
    />
  );
}

export function PasswordField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SignupFormValues>();
  return (
    <PasswordInput
      label="비밀번호"
      placeholder="8자 이상, 영문+숫자 조합"
      withAsterisk
      error={errors.password?.message}
      {...register('password')}
    />
  );
}

export function PasswordConfirmField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SignupFormValues>();
  return (
    <PasswordInput
      label="비밀번호 확인"
      placeholder="비밀번호를 다시 입력"
      withAsterisk
      error={errors.passwordConfirm?.message}
      {...register('passwordConfirm')}
    />
  );
}

export function BirthdateField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SignupFormValues>();
  return (
    <TextInput
      type="date"
      label="생년월일"
      withAsterisk
      // 네이티브 피커에서도 미래 날짜 선택을 막는다(스키마 검증과 이중 방어).
      max={new Date().toISOString().slice(0, 10)}
      error={errors.birthdate?.message}
      {...register('birthdate')}
    />
  );
}
