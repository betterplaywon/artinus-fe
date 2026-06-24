# 0003. MSW 로그인 Mock + 쿠키 세션(remember-me)

- 상태: 채택(Accepted)
- 날짜: 2026-06-24
- 맥락(앱/모듈): login

## 배경 / 문제
실서버가 없으므로 로그인 API를 모킹해야 하고, 로그인 성공 상태를 새로고침에도 유지할 방법이 필요하다.

## 결정
- **API**: MSW 로 `POST /api/login` 모킹. 테스트 계정+비밀번호 → 200{token,user}, 비밀번호 `error` → 500,
  그 외 → 401, 0.5~1.5초 지연. 실서버가 없으므로 dev/prod 모두 워커를 기동한다.
- **세션**: 성공 시 토큰을 **쿠키**에 저장. `로그인 상태 유지(remember-me)` 체크 시 30일 지속 쿠키,
  아니면 세션 쿠키(maxAge 미지정). 앱 마운트 시 쿠키를 읽어 로그인 상태를 복원한다.

## 고려한 대안
- **localStorage 세션** — 간단하나 만료(maxAge) 시맨틱이 없어 "지속/세션" 구분을 직접 구현해야 한다.
  쿠키는 maxAge 로 이를 내장하며, 추후 서버 전달이 필요해지면 동일 모델로 확장된다.
- **fetch 래퍼에 mock 분기** — MSW 보다 침습적이고 프로덕션 코드에 mock 분기가 남는다.

## 트레이드오프
- 얻음: 실서버 없이 전 상태(성공/자격오류/일시오류/지연) 재현 + remember-me 동작. 프로덕션 코드 무오염.
- 포기: prod 에서도 MSW 런타임이 전송된다(데모 특성상 수용). 토큰을 JS 접근 가능한 쿠키에 두므로
  실서비스라면 httpOnly 쿠키(서버 발급)로 가야 한다 — 여기선 모킹 한계로 클라이언트 저장.

## 영향
- `src/mocks/{handlers,browser}.ts`, `src/lib/cookie.ts`, `src/features/login/{useLogin.ts,LoginPage.tsx}`,
  `vercel.json`(mockServiceWorker.js no-cache), `public/mockServiceWorker.js`.
