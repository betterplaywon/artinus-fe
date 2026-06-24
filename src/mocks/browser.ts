import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * MSW 워커. 휴대폰 인증의 모킹 백엔드(실제 서버 없음)이므로 dev/prod 모두에서 기동한다.
 * (정적 배포에서도 브라우저 내 서비스워커가 /api/verify 를 가로챈다)
 */
export const worker = setupWorker(...handlers);
