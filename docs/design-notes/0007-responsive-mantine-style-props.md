# 0007. 반응형은 Mantine mobile-first style-prop 으로 표현

- 상태: 채택(Accepted)
- 날짜: 2026-06-24
- 맥락(앱/모듈): signup

## 배경 / 문제
회원가입 페이지는 모바일~데스크톱에서 모두 자연스러워야 한다. 기존 구현도 이미 **유동(fluid)** 이긴 했다:
viewport 메타태그, `Container(size=480)`(max-width + 중앙정렬 + 좌우 거터 `md`), 풀폭 세로 스택 입력.
그러나 **의도적인 화면폭 대응**은 없었다 — 배너 높이·제목 크기·세로 패딩이 전 화면 동일했고,
휴대폰 인증 행은 `Group wrap="nowrap"` 이라 초소형 기기/글자 확대에서 가로 넘침 위험이 있었다.
"반응형이 적용됐는가"에 자신 있게 "예"라고 답하려면 이 축을 명시적으로 설계해야 했다.

## 결정
반응형을 **Mantine 의 mobile-first 반응형 style-prop 객체**(`{ base, sm, ... }`)로 표현한다.
별도 CSS 모듈/미디어쿼리/JS 훅(`useMediaQuery`)을 추가하지 않는다.
- `base` 가 기본값, 브레이크포인트 키(`xs`/`sm`)는 해당 `min-width` 미디어에서 덮어쓴다(Mantine 이 런타임 `<style>` 주입).
- 적용 지점(전부 선언적):
  - `SignupPage`: `Container py={{ base:'md', sm:'xl' }}`, `Paper p={{ base:'md', sm:'lg' }}` — 모바일에서 세로/카드 패딩 축소(가용폭·스크롤 절약).
  - `ServiceBanner`: 배너 `h={{ base:120, sm:160 }}`, 제목 `fz={{ base:26, sm:34 }}` + `lh={{ base:1.2, sm:1.3 }}`(시맨틱 `<h1>`=`order=1` 은 유지, 크기/줄높이만 축소).
  - `PhoneVerificationField`: 입력+버튼 행을 `Flex direction={{ base:'column', sm:'row' }}` `align={{ base:'stretch', sm:'flex-end' }}` 로 —
    **base(<768px)는 세로 풀폭 스택**(넘침 원천 차단 + 넓은 터치 영역), **sm(768px)↑ 는 가로 한 줄**. 입력은 `flex={{ sm:1 }}`(가로 모드에서만 신축).

**전환점은 `sm`(768px) 한 곳으로 통일**한다. 폼 콘텐츠 폭은 `Container size=480` 으로 어차피 ~448px 에 캡되므로 인증 행을 더 일찍(xs) 펴줄 실익이 없고,
오히려 외형(배너/제목/패딩)이 함께 바뀌는 768px 한 지점에서 레이아웃·타이포가 동시에 '데스크톱 모드'로 전환돼 중간 폭(576~767px)의 어중간한 조합을 없앤다.
브레이크포인트 값은 Mantine 기본값(sm=48em/768px)을 그대로 쓴다 — `postcss.config.cjs` 의 `$mantine-breakpoint-*` 와 동일.

## 고려한 대안
- **CSS Modules + `@media ($mantine-breakpoint-*)`** — postcss 환경은 이미 갖춰져 있어 가능. 그러나 컴포넌트마다 `.module.css`
  파일이 늘고, 스타일 의도가 TSX 와 CSS 두 곳으로 분산된다. 단순 폼에는 과한 분리.
- **`useMediaQuery`(@mantine/hooks)로 JS 분기 렌더** — 동적 분기는 가능하나 추가 리렌더·SSR/초기 점멸 우려, 그리고
  "보이는 스타일"을 명령형 JS 로 푸는 셈이라 선언성이 떨어진다. 레이아웃 스케일에는 불필요.
- **현행 유지(유동만)** — 깨지진 않지만 초소형 기기 넘침 위험과 "의도적 반응형 부재"가 남는다(이 ADR 의 동기).

## 트레이드오프
- 얻음: 스타일 의도가 TSX 한곳에 모여 읽힌다. 빌드 산출물에 정적 CSS 가 늘지 않고(런타임 주입), 추가 의존성 0.
  값은 토큰/숫자 한 줄 수정으로 조정 가능 → 확장 규칙("설정 편집")과 결이 같다.
- 포기: 반응형 규칙이 런타임 `<style>` 주입에 의존(정적 CSS 파일로 추출되지 않음). 또 매우 복잡한 레이아웃이라면
  style-prop 객체가 장황해질 수 있으나, 회원가입 폼 규모에선 문제되지 않는다.
- 검증: style-prop 객체가 실제 `@media (min-width: …)` 규칙을 만드는지 Mantine SSR 렌더로 확인했고
  (`h={{base:120,sm:160}}` → base 7.5rem + `@media(min-width:48em)` 10rem), `typecheck`/`lint`/`build` 통과로 회귀 없음을 증명했다.

## 영향
- `src/signup/{SignupPage,ServiceBanner}.tsx`, `src/signup/phone/PhoneVerificationField.tsx`.
- 후속/확장: 새 입력 컴포넌트도 동일 패턴(필요 시 `{ base, sm }` style-prop)으로 반응형을 표현한다.
  제출 버튼 등 이미 `fullWidth` 인 요소는 그대로 둔다(이미 유동).
- 다중 렌즈 적대적 검증(320/375/768/1280 + 글자확대 + a11y) 결과 blocker 0. 아래는 **인지했으나 이번 범위 밖으로 남긴** 폴리시(필요 시 후속):
  - 글자만 200% 확대(WCAG 1.4.4) + ≤320px 에서 고정 높이 보조 버튼의 한글 라벨이 잘릴 여지(가로 넘침은 없음). → 버튼 `height:auto`+줄바꿈 허용으로 보강 가능.
  - 인증 성공/만료 안내에 `role="status"`/`aria-live` 부재(스크린리더 비동기 고지), `c="green"/"red"` 대비 경계값(→ `green.8`/`red.7`), 보조 버튼·입력 터치 타깃 36px(<44px 권장).
  - 초대형(>1408px)에서 480 카드의 여백 — 폼 가독폭상 의도된 절제(필요 시 lg↑ 2컬럼/수직 중앙 정렬).
- 관련: 제출 게이트 [0004](0004-form-validity-as-submit-gate.md), 인증 상태머신 [0005](0005-phone-verification-state-machine.md).
