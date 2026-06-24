# @artinus/signup — 서비스별 회원가입

커뮤니티/뉴스/쇼핑 회원가입을 **하나의 코드베이스 + 설정 기반**으로 구현. Vite 멀티엔트리(서비스별 독립 HTML).

## 실행
```bash
pnpm dev:signup        # 개발 서버 (index=허브, /community.html · /news.html · /shopping.html)
pnpm build:signup      # 빌드 → dist/{index,community,news,shopping}.html
```
> MSW 워커 파일은 `public/mockServiceWorker.js`. 최초 1회 `pnpm --filter @artinus/signup exec msw init public` 로 생성.

## 구조
```
src/
  services/   registry.ts(서비스별 선언) · types.ts(ServiceId/FieldKey/TermKey)
  signup/     schema.ts(동적 zod 합성) · fields.tsx(필드 레지스트리) · terms.ts
              SignupForm/SignupPage/ServiceBanner/TermsAgreement
              phone/ usePhoneVerification(상태머신) · PhoneVerificationField · verifyApi
  mocks/      handlers.ts(/api/verify) · browser.ts(setupWorker)
  app/        bootstrap.tsx(공유 마운트) — 엔트리는 serviceId 만 다름
  entries/    community/news/shopping/index .tsx
```

## 설계 하이라이트
- 설정 기반 확장: 새 서비스/항목/약관 = 레지스트리 편집 → [ADR 0003](../../docs/design-notes/0003-signup-config-driven-architecture.md) · `/add-signup-service`
- 제출 게이트: 인증·약관도 폼 필드로 두어 `formState.isValid` 한 값에 수렴 → [ADR 0004](../../docs/design-notes/0004-form-validity-as-submit-gate.md)
- 휴대폰 인증 상태머신(3분 타이머·중복요청 방지·일시오류 재시도) → [ADR 0005](../../docs/design-notes/0005-phone-verification-state-machine.md)
- MSW 는 `/api/verify` 전용(실서버 없음) → [ADR 0006](../../docs/design-notes/0006-msw-scope-verify-only.md)

## 배포 (Vercel)
Root Directory = `apps/signup`. 멀티엔트리 정적 산출물을 그대로 서빙. `mockServiceWorker.js` 는 no-cache.
