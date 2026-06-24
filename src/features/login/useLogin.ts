import { useMutation } from '@tanstack/react-query';
import { setCookie } from '@/lib';
import { login, type LoginUser } from './api';

export const AUTH_COOKIE = 'artinus_auth';
/** remember-me 지속 쿠키 수명: 30일. */
const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30;

interface LoginVars {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

/**
 * 로그인 mutation.
 *
 * 설계 의도:
 * - 성공 시 토큰을 쿠키에 저장한다. remember-me 면 30일 지속 쿠키, 아니면 세션 쿠키(maxAge 미지정).
 * - 자동 재시도 금지(retry:false): 인증은 사용자 의도로만 재시도해야 한다.
 *   (mutation.isPending 으로 로딩/중복요청 방지는 호출부 버튼에서 처리)
 */
export function useLogin(onLoggedIn: (user: LoginUser) => void) {
  return useMutation({
    mutationFn: ({ identifier, password }: LoginVars) => login({ identifier, password }),
    retry: false,
    onSuccess: (data, vars) => {
      setCookie(AUTH_COOKIE, data.token, vars.rememberMe ? { maxAge: REMEMBER_MAX_AGE } : {});
      onLoggedIn(data.user);
    },
  });
}
