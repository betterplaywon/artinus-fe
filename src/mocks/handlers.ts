import { delay, http, HttpResponse } from 'msw';

interface LoginBody {
  identifier: string;
  password: string;
}

const TEST_ACCOUNTS = ['test@artinus.dev', 'artinus_user'];
const TEST_PASSWORD = 'password123';

/**
 * Mock 로그인 API.
 * - 테스트 계정 + 올바른 비밀번호 → 200 { token, user }
 * - 비밀번호 'error'            → 500 (일시 오류 데모 → "다시 시도" 안내)
 * - 그 외                        → 401 { error: 'INVALID_CREDENTIALS' }
 * - 응답은 0.5~1.5초 랜덤 지연.
 */
export const handlers = [
  http.post('/api/login', async ({ request }) => {
    const { identifier, password } = (await request.json()) as LoginBody;
    await delay(500 + Math.random() * 1000);

    if (password === 'error') {
      return HttpResponse.json({ error: 'INTERNAL' }, { status: 500 });
    }
    if (TEST_ACCOUNTS.includes(identifier) && password === TEST_PASSWORD) {
      return HttpResponse.json({
        token: 'mock-jwt-token',
        user: { id: 'u1', name: 'ARTINUS 사용자', identifier },
      });
    }
    return HttpResponse.json({ error: 'INVALID_CREDENTIALS' }, { status: 401 });
  }),
];
