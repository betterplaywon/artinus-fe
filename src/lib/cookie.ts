import { parse, serialize, type SerializeOptions } from 'cookie';

/**
 * 타입 안전한 쿠키 헬퍼.
 *
 * 설계 의도:
 * - 지정 스택에 포함된 `cookie` 를 한 곳에서 타입 안전하게 감싼 공용 유틸. 직렬화/옵션 처리를
 *   직접 구현하지 않고 `cookie` 패키지에 위임한다.
 * - **현재 회원가입 플로우에는 직접 배선돼 있지 않다(미사용).** 의도한 용도는 "수명 있는 가벼운
 *   클라이언트 상태"(예: 입력 임시저장, 최근 선택 서비스)이며, 해당 기능 구현 시 사용한다.
 * - localStorage 대비 쿠키 이점: maxAge 만료 시맨틱 내장. 트레이드오프: 4KB 제한, 매 요청 전송.
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
