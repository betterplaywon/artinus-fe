import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

// eslint-plugin-react-hooks 의 flat-config 키는 버전에 따라 달라져 방어적으로 선택한다.
const reactHooksRules =
  reactHooks.configs?.['recommended-latest']?.rules ?? reactHooks.configs?.recommended?.rules ?? {};

/**
 * ESLint 플랫 설정. 타입 인지 린팅은 제외하고(비용/속도) 타입 정합성은 tsc(strict)가 담당.
 */
export default tseslint.config(
  { ignores: ['dist', 'node_modules', '**/*.config.{js,cjs,ts}'] },
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
