import { parse, serialize, type SerializeOptions } from 'cookie';

/**
 * 타입 안전한 쿠키 헬퍼 (공용 프리미티브).
 *
 * 설계 의도:
 * - 지정 스택에 포함된 `cookie` 를 한 곳에서 타입 안전하게 감싼 공용 유틸. 직렬화/옵션 처리를
 *   직접 구현하지 않고 `cookie` 패키지에 위임한다.
 * - **현재 스캐폴드 단계에서는 특정 기능에 아직 배선되지 않았다(미사용).** 의도한 용도는
 *   "수명이 있는 가벼운 클라이언트 상태"(예: 최근 본 상품/서비스, 입력 임시저장)이며,
 *   해당 기능 구현 시 이 유틸을 사용한다.
 * - localStorage 대비 쿠키 이점: maxAge 만료 시맨틱 내장(수명 있는 값에 적합), 필요 시 서버 전달 확장 용이.
 *   트레이드오프: 4KB 용량 제한, 매 요청 전송 → 큰 데이터엔 부적합.
 * - 주의: 휴대폰 인증 상태는 보안/단순성상 쿠키가 아니라 폼/컴포넌트 상태로만 관리한다
 *   (see docs/design-notes/0005-phone-verification-state-machine.md).
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
