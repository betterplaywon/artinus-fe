/** DummyJSON 상품 도메인 타입. */
export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  category: string;
  thumbnail: string;
  images: string[];
  tags: string[];
}

/** 목록 카드에 필요한 최소 필드(요구사항: thumbnail, title, price). */
export type ProductListItem = Pick<Product, 'id' | 'title' | 'price' | 'thumbnail'>;

export interface ProductListResponse {
  products: ProductListItem[];
  total: number;
  skip: number;
  limit: number;
}
