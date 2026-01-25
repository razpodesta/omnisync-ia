/** libs/tools/internal-scripts/src/lib/workspace-config-auditor.apparatus.ts */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @name WorkspaceConfigAuditor
 * @description Audita el archivo tsconfig.base.json y nx.json para asegurar alineación con el algoritmo.
 */
export class WorkspaceConfigAuditor {
  public static async auditGlobalConfig(): Promise<void> {
    return await OmnisyncTelemetry.traceExecution('WorkspaceConfigAuditor', 'audit', async () => {
      const rootDirectory = process.cwd();
      const tsConfigPath = path.join(rootDirectory, 'tsconfig.base.json');
      const reportPath = path.join(rootDirectory, 'reports', 'tsconfig', 'global-audit.json');

      const config = JSON.parse(fs.readFileSync(tsConfigPath, 'utf-8'));
      const issues: string[] = [];

      // Validación de Estándar de Rutas LEGO
      const paths = config.compilerOptions.paths;
      Object.keys(paths).forEach(alias => {
        if (!alias.startsWith('@omnisync/')) {
          issues.push(`Alias fuera de estándar detectado: ${alias}. Debe usar @omnisync/`);
        }
      });

      this.saveReport(reportPath, { timestamp: new Date().toISOString(), issues, status: issues.length === 0 ? 'SUCCESS' : 'FAILED' });
    });
  }

  private static saveReport(filePath: string, data: unknown): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
}