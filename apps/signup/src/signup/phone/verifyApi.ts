import { postJson } from '@artinus/lib';

export interface VerifyRequest {
  mobile: string;
  code: string;
}

export type VerifyResponse =
  | { verified: true }
  | { verified: false; reason: 'MISMATCH' };

/**
 * 휴대폰 인증번호 검증. (POST /api/verify, MSW 로 모킹)
 *
 * - 성공/불일치(코드 틀림)는 200 응답 → 여기서 정상 반환
 * - 일시적 오류는 500 → http 래퍼가 HttpError(status 500) 로 throw → 호출부에서 분기
 */
export function verifyCode(request: VerifyRequest): Promise<VerifyResponse> {
  return postJson<VerifyResponse>('/api/verify', request);
}
