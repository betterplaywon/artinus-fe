import type { ComponentType } from 'react';
import type { FieldKey } from '../services/types';
import { BirthdateField, IdField, PasswordConfirmField, PasswordField } from './fields';
import { PhoneVerificationField } from './phone/PhoneVerificationField';

// 입력 항목 레지스트리(필드 키 → 컴포넌트). 폼은 서비스 설정의 fields 를 순회하며 이 맵으로 렌더만 한다.
export const FIELD_COMPONENTS: Record<FieldKey, ComponentType> = {
  id: IdField,
  password: PasswordField,
  passwordConfirm: PasswordConfirmField,
  birthdate: BirthdateField,
  phone: PhoneVerificationField,
};
