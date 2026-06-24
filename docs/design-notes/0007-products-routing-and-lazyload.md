# 0007. 상품 — react-router + IntersectionObserver 무한 스크롤

- 상태: 채택(Accepted)
- 날짜: 2026-06-24
- 맥락(앱/모듈): products

## 배경 / 문제
상품 앱은 목록 ↔ 상세 이동이 있고(SPA), 목록은 20개씩 **스크롤 기반 Lazy Load**가 필요하다.
정적 사이트(Vercel)로 배포한다.

## 결정
- **라우팅**: `react-router-dom` 7 을 라이브러리/SPA 모드로 사용(`createBrowserRouter`). `/`=목록, `/products/:id`=상세.
  정적 호스팅의 새로고침/직접진입을 위해 `vercel.json` 에서 모든 경로를 `index.html` 로 rewrite.
- **데이터**: `useInfiniteQuery` 로 페이징(skip/limit)을 추상화. 목록은 `select=id,title,price,thumbnail` 로
  필요한 필드만 받아 전송량을 줄인다(상세는 전체 필드).
- **무한 스크롤**: scroll 이벤트 throttle 대신 `@mantine/hooks` `useIntersection` 센티넬로 다음 페이지 트리거.
  `rootMargin:'200px'` 로 바닥 도달 전 선로딩.

## 고려한 대안
- **경량 쿼리파라미터 라우터(자작)** — 의존성 0·rewrite 불필요하나, 사용자가 react-router 를 선택.
  널리 알려져 "설명 가능성"이 높은 표준 선택이 과제에 더 적합.
- **해시 라우터** — 정적호스트 친화적이나 URL 미관/SEO 손해.
- **스크롤 이벤트 + 위치 계산** — IntersectionObserver 보다 부정확하고 비용이 큼.

## 트레이드오프
- 얻음: 표준적이고 설명 쉬운 라우팅. 정확하고 저렴한 무한 스크롤. 목록 전송량 절감.
- 포기: react-router-dom 의존성 추가(상품 앱 한정). 정적호스트에 SPA rewrite 설정 필요(vercel.json 한 줄).

## 영향
- `apps/products/src/{router.tsx,main.tsx,hooks/*,pages/*,api/*}`, `vercel.json`(rewrite + asset 캐시).
- 캐싱: 빌드 자산은 해시 파일명 + `Cache-Control: immutable`, 벤더 청크 분리로 재방문 캐시 적중↑.
- 라우트 코드 스플리팅(React.lazy)은 검토했으나 **보류**: 앱 청크가 ~6KB로 작아 분할 이득이 미미하고
  초기 페이로드 대부분은 벤더 청크(react/mantine)다. 페이지가 무거워지면 그때 도입한다.
- 가격 표기: DummyJSON `price` 는 통화 단위가 없어 데모상 USD($)로 가정한다(`Intl.NumberFormat`).
