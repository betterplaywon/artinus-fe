# CLAUDE.md — ARTINUS 프론트엔드 과제 (로그인)

이 파일은 이 저장소에서 작업하는 모든 에이전트/세션의 공통 규칙이다.

## 0. 가장 중요한 원칙 — 설계 의도를 설명할 수 있어야 한다
평가의 핵심은 코드의 정확성만이 아니라 **"왜 그렇게 만들었는지 설명할 수 있는가"** 다. 따라서:
- 비자명한 로직/기술선택/UI 위에는 **한국어 인라인 주석으로 "설계 의도"**(이유·대안·트레이드오프)를 남긴다.
- 아키텍처/패턴 수준의 결정은 **`/design-note` 스킬로 ADR**(`docs/design-notes/`)을 작성한다.
- "동작하지만 설명 못 하는 코드"보다 "단순하고 의도가 분명한 코드"를 택한다.

## 1. 프로젝트 개요
**로그인 페이지 하나**를 구현하는 단일 React + TS 앱. **pnpm(워크스페이스 아님)**.
> 이전엔 상품/회원가입을 모노레포로 구성했으나, 범위가 로그인 1개로 축소되어 단일 패키지로 재구성했다
> (모노레포는 오버스펙). 배경은 [ADR 0001](docs/design-notes/0001-single-package-not-monorepo.md).

구조:
```
index.html · vite.config.ts · tsconfig.json · vercel.json · postcss.config.cjs · eslint.config.js
public/mockServiceWorker.js
src/
  main.tsx                 프로바이더(Mantine·Query) + MSW 기동 + 렌더
  features/login/          schema(zod)·api·useLogin(+cookie)·LoginForm·LoginPage
  mocks/                   MSW /api/login
  lib/                     http(래퍼)·cookie·query(클라이언트 팩토리)
  ui/                      theme·Spinner·ErrorState·CenteredMessage
```
`@/` → `src` 경로 별칭(tsconfig paths + vite alias).

## 2. 스택 (고정 — 임의 추가 금지)
React 19 · TypeScript 6(strict) · Vite 8 · pnpm · Mantine 9 · @tanstack/react-query 5 ·
react-hook-form 7 + zod 4 · MSW 2 · cookie. **라우터 없음**(단일 페이지).

## 3. 명령어
```bash
pnpm install
pnpm dev          # 개발 서버
pnpm build        # tsc --noEmit + vite build → dist/
pnpm typecheck
pnpm lint
```

## 4. 코드 규칙
- **타입**: strict + `noUncheckedIndexedAccess` + `verbatimModuleSyntax`. 타입 전용 import 는 `import type`. `any` 회피.
- **검증은 실행으로 증명**: 완료 전 `typecheck`/`build` 를 실제로 돌린다. 통과를 가정하지 않는다.
- 주석/문서/커밋 메시지는 한국어. 식별자는 영어.

## 5. 스택별 주의사항 (실측 확인)
- **Vite 8(rolldown)**: `build.rollupOptions.output.manualChunks` 는 객체가 아니라 **함수**여야 한다.
- **TypeScript 6**: `baseUrl` 는 폐기 예정 → 사용하지 말고 `paths` 만 둔다(번들러 해석, tsconfig 기준 상대).
- **Mantine 9**: `postcss.config.cjs`(postcss-preset-mantine) + `@mantine/core/styles.css` import.
  polymorphic `component=` 보다 명시적 래핑/`onClick` 선호(버전 조합 타입 안정성).
- **MSW 2**: `/api/login` **모킹 백엔드 전용**(실서버 없음 → dev/prod 모두 기동).
- **zod 4 + @hookform/resolvers 5**: 정적 `z.object` 스키마는 `zodResolver(schema)` 가 추가 단언 없이 추론된다.

## 6. 로그인 핵심 동작
- **식별자**: 이메일 **또는** 아이디 허용 — 형식 분기 검증([ADR 0002](docs/design-notes/0002-login-identifier-email-or-username.md)).
- **제출 게이트**: `formState.isValid` (rhf + zod, mode:onChange).
- **비동기/오류**: 로딩(`mutation.isPending`)·중복요청 방지(버튼 disabled)·자격오류(401)/일시오류(500) 분기 안내.
- **세션**: 로그인 성공 시 토큰을 쿠키에 저장(remember-me=30일 지속 / 아니면 세션). 새로고침 시 쿠키로 복원
  ([ADR 0003](docs/design-notes/0003-msw-and-cookie-session.md)).
- **Mock 계약**: 테스트 계정(test@artinus.dev / artinus_user) + `password123` → 성공, `error` → 500, 그 외 401, 0.5~1.5s 지연.

## 7. 에이전트 협업 모델
오케스트레이터가 작업을 분해해 전문가에게 위임한다. (`.claude/agents/`)
- **orchestrator**(분해·위임·통합) → **project-owner**(요구·인수조건) · **ux-ui-designer**(화면·반응형·접근성) · **frontend-engineer**(구현·검증·ADR)
- 일반 순서: `PO → 디자이너 → 엔지니어(구현) → 엔지니어(검증)`. 의존 없으면 병렬.
- 오케스트레이터는 **최상위 레벨**에서 `Task` 로 전문가를 호출한다. 전문가(서브에이전트)는 다시 위임하지 않는다(중첩 금지).

## 8. 스킬
- `/design-note` — 결정의 설계 의도를 ADR로 기록 (§0의 실행 도구)
