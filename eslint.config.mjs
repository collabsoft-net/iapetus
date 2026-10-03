
import js from '@eslint/js';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import typescriptParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: [
      "**/*.js", 
      "**/*.ts", 
      "**/*.tsx"
    ],
    ignores: [
      '.yarn',
      '**/lib/**',
      '**/dist/**',
      '**/public/**',
      '**/typings/**',
      '**/node_modules/**'
    ],
    languageOptions: {
      parser: typescriptParser,
      globals: {
        ...globals.node
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSortPlugin,
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/ban-ts-ignore': 'off',
      '@typescript-eslint/no-empty-interface': 'warn',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': [ 'error', {
        'args': 'all',
        'argsIgnorePattern': '^_',
        'caughtErrors': 'all',
        'caughtErrorsIgnorePattern': '^_',
        'destructuredArrayIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'ignoreRestSiblings': true
      }],
      'simple-import-sort/imports': 'error',
      'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
      'no-trailing-spaces': 'error',
    }
  }
]);
