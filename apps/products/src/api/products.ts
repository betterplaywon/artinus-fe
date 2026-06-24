import { httpJson } from '@artinus/lib';
import type { Product, ProductListResponse } from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://dummyjson.com';

/** 요구사항: 20개씩 로드. */
export const PAGE_SIZE = 20;

export interface FetchProductsParams {
  skip: number;
  limit?: number;
}

/**
 * 상품 목록 조회.
 *
 * 설계 의도:
 * - `select` 쿼리로 목록에 필요한 필드(id,title,price,thumbnail)만 받아 전송량을 줄인다.
 *   (history 스펙의 "파일 크기/전송 최적화"를 API 호출 단계에서 선반영)
 */
export function fetchProducts({ skip, limit = PAGE_SIZE }: FetchProductsParams): Promise<ProductListResponse> {
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
    select: 'id,title,price,thumbnail',
  });
  return httpJson<ProductListResponse>(`${BASE_URL}/products?${params.toString()}`);
}

/** 상품 상세 조회(전체 필드). */
export function fetchProduct(id: number): Promise<Product> {
  return httpJson<Product>(`${BASE_URL}/products/${id}`);
}
