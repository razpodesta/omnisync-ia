/** eslint.config.mjs */

import nx from '@nx/eslint-plugin';

/**
 * @name OmnisyncEslintConfiguration
 * @description Configuración de reglas de linting para el ecosistema Omnisync-AI.
 * Define las fronteras de comunicación entre piezas LEGO y prohíbe el uso de tipos débiles.
 */
export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  {
    /**
     * @section Ignorados de Élite
     * Excluye archivos de construcción, caché y reportes de telemetría del análisis.
     */
    ignores: [
      '**/dist',
      '**/out-tsc',
      '**/.next',
      '**/node_modules',
      '.nx',
      'coverage',
      'test-results',
      'snapshot-reports',
      'playwright-report'
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      /**
       * @rule enforce-module-boundaries
       * @description Define la jerarquía de dependencia entre capas LEGO.
       * Core -> autónomo.
       * Integrations -> depende de Core.
       * Domain -> depende de Core e Integrations.
       */
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'scope:core',
              onlyDependOnLibsWithTags: ['scope:core']
            },
            {
              sourceTag: 'scope:integrations',
              onlyDependOnLibsWithTags: ['scope:core', 'scope:integrations']
            },
            {
              sourceTag: 'scope:domain',
              onlyDependOnLibsWithTags: ['scope:core', 'scope:integrations', 'scope:domain']
            },
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: ['scope:core', 'scope:integrations', 'scope:domain', 'type:ui']
            }
          ],
        },
      ],
      /**
       * @rule no-explicit-any
       * @description Erradicación total de tipos débiles para garantizar integridad de datos.
       */
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'log', 'debug'] }]
    },
  },
];