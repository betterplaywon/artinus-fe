import { QueryClient } from '@tanstack/react-query';

/**
 * 공용 QueryClient 팩토리.
 *
 * 설계 의도:
 * - 두 앱이 동일한 캐싱/재시도 기본값을 공유하도록 한 곳에서 정의한다.
 * - staleTime 60초: 상품 목록/상세, 인증 응답 모두 짧은 시간 내 재요청 가치가 낮다.
 *   불필요한 네트워크 호출과 깜빡임을 줄인다. (트레이드오프: 실시간성 ↓ — 과제 특성상 허용)
 * - retry 1: 일시적 오류(예: /api/verify 500)에 1회 자동 재시도. 단, 인증 검증처럼
 *   "사용자 의도로만 재시도해야 하는" 호출은 호출부에서 retry:false 로 개별 차단한다.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}
