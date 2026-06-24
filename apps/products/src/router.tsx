import { createBrowserRouter } from 'react-router-dom';
import { ProductListPage } from './pages/ProductListPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';

/**
 * 라우트 정의.
 * - '/'             목록
 * - '/products/:id' 상세
 * - '*'             404
 *
 * 정적 호스팅(Vercel)에서는 모든 경로를 index.html 로 rewrite 하여(see vercel.json)
 * 새로고침/직접진입에도 SPA 라우팅이 동작한다.
 * (see docs/design-notes/0007-products-routing-and-lazyload.md)
 */
export const router = createBrowserRouter([
  { path: '/', element: <ProductListPage /> },
  { path: '/products/:id', element: <ProductDetailPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
