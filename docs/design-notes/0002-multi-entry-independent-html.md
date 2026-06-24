# 0002. 멀티엔트리 — 서비스별 독립 HTML (라우팅 아님)

- 상태: 채택(Accepted)
- 날짜: 2026-06-24
- 맥락(앱/모듈): signup

## 배경 / 문제
README 요구: "라우팅 기반 분리가 아닌, 서비스별로 독립된 HTML 산출물(`dist/community.html` 등)".
단일 패키지 안에서 서비스(커뮤니티/뉴스/쇼핑)를 어떻게 나눠 빌드할지 정해야 한다.

## 결정
Vite `build.rollupOptions.input` 에 서비스별 HTML 을 등록하는 **멀티엔트리(MPA)** 로 빌드한다.
각 HTML 은 `serviceId` 만 다른 얇은 엔트리(`src/entries/*.tsx`)를 로드하고, 마운트 로직은 `app/bootstrap.tsx`로 공유한다.
→ `dist/{community,news,shopping,index}.html` 이 각각 독립 번들로 생성된다.

## 고려한 대안
- **react-router 로 `/community` 등 경로 분리** — 단일 HTML(SPA)이 되어 "서비스별 독립 HTML 산출물" 요구에 정면으로 어긋난다.
- **서비스마다 별도 앱(모노레포)** — 독립 산출물은 되지만 앱이 늘고 공유가 어려워진다(→ [0001](0001-single-package-not-monorepo.md)).

## 트레이드오프
- 얻음: 요구사항(독립 HTML) 충족 + 공통 로직 100% 공유. 라우터 의존성 불필요.
- 포기: 서비스 간 클라이언트 사이드 네비게이션(필요 없음 — 각 서비스는 독립 진입).

## 영향
- `vite.config.ts`(input), 루트 `*.html`, `src/entries/*`, `src/app/bootstrap.tsx`.
- 새 서비스 = HTML 1 + 엔트리 1 + vite input 1 + 레지스트리 1항목 (→ [0003](0003-signup-config-driven-architecture.md), `/add-signup-service`).
