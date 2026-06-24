import type { ComponentType } from 'react';
import { useFormContext } from 'react-hook-form';
import { PasswordInput, TextInput } from '@mantine/core';
import type { FieldKey } from '../services/types';
import type { SignupFormValues } from './schema';
import { PhoneVerificationField } from './phone/PhoneVerificationField';

/**
 * 입력 항목 컴포넌트 레지스트리.
 *
 * 설계 의도:
 * - 필드 키 → 컴포넌트 매핑으로, 폼은 서비스 설정의 fields 배열을 순회하며 렌더만 한다.
 * - 각 필드는 useFormContext 로 폼에 연결되어 등록/에러 표시를 자급한다.
 *   → 항목 추가/순서 변경이 레지스트리·설정 편집만으로 끝난다.
 */

function IdField() {
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

function PasswordField() {
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

function PasswordConfirmField() {
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

function BirthdateField() {
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

export const FIELD_COMPONENTS: Record<FieldKey, ComponentType> = {
  id: IdField,
  password: PasswordField,
  passwordConfirm: PasswordConfirmField,
  birthdate: BirthdateField,
  phone: PhoneVerificationField,
};
