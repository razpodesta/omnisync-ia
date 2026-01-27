/** eslint.config.mjs */

import nxPlugin from '@nx/eslint-plugin';

/**
 * @name GlobalLintingConfiguration
 * @description Aparato de gobernanza de integridad para el ecosistema Omnisync-AI.
 * Orquesta las fronteras de módulos (Module Boundaries) y las leyes de calidad
 * del código para garantizar una arquitectura LEGO escalable y sin regresiones.
 * Implementa la visión ultra-holística de soberanía por capas.
 *
 * @protocol OEDP-Level: Elite (Gobernanza Total)
 */
export default [
  ...nxPlugin.configs['flat/base'],
  ...nxPlugin.configs['flat/typescript'],
  {
    /**
     * @section Exclusiones de Análisis
     * Rutas de artefactos de compilación, backups y snapshots que no deben
     * ser procesados por el motor de calidad.
     */
    ignores: [
      '**/dist',
      '**/out-tsc',
      '**/node_modules',
      '.nx',
      'snapshot-reports',
      'internal-backups'
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      /**
       * @section Nx Module Boundaries (Jerarquía de Dependencias)
       * Define las leyes de importación inmutables para mantener la pureza de la arquitectura.
       */
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              /**
               * @description Capa Core: Cimientos técnicos del sistema.
               * Solo puede depender de sí misma para evitar acoplamientos circulares.
               */
              sourceTag: 'scope:core',
              onlyDependOnLibsWithTags: ['scope:core']
            },
            {
              /**
               * @description Capa de Infraestructura: Persistencia y adaptadores de bajo nivel.
               * Depende exclusivamente de los contratos y utilidades del núcleo.
               */
              sourceTag: 'type:infrastructure',
              onlyDependOnLibsWithTags: ['scope:core', 'type:infrastructure']
            },
            {
              /**
               * @description Capa de Integraciones: Drivers de Inteligencia Artificial y ERP.
               * Consumen el núcleo y su propia lógica de integración.
               */
              sourceTag: 'scope:integrations',
              onlyDependOnLibsWithTags: ['scope:core', 'scope:integrations']
            },
            {
              /**
               * @description Capa de Dominio: Lógica de negocio pura (Tenants/Support).
               * Orquesta contratos e integraciones específicas de la industria.
               */
              sourceTag: 'scope:domain',
              onlyDependOnLibsWithTags: ['scope:core', 'scope:integrations', 'scope:domain']
            },
            {
              /**
               * @description Capa UI: Componentes visuales y Widgets.
               * Blindaje estricto: Solo consume contratos y utilidades, prohibido acceder a base de datos.
               */
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['scope:core', 'type:ui']
            },
            {
              /**
               * @description Capa de Aplicación: Orchestrator-API y Dashboard.
               * Posee soberanía total para orquestar todas las piezas LEGO del ecosistema.
               */
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'scope:core',
                'scope:integrations',
                'scope:domain',
                'type:ui',
                'type:infrastructure'
              ]
            },
            {
              /**
               * @description Capa de Herramientas (Internal Scripts): Auditorías y automatización.
               * Posee permiso de observación sobre el núcleo y la infraestructura para diagnósticos.
               * NIVELACIÓN: Habilita el flujo de internal-scripts hacia persistence y telemetry.
               */
              sourceTag: 'scope:tools',
              onlyDependOnLibsWithTags: [
                'scope:core',
                'type:infrastructure',
                'scope:tools'
              ]
            }
          ],
        },
      ],

      /**
       * @section Reglas de Calidad Estructural (TS-Elite)
       */
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-inferrable-types': 'error',
      'prefer-const': 'error'
    },
  },
];
