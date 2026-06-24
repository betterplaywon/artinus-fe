import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * MSW 워커. 로그인 API(/api/login)의 모킹 백엔드(실서버 없음)이므로 dev/prod 모두에서 기동한다.
 */
export const worker = setupWorker(...handlers);
