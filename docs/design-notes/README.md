# 설계 의도 기록 (Design Notes / ADR)

이 과제의 평가 핵심은 **"왜 그렇게 만들었는지 설명할 수 있는가"** 다. 이 디렉터리는 비자명한 결정을
ADR(Architecture Decision Record) 형식으로 남긴다. 작성은 `/design-note` 스킬을 따른다.

| 번호 | 제목 | 맥락 |
|------|------|------|
| [0001](0001-single-package-not-monorepo.md) | 단일 패키지 채택 (모노레포 철회) | shared |
| [0002](0002-login-identifier-email-or-username.md) | 로그인 식별자 — 이메일 또는 아이디 | login |
| [0003](0003-msw-and-cookie-session.md) | MSW 로그인 Mock + 쿠키 세션(remember-me) | login |
| [0004](0004-login-form-validation-and-gate.md) | 로그인 폼 검증·제출 게이트·오류 처리 | login |

> 신규 ADR 은 다음 4자리 번호로 추가하고 이 표에 한 줄 등록한다.
