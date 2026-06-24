# CLAUDE.md — ARTINUS 프론트엔드 과제 (회원가입)

이 파일은 이 저장소에서 작업하는 모든 에이전트/세션의 공통 규칙이다.

## 0. 가장 중요한 원칙 — 설계 의도를 설명할 수 있어야 한다
평가의 핵심은 코드의 정확성만이 아니라 **"왜 그렇게 만들었는지 설명할 수 있는가"** 다. 따라서:
- 비자명한 로직/기술선택/UI 위에는 **한국어 인라인 주석으로 "설계 의도"**(이유·대안·트레이드오프)를 남긴다.
- 아키텍처/패턴 수준의 결정은 **`/design-note` 스킬로 ADR**(`docs/design-notes/`)을 작성한다.
- "동작하지만 설명 못 하는 코드"보다 "단순하고 의도가 분명한 코드"를 택한다.

## 1. 프로젝트 개요
서비스별(커뮤니티/뉴스/쇼핑) **회원가입 페이지**를 구현하는 단일 React + TS 앱. **pnpm(워크스페이스 아님)**.
**멀티엔트리**로 서비스별 독립 HTML 을 산출한다(라우팅 아님).
> 이전엔 상품/회원가입을 모노레포로 구성했으나 범위가 회원가입 1개로 축소되어 단일 패키지로 재구성했다.
> 배경: [ADR 0001](docs/design-notes/0001-single-package-not-monorepo.md), [ADR 0002](docs/design-notes/0002-multi-entry-independent-html.md).

구조:
```
index.html(허브) · community.html · news.html · shopping.html
vite.config.ts(멀티엔트리) · tsconfig.json · vercel.json · postcss.config.cjs · eslint.config.js
public/mockServiceWorker.js
src/
  entries/      community·news·shopping·index (serviceId 만 다름)
  app/          bootstrap.tsx (공유 마운트 + MSW 기동)
  services/     registry·types (서비스 선언 = 단일 진실 공급원)
  signup/       schema(동적 zod 합성)·fields·terms·SignupForm·SignupPage·ServiceBanner·TermsAgreement·phone/(인증 상태머신)
  mocks/        MSW /api/verify
  lib/          http·cookie·query     ui/  theme·Spinner·ErrorState
```
`@/` → `src` 경로 별칭(tsconfig paths + vite alias).

## 2. 스택 (고정 — 임의 추가 금지)
React 19 · TypeScript 6(strict) · Vite 8 · pnpm · Mantine 9 · @tanstack/react-query 5 ·
react-hook-form 7 + zod 4 · MSW 2 · cookie. **라우터 없음**(서비스 구분은 멀티엔트리 HTML).

## 3. 명령어
```bash
pnpm install
pnpm dev          # index(허브) + /community.html · /news.html · /shopping.html
pnpm build        # tsc --noEmit + vite build → dist/{index,community,news,shopping}.html
pnpm typecheck
pnpm lint
```

## 4. 코드 규칙
- **타입**: strict + `noUncheckedIndexedAccess` + `verbatimModuleSyntax`. 타입 전용 import 는 `import type`. `any` 회피.
- **검증은 실행으로 증명**: 완료 전 `typecheck`/`build` 를 실제로 돌린다. 통과를 가정하지 않는다.
- 주석/문서/커밋 메시지는 한국어. 식별자는 영어.

## 5. 스택별 주의사항 (실측 확인)
- **Vite 8(rolldown)**: `manualChunks` 는 함수여야 한다(현재 미사용).
- **TypeScript 6**: `baseUrl` 폐기 예정 → 쓰지 말고 `paths` 만(번들러 해석).
- **Mantine 9**: `postcss.config.cjs`(postcss-preset-mantine) + `@mantine/core/styles.css`. polymorphic `component=` 보다 명시적 래핑 선호.
- **MSW 2**: `/api/verify` **모킹 백엔드 전용**(실서버 없음 → dev/prod 모두 기동).
- **zod 4 + @hookform/resolvers 5**: 동적 합성 스키마는 `z.ZodType<Values, Values>` 로 단언해 resolver 제네릭과 맞춘다.

## 6. 회원가입 확장성 규칙 (핵심 평가 항목)
"새 서비스/항목/약관 추가 = 설정 편집"이 되도록 설계되어 있다(`/add-signup-service`).
- 서비스 = `src/services/registry.ts` 1항목 + HTML/엔트리/`vite.config` input.
- 입력 항목 = `types.ts`(FieldKey) + `schema.ts`(FIELD_SCHEMAS) + `fields.tsx`(FIELD_COMPONENTS) **3곳**.
- 약관 = `types.ts`(TermKey) + `terms.ts`(TERM_DEFS) **2곳**.
- **제출 게이트**: `phoneVerified`·약관 동의를 모두 폼 필드로 두어 "필수입력+인증+필수약관"이 `formState.isValid` 한 값에 수렴([ADR 0004]).

## 7. 에이전트 협업 모델
오케스트레이터가 작업을 분해해 전문가에게 위임한다. (`.claude/agents/`)
- **orchestrator**(분해·위임·통합) → **project-owner**(요구·인수조건) · **ux-ui-designer**(화면·반응형·접근성) · **frontend-engineer**(구현·검증·ADR)
- 일반 순서: `PO → 디자이너 → 엔지니어(구현) → 엔지니어(검증)`. 의존 없으면 병렬.
- 오케스트레이터는 **최상위 레벨**에서 `Task` 로 전문가를 호출한다. 전문가(서브에이전트)는 다시 위임하지 않는다(중첩 금지).

## 8. 스킬
- `/design-note` — 결정의 설계 의도를 ADR로 기록 (§0의 실행 도구)
- `/add-signup-service` — 회원가입에 새 서비스 추가
