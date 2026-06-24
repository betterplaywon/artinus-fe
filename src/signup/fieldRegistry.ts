import type { ComponentType } from 'react';
import type { FieldKey } from '../services/types';
import { BirthdateField, IdField, PasswordConfirmField, PasswordField } from './fields';
import { PhoneVerificationField } from './phone/PhoneVerificationField';

/**
 * 입력 항목 컴포넌트 레지스트리 — 필드 키 → 컴포넌트.
 *
 * 폼(SignupForm)은 서비스 설정의 fields 배열을 순회하며 이 맵으로 렌더만 한다.
 * → 항목 추가/순서 변경이 이 레지스트리·설정 편집만으로 끝난다.
 */
export const FIELD_COMPONENTS: Record<FieldKey, ComponentType> = {
  id: IdField,
  password: PasswordField,
  passwordConfirm: PasswordConfirmField,
  birthdate: BirthdateField,
  phone: PhoneVerificationField,
};
