// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['dist/', 'node_modules/', 'coverage/', '*.tgz'],
  },
  {
    rules: {
      // TypeScript 已经通过 strict: true 做了类型检查，所以禁用部分 TS 风格的 lint
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-require-imports': 'error',

      // 通用规则
      'no-console': 'off',        // CLI 工具需要 console
      'prefer-const': 'warn',
      'no-var': 'error',
      'eqeqeq': ['warn', 'always'],
      'curly': ['warn', 'multi-line'],
    },
  },
);
