# @artinus/products — 상품 목록 · 상세

DummyJSON 기반 상품 목록(무한 스크롤) + 상세 페이지. Vite SPA + react-router-dom.

## 실행
```bash
pnpm dev:products      # 개발 서버
pnpm build:products    # 프로덕션 빌드 (tsc + vite build → dist/)
```
환경변수: `VITE_API_BASE_URL`(미설정 시 `https://dummyjson.com`). `.env.example` 참고.

## 구조
```
src/
  api/        DummyJSON 호출 + 도메인 타입 (목록은 select 로 필드 최소화)
  hooks/      useProductsInfinite(useInfiniteQuery), useProduct
  components/ ProductCard
  pages/      ProductListPage(무한 스크롤), ProductDetailPage, NotFoundPage
  router.tsx  / = 목록, /products/:id = 상세
```

## 설계 하이라이트
- 무한 스크롤: IntersectionObserver(`@mantine/hooks`) 센티넬, `rootMargin` 선로딩 → [ADR 0007](../../docs/design-notes/0007-products-routing-and-lazyload.md)
- 캐싱 최적화: 벤더 청크 분리(manualChunks) + 해시 자산 `Cache-Control: immutable`(vercel.json)
- 로딩/에러는 공용 `@artinus/ui`(Spinner/ErrorState) 사용

## 배포 (Vercel)
Root Directory = `apps/products`. `vercel.json` 이 SPA rewrite + 자산 캐시 헤더를 설정한다.
