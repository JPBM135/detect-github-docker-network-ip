import { browser, common, node, prettier, typescript } from 'eslint-config-neon';
import merge from 'lodash.merge';
import vitest from 'eslint-plugin-vitest';

/**
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigArray}
 */
const globalConfig = [
  {
    ignores: ['.yarn/', 'dist/', 'node_modules/', '.esbuild/', '.serverless/'],
  },
  ...[
    ...common,
    ...browser,
    ...node,
    ...typescript,
    ...prettier,
    {
      rules: {
        'n/no-sync': 'off',
        'n/prefer-global/process': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        'no-restricted-imports': [
          'error',
          {
            name: '@apollo/client',
            message: 'Importing Apollo Client directly is not allowed. Use the @apollo/client/core package instead.',
          },
        ],
        '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
        'rxjs/no-implicit-any-catch': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
        'no-restricted-globals': 'off',
        'unicorn/prefer-node-protocol': 'error',
        '@typescript-eslint/consistent-type-imports': 'error',
      },
    },
  ].map((config) =>
    merge(config, {
      files: ['src/**/*.ts'],
      languageOptions: {
        parserOptions: {
          projectService: true,
        },
      },
    }),
  ),
  ...[
    {
      plugins: {
        vitest,
      },
      settings: {
        vitest: {
          typecheck: true,
        },
      },
      rules: {
        ...vitest.configs.recommended.rules,
        'vitest/max-nested-describe': ['error', { max: 3 }],
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-confusing-void-expression': 'off',
        '@typescript-eslint/dot-notation': 'off',
      },
    },
  ].map((config) =>
    merge(config, {
      files: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
      languageOptions: {
        globals: {
          ...vitest.environments.env.globals,
        },
        parserOptions: {
          projectService: true,
        },
      },
    }),
  ),
];

export default globalConfig;
