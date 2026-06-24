# 0005. 휴대폰 인증을 명시적 상태 머신으로 모델링

- 상태: 채택(Accepted)
- 날짜: 2026-06-24
- 맥락(앱/모듈): signup

## 배경 / 문제
휴대폰 인증은 단순 값이 아니라 **프로세스**다: 발송 → 입력 → 검증 → (성공/불일치/일시오류/만료).
요구사항은 3분 카운트다운, 만료 시 요청 불가, 중복요청 방지, 로딩 표시, 일시오류 시 재시도를 명시한다.

## 결정
`usePhoneVerification` 훅에 `status` 상태 머신(`idle|sent|verified|expired`)을 둔다.
**라이브러리/파생으로 환원 가능한 것은 상태로 두지 않는다** — 도메인 고유 복잡도만 상태로 남긴다:
- "검증 진행 중" → 별도 `verifying` 상태 대신 react-query **`useMutation.isPending`**(`isVerifying`)에서 파생. 로딩 표시는 라이브러리가 관리.
- "코드 불일치/일시오류" → 별도 `failed` 상태 대신 **`sent` 유지 + `errorMessage`** 안내(재시도 가능). → 컴포넌트의 `showCodeInput`도 3중 OR → 단일 비교(`status==='sent'`).
- 만료 판단은 **클라이언트 타이머**로만 (서버 발송 API 없음 — README).
- 검증 호출은 react-query `useMutation(retry:false)` — **자동 재시도 금지**(사용자 의도로만 재시도).
- 중복요청 방지: 같은 틱 보호는 동기 `pendingRef`(isPending 은 다음 렌더 반영이라 부족), 상태 가드는 `sent` 가 아니면 무시.
- **경합 차단(도메인 고유 — 라이브러리로 못 없앤다)**: 검증 응답은 0.5~1.5초 지연되므로 그 사이 타이머가 만료될 수 있다. 응답 콜백은
  `statusRef`로 "아직 `sent` 인가"를 재확인하고, 만료/리셋됐으면 응답을 버린다(verified+expired 같은 불가능 상태 차단).

> 참고: suspense 는 **query 전용**(`useSuspenseQuery`)이다. 인증은 사용자 클릭으로 트리거되는 명령형 mutation 이라 suspense 가 적용되지 않는다 — 로딩은 `isPending` 으로만 다룬다.

## 고려한 대안
- **개별 boolean 플래그**(isSent/isVerifying/...) — 조합 폭발과 불가능 상태 위험. 명시적 status 가 "현재 가능한 동작"을 자연히 제한한다.
- **6-상태 머신(verifying·failed 포함)** — 초기안. 그러나 verifying=isPending, failed=sent+errorMessage 로 환원되어 **중복**이었다. 4-상태로 축소해 타이머·경합이라는 본질만 남겼다.
- **react-query 자동 retry 사용** — 일시오류 자동 복구는 편하나, 인증 검증은 사용자가 코드를 다시 보고 의도적으로 눌러야 맞다.

## 트레이드오프
- 얻음: 상태별 UI/가드가 명확. 불가능 상태 차단. 요구된 엣지케이스(만료·중복·일시오류·경합)를 정확히 표현.
  진행중/불일치를 라이브러리·파생으로 환원해 상태 수를 줄였다(6→4).
- 포기: 동기 중복 차단을 위해 `pendingRef` 한 개를 둔다(isPending 만으로는 같은 틱 보호 불가). 그래도 순 복잡도는 감소.

## 영향
- `src/signup/phone/{usePhoneVerification.ts,PhoneVerificationField.tsx,verifyApi.ts}`.
- 폼에는 성공 결과(`phoneVerified`)만 반영해 상태 책임을 분리(→ [0004](0004-form-validity-as-submit-gate.md)).
