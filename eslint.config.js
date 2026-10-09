import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';

export default [
  {
    ignores: ['coverage/**', 'node_modules/**', 'types/**'],
  },
  js.configs.recommended,
  {
    plugins: {
      jsdoc,
    },
    languageOptions: {
      ecmaVersion: 2024,
      globals: globals.node,
      sourceType: 'module',
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      'jsdoc/check-types': 'error',
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: { cjs: false, esm: true, window: false },
          require: {
            ArrowFunctionExpression: true,
            ClassDeclaration: true,
            ClassExpression: true,
            FunctionDeclaration: true,
            FunctionExpression: true,
            MethodDefinition: true,
          },
        },
      ],
      'jsdoc/require-param': 'error',
      'jsdoc/require-param-type': 'error',
      'jsdoc/require-returns': 'error',
      'jsdoc/require-returns-type': 'error',
    },
  },
  {
    files: ['src/core/**/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['*/modules/*', '**/src/modules/**', './modules/**'],
              message:
                'src/core/ never imports from src/modules/; the interactions script is emitted as data.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/modules/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
];
