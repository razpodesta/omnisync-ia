/** libs/tools/internal-scripts/eslint.config.mjs */

import baseConfig from '../../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['package.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          /**
           * @section Ignorar falsos positivos
           * A veces el linter no detecta el uso de librerías core en scripts de node.
           * Forzamos su permanencia ya que son vitales para la auditoría y persistencia.
           */
          ignoredDependencies: [
            '@omnisync/core-contracts',
            '@omnisync/persistence'
          ]
        }
      ]
    }
  }
];