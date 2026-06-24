import { useQuery } from '@tanstack/react-query';
import { fetchProduct } from '../api/products';

/** 단일 상품 상세 쿼리. id 가 유효한 수일 때만 활성화한다. */
export function useProduct(id: number) {
  return useQuery({
    queryKey: ['products', 'detail', id],
    queryFn: () => fetchProduct(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}
