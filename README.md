# ARTINUS 프론트엔드 과제 — 서비스별 회원가입

커뮤니티·뉴스 구독·쇼핑 멤버십, **세 서비스의 회원가입 페이지를 한 코드베이스에서** 만든다.
서비스마다 다른 입력 항목·순서·약관·테마는 **설정 파일만 고치면** 늘릴 수 있고, 빌드 결과물은
라우팅으로 나눈 한 덩어리가 아니라 **서비스별로 따로 떨어진 HTML**(`dist/community.html` 등)이다.

> 원본 과제 명세는 [`docs/ASSIGNMENT.md`](docs/ASSIGNMENT.md)에, 결정별 상세 배경(대안·트레이드오프)은
> [`docs/design-notes/`](docs/design-notes/)의 ADR에 따로 정리했다. 이 문서는 그 요지만 짚는다.

## 실행 및 빌드

요구사항: Node ≥ 20, pnpm.

```bash
pnpm install
pnpm dev          # 허브(/) + /community.html · /news.html · /shopping.html
pnpm build        # tsc --noEmit + vite build → dist/{index,community,news,shopping}.html
pnpm typecheck
pnpm lint
```

- `pnpm dev`를 띄우면 루트(`/`)에 세 서비스로 가는 허브가 나오고, 각 서비스는 `/community.html`처럼 독립 HTML로 열린다.
- 휴대폰 인증 테스트 코드(Mock): `123456` 성공, `999999` 일시 오류(500), 나머지 불일치. 실서버가 없어 MSW 서비스워커가
  `/api/verify`를 브라우저 안에서 받는다(dev·prod 공통).

## 기술·구조 선택과 트레이드오프

| 영역 | 선택 | 이유 / 트레이드오프 |
|---|---|---|
| 빌드 분리 | **Vite 멀티엔트리(MPA)** | '서비스별 독립 HTML'을 라우터 없이 충족하고 공통 로직은 100% 공유한다. 대신 클라이언트 사이드 네비게이션은 없다(필요 없음) · [ADR 0002](docs/design-notes/0002-multi-entry-independent-html.md) |
| 패키지 | **단일 pnpm 패키지** | 앱이 하나뿐이라 모노레포의 `packages/*` 계층은 순수 비용이었다 · [ADR 0001](docs/design-notes/0001-single-package-not-monorepo.md) |
| UI | **Mantine 9** | 폼·반응형 style-prop·접근성을 기본 제공한다. 테마 차이는 `primaryColor` 한 값. 단 스타일은 런타임 주입이라 정적 CSS로 추출되진 않는다 |
| 폼·검증 | **react-hook-form + zod** | 비제어 성능 + 스키마 단일 출처. 스키마를 설정에서 동적 합성한다(그래서 결과를 `z.ZodType<Values, Values>`로 단언) · [ADR 0003](docs/design-notes/0003-signup-config-driven-architecture.md) |
| 서버 상태 | **react-query** | 인증 검증의 로딩·오류·중복 요청을 라이브러리가 맡아 줘서 직접 들 상태가 준다. 조회(useQuery)는 없고 mutation 하나뿐이다 |
| Mock | **MSW** | 네트워크 계층에서 가로채 프로덕션 코드를 더럽히지 않고 인증의 전 상태(성공/실패/오류/지연)를 재현한다. 대신 prod 번들에 MSW 런타임이 포함된다(데모라 수용) · [ADR 0006](docs/design-notes/0006-msw-scope-verify-only.md) |
| HTTP | **`fetch` 얇은 래퍼** | axios 없이 JSON 파싱 + 비정상 응답 `HttpError` throw + 10초 타임아웃만 감쌌다. 실패를 예외로 통일해 react-query의 `isError`로 이어진다 |
| 라우터 | **없음** | 서비스 구분은 멀티엔트리 HTML이지 경로가 아니다 |

회원가입 흐름을 떠받치는 구조 결정은 다음 네 가지다. 자세한 근거·대안은 각 ADR에 있다.

- **설정 주도(config-driven)** — 서비스마다 다른 것을 전부 데이터로 선언해, 폼과 컴포넌트는 자기가 어느 서비스인지 모른다 · [ADR 0003](docs/design-notes/0003-signup-config-driven-architecture.md)
- **제출 게이트 = `formState.isValid` 한 값** — 필수 입력·휴대폰 인증·필수 약관을 모두 폼 필드로 두어, 버튼을 켤 조건을 값 하나로 모았다 · [ADR 0004](docs/design-notes/0004-form-validity-as-submit-gate.md)
- **휴대폰 인증 = 명시적 상태 머신** — `idle·sent·verified·expired` 네 상태. '검증 중'·'불일치'는 파생값이라 상태로 두지 않고, 응답과 만료가 겹치는 경합은 `statusRef`로 막는다 · [ADR 0005](docs/design-notes/0005-phone-verification-state-machine.md)
- **반응형 = Mantine mobile-first style-prop** — 별도 CSS 없이 `{ base, sm }`로 선언하고, 전환점은 `sm`(768px) 한 곳으로 통일했다 · [ADR 0007](docs/design-notes/0007-responsive-mantine-style-props.md)

## 확장성 설계

서비스·항목·약관을 추가할 때 **설정만 고치면 되게** 만드는 것이 목표였다([ADR 0003](docs/design-notes/0003-signup-config-driven-architecture.md), 추가 절차는 `/add-signup-service` 스킬).
서비스마다 다른 부분은 `src/services/registry.ts` 한 곳에 데이터로 선언하고, 폼은 그 설정을 순회해 렌더한다.

| 변경 | 손대는 곳 | 개수 |
|---|---|---|
| 새 **서비스** | `registry.ts` 1항목 + HTML·엔트리·`vite.config` input | 4 |
| 새 **입력 항목** | `types.ts`(FieldKey) · `schema.ts`(FIELD_SCHEMAS) · `fieldRegistry.ts`(FIELD_COMPONENTS) · `schema.ts`(SignupFormValues·DEFAULT_VALUES) | 5 |
| 새 **약관** | `types.ts`(TermKey) · `terms.ts`(TERM_DEFS) · `schema.ts`(SignupFormValues·DEFAULT_VALUES) | 4 |
| **순서 변경** | `registry.ts`의 `fields[]`/`terms[]` 배열 재정렬 | 1 |

- 레지스트리(`FIELD_SCHEMAS`·`FIELD_COMPONENTS`·`TERM_DEFS`)가 모두 `Record<FieldKey|TermKey, …>` 형태라, 키를 하나라도 빠뜨리면 런타임이 아니라 **빌드 때** 걸린다.
- 설정만 추가하면 끝나야 할 변경이 공통 컴포넌트 수정으로 번지기 시작하면, 그건 추상화가 새고 있다는 신호다. 그럴 땐 멈추고 구조를 다시 본다.

## AI 활용

- 구현과 검증에 **Claude Code**를 썼다. 오케스트레이터가 일을 쪼개 PO·디자이너·엔지니어 역할의 서브에이전트에게 맡기고(`.claude/agents/`), 반복 작업은 스킬(`/design-note`, `/add-signup-service`)로 묶었다.
- 코드 정리도 여러 에이전트로 점검했다. 안티패턴·과한 추상화·결합도·주석 과다를 항목별로 따로 리뷰하게 한 뒤, 각 지적을 반박부터 시켜 본 다음(진짜 문제인지, 고쳐도 안전한지) 살아남은 것만 반영했다.

## 설계 의도 기록 (ADR)

자세한 배경·고려한 대안·트레이드오프는 [`docs/design-notes/`](docs/design-notes/)에 ADR로 남겼다.

| 번호 | 제목 |
|---|---|
| [0001](docs/design-notes/0001-single-package-not-monorepo.md) | 단일 패키지 채택 (모노레포 철회) |
| [0002](docs/design-notes/0002-multi-entry-independent-html.md) | 멀티엔트리 — 서비스별 독립 HTML (라우팅 아님) |
| [0003](docs/design-notes/0003-signup-config-driven-architecture.md) | 회원가입 — 설정 기반 확장 구조 |
| [0004](docs/design-notes/0004-form-validity-as-submit-gate.md) | 제출 게이트를 `formState.isValid` 한 값에 수렴 |
| [0005](docs/design-notes/0005-phone-verification-state-machine.md) | 휴대폰 인증을 명시적 상태 머신으로 모델링 |
| [0006](docs/design-notes/0006-msw-scope-verify-only.md) | MSW 를 `/api/verify` 에만 적용 |
| [0007](docs/design-notes/0007-responsive-mantine-style-props.md) | 반응형은 Mantine mobile-first style-prop 으로 표현 |
