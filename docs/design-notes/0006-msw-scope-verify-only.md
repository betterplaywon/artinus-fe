# 0006. MSW 를 /api/verify 에만 적용 (상품은 실제 DummyJSON)

- 상태: 채택(Accepted)
- 날짜: 2026-06-24
- 맥락(앱/모듈): signup, products

## 배경 / 문제
두 앱의 네트워크 성격이 다르다. 상품은 **실제 공개 API**(DummyJSON)를 쓰라는 스펙이고,
휴대폰 인증은 **실서버가 없는** Mock 계약(POST /api/verify)이다.

## 결정
- **회원가입**: MSW 로 `/api/verify` 만 모킹한다. 실서버가 없으므로 dev/prod 모두에서 서비스워커를 기동해
  브라우저 내에서 응답을 만든다(123456 성공 / 999999 → 500 / 그 외 불일치 / 0.5~1.5s 지연).
- **상품**: 실제 DummyJSON 을 그대로 호출한다. MSW 를 끼우지 않는다.

## 고려한 대안
- **상품도 MSW 로 프록시/모킹** — 오프라인 개발엔 좋으나 스펙(실 API 사용)에서 벗어나고, "실제 연동" 평가
  포인트를 희석한다. 핸들러 유지 비용도 추가된다.
- **fetch 래퍼에 조건부 mock 분기** — MSW 보다 침습적이고 프로덕션 코드에 mock 분기가 남는다.

## 트레이드오프
- 얻음: 각 앱이 스펙대로 동작. 인증은 실서버 없이도 전 상태(성공/실패/오류/지연)를 재현. 프로덕션 코드 무오염.
- 포기: 상품의 오프라인 개발 편의(실 네트워크 의존). 필요 시 테스트에서만 MSW 핸들러를 추가하면 된다.
- **비용(명시)**: prod 에서도 워커를 기동하므로 회원가입 사용자 전원에게 MSW 런타임(빌드상 `browser-*.js`
  ≈ 413kB / gzip ≈ 151kB, 동적 import 청크)이 전송되고, `bootstrap` 이 `worker.start()` 를 await 하여
  초기 렌더가 워커 등록까지 지연된다. 데모(실서버 부재) 특성상 의도적으로 수용한 비용이다.
- **대안(향후)**: 실 백엔드가 생기면 prod 에서 MSW 를 제거하고, 정 필요하면 인증 모킹만 가벼운
  fetch 래퍼 인터셉트(setTimeout+Promise)로 대체해 런타임 페이로드를 dev 한정으로 줄일 수 있다.

## 영향
- `apps/signup/src/mocks/{handlers,browser}.ts`, `app/bootstrap.tsx`(워커 기동), `public/mockServiceWorker.js`.
- `vercel.json` 에서 `mockServiceWorker.js` 는 `no-cache`(워커 갱신 보장).
