import { parse, serialize, type SerializeOptions } from 'cookie';

/**
 * 타입 안전한 쿠키 헬퍼.
 *
 * 설계 의도:
 * - 로그인 성공 시 발급된 토큰을 저장하고, '로그인 상태 유지(remember me)' 여부에 따라
 *   수명을 조절하는 데 사용한다. (see docs/design-notes/0003-msw-and-cookie-session.md)
 * - localStorage 대신 쿠키를 택한 이유: maxAge 만료 시맨틱이 내장되어 "지속/세션" 구분이 자연스럽고,
 *   추후 서버 전달이 필요해지면 동일 API로 확장 가능하다.
 *   (트레이드오프: 4KB 용량 제한, 매 요청 전송 → 큰 데이터엔 부적합)
 * - `cookie` 패키지의 직렬화를 써서 인코딩/옵션 처리를 직접 구현하지 않는다.
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  return parse(document.cookie)[name];
}

export function setCookie(name: string, value: string, options: SerializeOptions = {}): void {
  if (typeof document === 'undefined') return;
  document.cookie = serialize(name, value, { path: '/', sameSite: 'lax', ...options });
}

export function removeCookie(name: string, options: SerializeOptions = {}): void {
  setCookie(name, '', { ...options, maxAge: 0 });
}
