# CLAUDE.md — ARTINUS 프론트엔드 과제

이 파일은 이 저장소에서 작업하는 모든 에이전트/세션의 공통 규칙이다.

## 0. 가장 중요한 원칙 — 설계 의도를 설명할 수 있어야 한다
평가의 핵심은 코드의 정확성만이 아니라 **"왜 그렇게 만들었는지 설명할 수 있는가"** 다. 따라서:
- 비자명한 로직/기술선택/UI 위에는 **한국어 인라인 주석으로 "설계 의도"**(이유·대안·트레이드오프)를 남긴다.
- 아키텍처/라이브러리/패턴 수준의 결정은 **`/design-note` 스킬로 ADR**(`docs/design-notes/`)을 작성한다.
- "동작하지만 설명 못 하는 코드"보다 "단순하고 의도가 분명한 코드"를 택한다.

## 1. 프로젝트 개요
하나의 GitHub 저장소에 **별개의 두 프론트엔드**를 pnpm 워크스페이스(경량 모노레포)로 담는다.
- `apps/products` — 상품 목록/상세 (DummyJSON, 무한 스크롤). SPA + react-router-dom.
- `apps/signup` — 서비스별(커뮤니티/뉴스/쇼핑) 회원가입. **Vite 멀티엔트리**(라우팅 아님, 서비스별 독립 HTML).
- `packages/config` — eslint/tsconfig/prettier 공유 프리셋
- `packages/lib` — http 래퍼, queryClient 팩토리, cookie 유틸 (프레임워크 비종속)
- `packages/ui` — Mantine 테마 팩토리, Spinner/ErrorState 등 공용 프리미티브

요구사항 원문: `README.md`(회원가입) · `history/README.md`(상품).

## 2. 스택 (고정 — 임의 추가 금지)
React 19 · TypeScript 6(strict) · Vite 8 · pnpm · Mantine 9 · @tanstack/react-query 5 ·
react-hook-form 7 + zod 4 · MSW 2 · cookie · react-router-dom 7(**상품 앱에서만**).
새 의존성이 필요하면 근거·트레이드오프와 함께 제안하고 합의 후 추가한다.

## 3. 명령어
```bash
pnpm install                      # 워크스페이스 전체 설치
pnpm dev:products                 # 상품 앱 dev
pnpm dev:signup                   # 회원가입 앱 dev (index=허브, /community.html 등)
pnpm typecheck                    # typecheck 스크립트가 있는 워크스페이스 tsc --noEmit (pnpm -r; config 패키지는 TS 소스가 없어 제외)
pnpm build                        # 두 앱 프로덕션 빌드 (tsc + vite build)
pnpm lint                         # eslint
pnpm --filter @artinus/<pkg> <스크립트>   # 특정 패키지만
```

## 4. 코드 규칙
- **타입**: strict + `noUncheckedIndexedAccess` + `verbatimModuleSyntax`. → 타입 전용 import 는 `import type`. `any` 회피.
- **검증은 실행으로 증명**: 완료 보고 전 관련 `typecheck`/`build` 를 실제로 돌린다. 통과를 가정하지 않는다.
- **재사용 우선**: 두 곳 이상 반복되는 UI/로직은 `@artinus/ui`/`@artinus/lib` 로 추출.
- **확장성 보존**: 회원가입은 레지스트리/스키마 합성 구조를 깨지 않는다(§6).
- 주석/문서/커밋 메시지는 한국어. 식별자는 영어.

## 5. 스택별 주의사항 (실측으로 확인된 함정)
- **Vite 8(rolldown)**: `build.rollupOptions.output.manualChunks` 는 **객체가 아니라 함수**여야 한다.
- **tsconfig 공유**: 프리셋의 `extends` 는 `@artinus/config` **패키지 내부 상대경로**(`./base.json`)만 쓴다.
  패키지 밖으로 나가는 `../../../` 는 rolldown 의 심링크 해석에서 깨진다.
- **Mantine 9**: 앱마다 `postcss.config.cjs`(postcss-preset-mantine) 필요 + `@mantine/core/styles.css` import.
  polymorphic `component={Link}` 대신 Link 래핑/`useNavigate` 를 선호(버전 조합 타입 안정성).
- **MSW 2**: 회원가입의 `/api/verify` **모킹 백엔드 전용**(실서버 없음 → dev/prod 모두 기동). 상품은 실제 DummyJSON 사용.
- **zod 4 + @hookform/resolvers 5**: 동적 합성 스키마는 `z.ZodType<Values, Values>` 로 단언해 resolver 제네릭과 맞춘다.

## 6. 회원가입 확장성 규칙 (핵심 평가 항목)
"새 서비스/항목/약관 추가 = 설정 편집"이 되도록 설계되어 있다. 확장은 `/add-signup-service` 스킬을 따른다.
- 서비스 = `src/services/registry.ts` 의 `ServiceConfig` 한 항목 + HTML/엔트리/vite input.
- 입력 항목 = `types.ts`(FieldKey) + `schema.ts`(FIELD_SCHEMAS) + `fields.tsx`(컴포넌트).
- 약관 = `types.ts`(TermKey) + `terms.ts`(TERM_DEFS).
- **제출 게이트**: `phoneVerified`·약관 동의를 모두 폼 필드로 두어 "필수입력+인증+필수약관"이 `formState.isValid` 한 값에 수렴한다.

## 7. 에이전트 협업 모델
오케스트레이터가 작업을 분해해 전문가에게 위임한다. (`.claude/agents/`)
- **orchestrator** — 분해·위임·통합 (진입점)
- **project-owner** — 요구·인수조건·범위
- **ux-ui-designer** — 화면 플로우·반응형·접근성·테마
- **frontend-engineer** — 구현·타입/빌드 검증·ADR 작성

일반 순서: `PO → 디자이너 → 엔지니어(구현) → 엔지니어(검증)`. 의존 없으면 병렬.
오케스트레이터는 **최상위(진입) 레벨**에서 동작하며 전문가를 `Task` 도구로 호출한다.
핸드오프는 `[목표][맥락][산출물][인수조건]` 형식. 전문가(서브에이전트)는 다시 위임하지 않는다(중첩 금지).

## 8. 스킬
- `/design-note` — 결정의 설계 의도를 ADR로 기록 (§0의 실행 도구)
- `/add-signup-service` — 회원가입에 새 서비스 추가
