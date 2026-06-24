# 0004. 제출 게이트를 formState.isValid 한 값에 수렴시킴

- 상태: 채택(Accepted)
- 날짜: 2026-06-24
- 맥락(앱/모듈): signup

## 배경 / 문제
"가입하기"는 **모든 필수 입력 유효 + 휴대폰 인증 완료 + 필수 약관 동의**일 때만 활성화돼야 한다.
이 세 조건은 성질이 달라 보인다(입력값/외부 프로세스 결과/체크박스).

## 결정
세 조건을 **모두 react-hook-form 의 폼 필드**로 표현한다.
- 입력값: 일반 필드 + zod 스키마
- 휴대폰 인증: `phoneVerified: boolean` 필드 — 인증 성공 시 `setValue` 로 채움, 스키마에서 `true` 강제
- 약관: 각 약관 boolean 필드 — 필수 약관은 스키마에서 `true` 강제

그 결과 "활성화 조건"이 `formState.isValid` **단일 파생값**으로 수렴한다. 버튼은 `disabled={!isValid}`.

## 고려한 대안
- **수동 불리언 조합** (`isFormValid && isVerified && termsOk`) — 직관적이나 조건이 늘 때마다
  게이트 식을 수정해야 하고, 상태가 분산돼 누락·불일치 위험.
- **인증/약관을 폼 밖 별도 상태로** — 관심사 분리는 되지만 제출 가능 여부 계산이 여러 소스에 흩어진다.

## 트레이드오프
- 얻음: 단일 진실원(스키마)에서 검증·게이팅이 일관되게 결정됨. 항목이 늘어도 게이트 코드는 불변.
- 포기: `phoneVerified` 처럼 "값이 아닌 것"을 폼 필드로 모델링하는 약간의 개념적 우회. 단,
  인증 상태머신 자체는 `usePhoneVerification` 이 갖고 폼에는 **결과만** 반영해 책임을 분리했다(→ 0005).

## 영향
- `signup/schema.ts`(SignupFormValues, FIELD_SCHEMAS, 동적 합성), `signup/SignupForm.tsx`,
  `signup/phone/PhoneVerificationField.tsx`, `signup/TermsAgreement.tsx`.
