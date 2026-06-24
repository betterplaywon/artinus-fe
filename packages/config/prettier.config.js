// 루트 .prettierrc.json 과 동일한 규칙을 코드로 공유하기 위한 진입점.
// 앱/패키지에서 `@artinus/config/prettier.config.js` 로 참조할 수 있다.
/** @type {import('prettier').Config} */
export default {
  singleQuote: true,
  semi: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  arrowParens: 'always',
};
