import eslint from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

export default [
  { ignores: ['dist'] },
  ...tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    prettierConfig,
    {
      rules: {
        '@typescript-eslint/no-empty-object-type': 'off',
      },
    },
    {
      // Build and test scripts run in Node, outside the typed `src` config.
      files: ['scripts/**/*.mjs'],
      languageOptions: {
        globals: {
          console: 'readonly',
          process: 'readonly',
        },
      },
    },
  ),
]
