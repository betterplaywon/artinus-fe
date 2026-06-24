import { delay, http, HttpResponse } from 'msw';

interface VerifyBody {
  mobile: string;
  code: string;
}

/**
 * Mock API 핸들러 (README 계약 그대로 구현).
 *
 * POST /api/verify
 * - code === "123456" → 인증 성공      : 200 { verified: true }
 * - code === "999999" → 일시적 오류    : 500 { error: "INTERNAL" }
 * - 그 외             → 인증 실패(불일치): 200 { verified: false, reason: "MISMATCH" }
 * - 응답은 0.5~1.5초 랜덤 지연.
 */
export const handlers = [
  http.post('/api/verify', async ({ request }) => {
    const { code } = (await request.json()) as VerifyBody;

    await delay(500 + Math.random() * 1000);

    if (code === '123456') {
      return HttpResponse.json({ verified: true });
    }
    if (code === '999999') {
      return HttpResponse.json({ error: 'INTERNAL' }, { status: 500 });
    }
    return HttpResponse.json({ verified: false, reason: 'MISMATCH' });
  }),
];
