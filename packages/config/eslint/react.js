import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

// eslint-plugin-react-hooks 의 flat-config 키는 버전에 따라 달라져 왔으므로 방어적으로 선택한다.
const reactHooksRules =
  reactHooks.configs?.['recommended-latest']?.rules ?? reactHooks.configs?.recommended?.rules ?? {};

/**
 * 두 앱이 공유하는 ESLint 플랫 설정.
 *
 * 설계 의도:
 * - 타입 인지(type-aware) 린팅은 의도적으로 제외했다. 모노레포 전역에 parserOptions.project 를
 *   매기는 비용/속도 손해 대비 이득이 작고, 타입 정합성은 이미 `tsc`(strict)가 게이트한다.
 *   → 린트는 "스타일·실수 방지", 타입체크는 "정합성"으로 역할을 분리한다.
 */
export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/*.config.{js,cjs,ts}'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooksRules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'warn',
    },
  },
);
