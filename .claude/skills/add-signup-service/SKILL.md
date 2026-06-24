---
name: add-signup-service
description: 회원가입 앱에 새 서비스를 추가할 때 사용. 서비스 레지스트리 항목·HTML 엔트리·엔트리 tsx·Vite 멀티엔트리 input·테마 색을 일괄 추가해 "설정만으로 서비스 확장"을 수행한다. 새 입력 항목/약관이 필요하면 해당 레지스트리도 함께 확장한다.
---

# 회원가입 서비스 추가 스킬

이 앱은 "서비스마다 다른 것(제목/배너/입력 항목/순서/약관/테마)"을 전부 데이터로 환원한 config 기반 구조다.
새 서비스 추가는 아래 체크리스트로 끝난다. **공통 컴포넌트/로직은 건드리지 않는다.**

## 입력값
- `id`: 서비스 식별자(영문 소문자, 예: `travel`)
- `name`/`title`/`subtitle`: 표시 문구
- `brandColor`: `@/ui` 의 `BrandColor` (필요 시 타입에 추가)
- `fields`: 입력 항목 순서 배열 (`id|password|passwordConfirm|birthdate|phone`)
- `terms`: 약관 순서 배열 (`tos|privacy|age14|marketing`)

## 절차
1. **레지스트리 추가** — `src/services/registry.ts` 의 `SERVICES` 에 `ServiceConfig` 항목 추가.
   - 새 `id`/`brandColor` 면 `src/services/types.ts`(ServiceId)·`src/ui/theme.ts`(BrandColor)도 확장.
2. **HTML 엔트리** — 루트에 `<id>.html` 생성. (community.html 복사 후 title/스크립트 경로 수정)
3. **엔트리 tsx** — `src/entries/<id>.tsx`: `import { bootstrap } from '@/app/bootstrap'; void bootstrap('<id>');`
4. **Vite input** — `vite.config.ts` 의 `build.rollupOptions.input` 에 `'<id>': resolve(root, '<id>.html')` 추가.
5. **검증** — `pnpm build` 로 `dist/<id>.html` 이 독립 산출되는지 확인.

## 새 입력 항목/약관이 필요할 때
- **새 필드**: `src/services/types.ts`(FieldKey) + `src/signup/schema.ts`(FIELD_SCHEMAS) + `src/signup/fields.tsx`(컴포넌트·FIELD_COMPONENTS) 세 곳에 등록.
- **새 약관**: `src/services/types.ts`(TermKey) + `src/signup/terms.ts`(TERM_DEFS) 두 곳에 등록.
- 새 필드/약관처럼 구조가 늘어나는 변경은 `/design-note` 로 의도를 남긴다.

## 원칙
- 변경이 "설정 추가"를 넘어 공통 컴포넌트 수정으로 번지면, 그건 추상화가 새는 신호다 — 멈추고 구조를 재검토한다.
- 검증 통과(빌드로 dist HTML 생성 확인)를 가정하지 말고 실제로 돌린다.
