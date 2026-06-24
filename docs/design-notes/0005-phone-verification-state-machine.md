# 0005. 휴대폰 인증을 명시적 상태 머신으로 모델링

- 상태: 채택(Accepted)
- 날짜: 2026-06-24
- 맥락(앱/모듈): signup

## 배경 / 문제
휴대폰 인증은 단순 값이 아니라 **프로세스**다: 발송 → 입력 → 검증 → (성공/불일치/일시오류/만료).
요구사항은 3분 카운트다운, 만료 시 요청 불가, 중복요청 방지, 로딩 표시, 일시오류 시 재시도를 명시한다.

## 결정
`usePhoneVerification` 훅에 `status` 상태 머신(`idle|sent|verifying|verified|failed|expired`)을 둔다.
- 만료 판단은 **클라이언트 타이머**로만 (서버 발송 API 없음 — README).
- 검증 호출은 react-query `useMutation(retry:false)` — **자동 재시도 금지**(사용자 의도로만 재시도).
- 중복요청 방지: `mutation.isPending` 또는 입력 가능 상태(`sent`/`failed`)가 아니면 무시.
- 응답 분기: 성공→`verified`(타이머 종료), 불일치→`failed`(재시도 가능), 500→`sent` 유지 + "다시 시도" 안내.

## 고려한 대안
- **개별 boolean 플래그**(isSent/isVerifying/isVerified/isExpired) — 조합 폭발과 불가능 상태(예: verified+expired)
  발생 위험. 명시적 status 가 "현재 가능한 동작"을 자연히 제한한다.
- **react-query 자동 retry 사용** — 일시오류 자동 복구는 편하나, 인증 검증에선 사용자가 코드를 다시 보고
  의도적으로 눌러야 맞다. 그래서 `retry:false` 로 끄고 수동 재시도로 설계.

## 트레이드오프
- 얻음: 상태별 UI/가드가 명확. 불가능 상태 차단. 요구된 엣지케이스(만료·중복·일시오류)를 정확히 표현.
- 포기: 단순 플래그 대비 약간의 보일러플레이트. 그러나 정확성·설명가능성의 이득이 크다.

## 영향
- `signup/phone/usePhoneVerification.ts`, `PhoneVerificationField.tsx`, `verifyApi.ts`.
- 폼에는 성공 결과(`phoneVerified`)만 반영해 상태 책임을 분리(→ 0004).
