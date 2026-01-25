/** libs/tools/internal-scripts/src/lib/library-integrity-auditor.apparatus.ts */

import * as fs from 'node:fs';
import { glob } from 'glob';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @name LibraryIntegrityAuditor
 * @description Verifica que cada tsconfig.lib.json incluya los tipos de node y el target es2022.
 */
export class LibraryIntegrityAuditor {
  public static async auditLibraries(): Promise<void> {
    const libConfigs = await glob('libs/**/tsconfig.lib.json');
    const report: any[] = [];

    for (const configPath of libConfigs) {
      const content = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      const hasNodeTypes = content.compilerOptions?.types?.includes('node');
      const isCorrectTarget = content.compilerOptions?.target === 'es2022';

      report.push({
        path: configPath,
        valid: hasNodeTypes && isCorrectTarget,
        missingNodeTypes: !hasNodeTypes
      });
    }

    fs.writeFileSync('reports/tsconfig/libraries-audit.json', JSON.stringify(report, null, 2));
  }
}