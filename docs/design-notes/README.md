# 설계 의도 기록 (Design Notes / ADR)

이 과제의 평가 핵심은 **"왜 그렇게 만들었는지 설명할 수 있는가"** 다. 이 디렉터리는 비자명한 결정을
ADR(Architecture Decision Record) 형식으로 남긴다. 작성은 `/design-note` 스킬을 따른다.

| 번호 | 제목 | 맥락 |
|------|------|------|
| [0001](0001-monorepo-pnpm-workspaces.md) | 경량 pnpm 모노레포 채택 | shared |
| [0002](0002-tsconfig-presets-in-config-package.md) | tsconfig 프리셋을 config 패키지 내부에 둔 이유 | shared |
| [0003](0003-signup-config-driven-architecture.md) | 회원가입 — 설정 기반(config-driven) 확장 구조 | signup |
| [0004](0004-form-validity-as-submit-gate.md) | 제출 게이트를 formState.isValid 한 값에 수렴시킴 | signup |
| [0005](0005-phone-verification-state-machine.md) | 휴대폰 인증을 명시적 상태 머신으로 모델링 | signup |
| [0006](0006-msw-scope-verify-only.md) | MSW 를 /api/verify 에만 적용 | signup |
| [0007](0007-products-routing-and-lazyload.md) | 상품 — react-router-dom + IntersectionObserver 무한 스크롤 | products |

> 신규 ADR 은 다음 4자리 번호로 추가하고 이 표에 한 줄 등록한다.
