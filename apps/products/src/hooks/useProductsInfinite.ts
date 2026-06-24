import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchProducts } from '../api/products';

/**
 * 무한 스크롤용 상품 목록 쿼리.
 *
 * 설계 의도:
 * - 페이징(skip/limit)을 react-query 의 useInfiniteQuery 로 추상화한다.
 *   페이지 누적·다음 페이지 존재 판단·로딩 상태를 라이브러리가 관리하므로,
 *   화면은 "다음 페이지를 불러와라(fetchNextPage)"만 호출하면 된다.
 * - getNextPageParam: (skip+limit) >= total 이면 undefined → 더 이상 로드하지 않는다.
 */
export function useProductsInfinite() {
  return useInfiniteQuery({
    queryKey: ['products', 'list'],
    queryFn: ({ pageParam }) => fetchProducts({ skip: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.skip + lastPage.limit;
      return loaded < lastPage.total ? loaded : undefined;
    },
    // 목록 항목은 PAGE_SIZE 단위로만 의미가 있으므로 maxPages 미설정(전체 누적 유지).
    select: (data) => ({
      items: data.pages.flatMap((page) => page.products),
      total: data.pages[0]?.total ?? 0,
    }),
  });
}
