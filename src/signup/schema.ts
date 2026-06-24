import { z } from 'zod';
import type { FieldKey, ServiceConfig } from '../services/types';
import { TERM_DEFS } from './terms';

// 설정 기반 동적 스키마 합성 + 제출 게이트. 설계 근거는 README '확장성 설계'/'제출 게이트'
// 및 ADR 0003(config-driven), 0004(formState.isValid 게이트) 참조.

/**
 * 폼 값 타입 — 모든 서비스 필드의 합집합. (서비스는 일부만 렌더하지만 타입·기본값은 전체를 유지해
 * 입력을 항상 controlled 로 둔다.) phoneVerified·약관도 폼 필드로 둬서 제출 게이트를 isValid 한 값에 수렴시킨다.
 */
export interface SignupFormValues {
  id: string;
  password: string;
  passwordConfirm: string;
  birthdate: string;
  phone: string;
  phoneVerified: boolean;
  tos: boolean;
  privacy: boolean;
  age14: boolean;
  marketing: boolean;
}

export const DEFAULT_VALUES: SignupFormValues = {
  id: '',
  password: '',
  passwordConfirm: '',
  birthdate: '',
  phone: '',
  phoneVerified: false,
  tos: false,
  privacy: false,
  age14: false,
  marketing: false,
};

export const PHONE_PATTERN = /^01[016789]\d{7,8}$/;

/**
 * YYYY-MM-DD 가 "실재하는 과거 날짜"인지 검증한다.
 * 정규식 + Date.parse 만으로는 2026-02-30(3월로 롤오버)·미래 날짜가 통과하므로,
 * 구성요소 일치(오버플로 차단) + 오늘 이전 + 합리적 하한(1900)을 함께 확인한다.
 */
function isRealPastDate(value: string): boolean {
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return false;
  const date = new Date(y, m - 1, d);
  const componentsMatch =
    date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  return componentsMatch && y >= 1900 && date.getTime() <= Date.now();
}

/**
 * 필드별 zod 조각. 일부 필드는 부수 키를 함께 기여한다.
 * (phone → 번호 형식 검증 + phoneVerified 게이트)
 */
const FIELD_SCHEMAS: Record<FieldKey, Record<string, z.ZodTypeAny>> = {
  id: {
    id: z
      .string()
      .min(4, '아이디는 4자 이상이어야 합니다.')
      .max(20, '아이디는 20자 이하여야 합니다.')
      .regex(/^[A-Za-z0-9_]+$/, '영문/숫자/밑줄(_)만 사용할 수 있습니다.'),
  },
  password: {
    password: z
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다.')
      .regex(/[A-Za-z]/, '영문을 포함해야 합니다.')
      .regex(/\d/, '숫자를 포함해야 합니다.'),
  },
  passwordConfirm: {
    passwordConfirm: z.string().min(1, '비밀번호를 다시 입력해 주세요.'),
  },
  birthdate: {
    birthdate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '생년월일을 입력해 주세요.')
      .refine(isRealPastDate, '유효한 생년월일이 아닙니다. (미래·존재하지 않는 날짜 불가)'),
  },
  phone: {
    phone: z.string().regex(PHONE_PATTERN, '올바른 휴대폰 번호를 입력해 주세요.'),
    phoneVerified: z.boolean().refine((value) => value === true, '휴대폰 인증을 완료해 주세요.'),
  },
};

// 서비스 설정 → zod 스키마 동적 합성: 필드 조각 + 약관(필수=true 강제) 을 모으고,
// 비밀번호 확인 필드가 있으면 교차 검증(refine)을 더한다.
export function buildSignupSchema(service: ServiceConfig): z.ZodType<SignupFormValues, SignupFormValues> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const key of service.fields) {
    Object.assign(shape, FIELD_SCHEMAS[key]);
  }
  for (const termKey of service.terms) {
    const def = TERM_DEFS[termKey];
    shape[termKey] = def.required
      ? z.boolean().refine((value) => value === true, `${def.label}에 동의해 주세요.`)
      : z.boolean();
  }

  const base = z.object(shape);

  const schema = service.fields.includes('passwordConfirm')
    ? base.refine(
        (value) => {
          const v = value as unknown as SignupFormValues;
          return v.password === v.passwordConfirm;
        },
        { message: '비밀번호가 일치하지 않습니다.', path: ['passwordConfirm'] },
      )
    : base;

  // 동적 합성 스키마라 정적 추론이 Record 형태로 떨어진다. 폼 값 타입으로 단언해
  // react-hook-form(zodResolver)의 제네릭과 맞춘다. (런타임 객체는 그대로 유효한 zod 스키마)
  return schema as unknown as z.ZodType<SignupFormValues, SignupFormValues>;
}
