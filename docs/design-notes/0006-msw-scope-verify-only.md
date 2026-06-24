# 0006. MSW 를 /api/verify 에만 적용

- 상태: 채택(Accepted)
- 날짜: 2026-06-24
- 맥락(앱/모듈): signup

## 배경 / 문제
휴대폰 인증 검증(`POST /api/verify`)은 실서버가 없는 Mock 계약이다. 이를 어떻게 구현할지 정해야 한다.

## 결정
MSW 로 `/api/verify` 만 모킹한다. 실서버가 없으므로 dev/prod 모두에서 서비스워커를 기동해 브라우저 내에서
응답을 만든다: code `123456` → 200{verified:true}, `999999` → 500, 그 외 → 200{verified:false,reason:MISMATCH}, 0.5~1.5초 지연.

## 고려한 대안
- **fetch 래퍼에 조건부 mock 분기** — MSW 보다 침습적이고 프로덕션 코드에 mock 분기가 남는다.
- **별도 mock 서버 프로세스** — 정적 배포·데모엔 과하다(브라우저 내 워커로 충분).

## 트레이드오프
- 얻음: 인증의 전 상태(성공/실패/오류/지연)를 실서버 없이 재현. 프로덕션 코드 무오염. 네트워크 계층에서 자연스럽게 가로챔.
- 포기: prod 번들에 MSW 런타임이 포함된다(데모 특성상 수용). `bootstrap` 이 `worker.start()` 를 await 해 초기 렌더가 워커 등록까지 지연된다.
  실 백엔드가 생기면 prod 에서 MSW 를 제거한다.

## 영향
- `src/mocks/{handlers,browser}.ts`, `src/app/bootstrap.tsx`(워커 기동), `public/mockServiceWorker.js`,
  `vercel.json`(mockServiceWorker.js no-cache).
