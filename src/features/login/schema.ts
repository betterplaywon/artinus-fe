import { z } from 'zod';

// 설계 의도: 로그인 식별자는 이메일 또는 아이디 둘 다 허용(형식 분기 검증)
// (see docs/design-notes/0002-login-identifier-email-or-username.md)

export const USERNAME_PATTERN = /^[A-Za-z0-9_]{4,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}
export function isUsername(value: string): boolean {
  return USERNAME_PATTERN.test(value);
}

export interface LoginFormValues {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

export const DEFAULT_VALUES: LoginFormValues = {
  identifier: '',
  password: '',
  rememberMe: false,
};

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, '이메일 또는 아이디를 입력해 주세요.')
    .refine(
      (value) => isEmail(value) || isUsername(value),
      '올바른 이메일 또는 아이디(영문/숫자 4–20자)를 입력해 주세요.',
    ),
  // 로그인은 정책(복잡도)을 노출하지 않도록 "필수 입력"만 검증한다. 실제 검증은 서버(여기선 MSW) 몫.
  password: z.string().min(1, '비밀번호를 입력해 주세요.'),
  rememberMe: z.boolean(),
});
