# 0004. 로그인 폼 검증 · 제출 게이트 · 오류 처리

- 상태: 채택(Accepted)
- 날짜: 2026-06-24
- 맥락(앱/모듈): login

## 배경 / 문제
로그인 폼은 입력 검증, 제출 가능 조건, 비동기 로딩/중복요청/오류 안내를 일관되게 다뤄야 한다.

## 결정
- **검증**: react-hook-form + `zodResolver(loginSchema)`, `mode:'onChange'` 로 입력 즉시 피드백.
- **제출 게이트**: 버튼 `disabled={!formState.isValid || isPending}` — 유효성 + 진행중 여부로 한 번에 게이팅.
- **오류 처리**: 로그인 mutation `retry:false`(사용자 의도로만 재시도). 응답 분기 —
  500 → "일시 오류, 다시 시도", 그 외(401 등) → "이메일/아이디 또는 비밀번호가 올바르지 않습니다".
- **로딩/중복요청**: `mutation.isPending` 으로 버튼 로딩 + 비활성.

## 고려한 대안
- **수동 상태 관리(useState)로 로딩/에러** — react-query 의 mutation 상태를 쓰면 로딩/에러/중복요청이 일관 관리되어
  보일러플레이트가 줄고, 비밀번호 정책 노출 없이 서버(MSW) 검증 결과만 메시지로 매핑할 수 있다.

## 트레이드오프
- 얻음: 검증·게이팅·비동기 상태가 표준 도구(rhf/zod/react-query)에 수렴해 단순·일관.
- 포기: 비밀번호 복잡도 등 클라이언트 강제 검증은 의도적으로 생략(로그인은 정책을 노출하지 않음).

## 영향
- `src/features/login/{schema.ts,LoginForm.tsx,useLogin.ts}`, `src/lib/http.ts`(HttpError 분기).
