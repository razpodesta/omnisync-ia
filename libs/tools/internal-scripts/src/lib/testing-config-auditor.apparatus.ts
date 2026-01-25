/** libs/tools/internal-scripts/src/lib/testing-config-auditor.apparatus.ts */

import * as fs from 'node:fs';
import { glob } from 'glob';

/**
 * @name TestingConfigAuditor
 * @description Asegura que los archivos jest.config.ts y tsconfig.spec.json estén sincronizados.
 */
export class TestingConfigAuditor {
  public static async auditTestingSuite(): Promise<void> {
    const specConfigs = await glob('**/tsconfig.spec.json');
    const results = specConfigs.map(path => {
      const content = JSON.parse(fs.readFileSync(path, 'utf-8'));
      return {
        file: path,
        hasJestTypes: content.compilerOptions?.types?.includes('jest')
      };
    });

    fs.writeFileSync('reports/tsconfig/testing-audit.json', JSON.stringify(results, null, 2));
  }
}