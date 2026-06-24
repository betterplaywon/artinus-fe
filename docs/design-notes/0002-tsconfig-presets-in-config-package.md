# 0002. tsconfig 프리셋을 config 패키지 내부에 둔 이유

- 상태: 채택(Accepted)
- 날짜: 2026-06-24
- 맥락(앱/모듈): shared

## 배경 / 문제
strict tsconfig 베이스를 공유하고 싶다. 처음엔 루트 `tsconfig.base.json` 을 두고 패키지 프리셋이
`../../../tsconfig.base.json` 로 `extends` 하게 했다. `tsc` 는 통과했지만 **Vite 8 빌드가 실패**했다.

## 결정
공유 베이스를 `@artinus/config` **패키지 내부**(`packages/config/tsconfig/base.json`)에 두고,
프리셋(`base-react`, `base-lib`)은 **같은 패키지 내부 상대경로**(`./base.json`)로만 `extends` 한다.
앱은 `@artinus/config/tsconfig/base-react.json` 을 확장한다.

## 고려한 대안
- **루트 base + 패키지 밖 상대경로 extends** — `tsc`(realpath 해석)는 OK, 그러나 Vite 8 의 rolldown/oxc 트랜스폼은
  pnpm 심링크 경로를 그대로 따라 `apps/x/node_modules/@artinus/config/tsconfig/../../../` 가 패키지 밖으로
  새며 `tsconfig.base.json` 을 못 찾는다. → 빌드 실패.
- **각 앱이 옵션을 직접 인라인** — extends 문제는 없으나 strict 옵션이 여러 곳 중복.

## 트레이드오프
- 얻음: `tsc` 와 rolldown 양쪽에서 안정적인 해석. 공유 설정의 단일 출처 유지.
- 포기: "루트 tsconfig" 라는 친숙한 관례. 대신 config 패키지가 모든 공유 설정의 소유자가 된다.

## 영향
- `packages/config/tsconfig/{base,base-react,base-lib}.json`. 루트 `tsconfig.base.json` 제거됨.
- 교훈: 모노레포에서 패키지 간 `extends` 는 **패키지 경계를 넘지 않게** 한다.
- 참고: 현재 `base-react`/`base-lib` 의 compilerOptions 는 동일하다(둘 다 DOM lib + react-jsx — lib 의
  http/cookie 가 DOM 타입을 쓰므로 DOM 필요). 의미상 분리만 해 둔 자리이며, lib 가 react 의존을 갖거나
  타깃이 갈리면 그때 분기한다.
