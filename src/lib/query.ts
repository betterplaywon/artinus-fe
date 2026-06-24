import { QueryClient } from '@tanstack/react-query';

/**
 * 공용 QueryClient 팩토리.
 *
 * 설계 의도:
 * - 캐싱/재시도 기본값을 한 곳에서 정의한다.
 * - 로그인은 사용자 의도로만 재시도해야 하므로 mutation 단에서 retry:false 를 별도 지정한다.
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
