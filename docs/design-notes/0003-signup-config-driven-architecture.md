# 0003. 회원가입 — 설정 기반(config-driven) 확장 구조

- 상태: 채택(Accepted)
- 날짜: 2026-06-24
- 맥락(앱/모듈): signup

## 배경 / 문제
서비스(커뮤니티/뉴스/쇼핑)마다 입력 항목·순서·약관·테마가 다르고, **앞으로 서비스/항목/문구가 자주
추가·변경**된다(README 확장성 요구). 서비스마다 폼을 하드코딩하면 변경 비용이 선형으로 늘고 실수가 잦다.

## 결정
"서비스마다 다른 것"을 전부 **데이터(`ServiceConfig`)로 환원**하고, 폼은 그 설정을 순회해 렌더한다.
- `services/registry.ts` — 서비스별 제목/배너/테마/`fields[]`/`terms[]` 선언
- `signup/fields.tsx` — `FieldKey → 컴포넌트` 레지스트리
- `signup/terms.ts` — `TermKey → 정의` 레지스트리
- `signup/schema.ts` — 설정으로부터 zod 스키마를 **동적 합성**
- 엔트리/HTML 은 `serviceId` 만 다르고 부트스트랩 로직은 100% 공유(`app/bootstrap.tsx`)

확장 지점(정확히):
- **새 서비스** = `registry.ts` 1항목 + HTML/엔트리/`vite.config` input.
- **새 입력 항목** = `types.ts`(FieldKey) + `schema.ts`(FIELD_SCHEMAS) + `fields.tsx`(FIELD_COMPONENTS) **3곳**.
- **새 약관** = `types.ts`(TermKey) + `terms.ts`(TERM_DEFS) **2곳**.

(절차는 `/add-signup-service` 스킬을 따른다.)

## 고려한 대안
- **서비스별 폼 컴포넌트 하드코딩** — 직관적이나 중복·드리프트, 확장 시 수정 범위가 넓음.
- **JSON 스키마 + 범용 폼 렌더러(react-jsonschema-form 등)** — 매우 유연하나 학습/추상화 비용이 크고
  과제 규모엔 과함. 커스텀 검증/인증 플로우를 끼우기도 까다롭다.

## 트레이드오프
- 얻음: 확장이 "설정 편집"으로 수렴. 일관성·재사용성↑. 평가 핵심(확장성)에 직접 부합.
- 포기: 약간의 간접성(레지스트리 경유). 매우 특수한 1회성 서비스 요구가 오면 추상화가 샐 수 있다 →
  그 신호가 보이면 멈추고 구조를 재검토한다(스킬에 명시).

## 영향
- `apps/signup/src/services/*`, `apps/signup/src/signup/*`, `vite.config.ts`(멀티엔트리).
