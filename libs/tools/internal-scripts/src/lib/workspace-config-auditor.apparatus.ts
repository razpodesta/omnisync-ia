/** libs/tools/internal-scripts/src/lib/workspace-config-auditor.apparatus.ts */

import * as fileSystem from 'node:fs';
import * as path from 'node:path';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

interface ITypeScriptBaseConfiguration {
  readonly compilerOptions: {
    readonly paths: Record<string, string[]>;
  };
}

interface IGlobalAuditReport {
  readonly timestamp: string;
  readonly anomalies: string[];
  readonly operationalStatus: 'SUCCESS' | 'FAILED';
}

/**
 * @name WorkspaceConfigurationAuditor
 * @description Aparato de gobernanza encargado de validar la integridad de la
 * configuración global del monorepo. Asegura que las rutas LEGO y los alias
 * de TypeScript cumplan con el estándar institucional @omnisync.
 *
 * @protocol OEDP-Level: Elite (Gobernanza de ADN)
 */
export class WorkspaceConfigurationAuditor {
  private static readonly REPORT_OUTPUT_DIRECTORY = 'reports/tsconfig';
  private static readonly REPORT_FILE_NAME = 'global-audit.json';

  /**
   * @method executeGlobalWorkspaceConfigurationAudit
   * @description Realiza un análisis estático del archivo tsconfig.base.json para
   * detectar alias fuera de estándar o rutas mal configuradas.
   */
  public static async executeGlobalWorkspaceConfigurationAudit(): Promise<void> {
    return await OmnisyncTelemetry.traceExecution(
      'WorkspaceConfigurationAuditor',
      'executeAudit',
      async () => {
        const workspaceRootDirectory = process.cwd();
        const typescriptBaseConfigurationPath = path.join(
          workspaceRootDirectory,
          'tsconfig.base.json',
        );
        const detectedConfigurationAnomalies: string[] = [];

        if (!fileSystem.existsSync(typescriptBaseConfigurationPath)) {
          throw new Error(
            `OS-CORE-SCRIPT: No se localizó el archivo de configuración base en ${typescriptBaseConfigurationPath}`,
          );
        }

        try {
          const rawConfigurationContent = fileSystem.readFileSync(
            typescriptBaseConfigurationPath,
            'utf-8',
          );
          const parsedConfiguration = JSON.parse(
            rawConfigurationContent,
          ) as ITypeScriptBaseConfiguration;
          const mappedConfigurationPaths =
            parsedConfiguration.compilerOptions.paths;

          /**
           * @section Validación de Soberanía de Rutas
           * Se exige que todo alias inicie con @omnisync o @omnisync
           * para mantener la jerarquía de marca y evitar colisiones.
           */
          Object.keys(mappedConfigurationPaths).forEach(
            (pathAliasIdentifier) => {
              const isStandardAlias =
                pathAliasIdentifier.startsWith('@omnisync/') ||
                pathAliasIdentifier.startsWith('@omnisync/');

              if (!isStandardAlias) {
                detectedConfigurationAnomalies.push(
                  `Alias fuera de estándar detectado: [${pathAliasIdentifier}]. Debe utilizar el prefijo @omnisync.`,
                );
              }
            },
          );

          const auditReport: IGlobalAuditReport = {
            timestamp: new Date().toISOString(),
            anomalies: detectedConfigurationAnomalies,
            operationalStatus:
              detectedConfigurationAnomalies.length === 0
                ? 'SUCCESS'
                : 'FAILED',
          };

          this.persistAuditAnomaliesReport(auditReport);

          if (detectedConfigurationAnomalies.length > 0) {
            OmnisyncTelemetry.verbose(
              'WorkspaceConfigurationAuditor',
              'anomaly_detected',
              `Se encontraron ${detectedConfigurationAnomalies.length} violaciones de estándar.`,
            );
          }
        } catch (parsingError: unknown) {
          OmnisyncTelemetry.verbose(
            'WorkspaceConfigurationAuditor',
            'critical_failure',
            String(parsingError),
          );
          throw parsingError;
        }
      },
    );
  }

  /**
   * @method persistAuditAnomaliesReport
   * @private
   * @description Vuelca los resultados del análisis en el repositorio de reportes.
   */
  private static persistAuditAnomaliesReport(
    reportData: IGlobalAuditReport,
  ): void {
    const absoluteReportPath = path.join(
      process.cwd(),
      this.REPORT_OUTPUT_DIRECTORY,
      this.REPORT_FILE_NAME,
    );
    const targetDirectory = path.dirname(absoluteReportPath);

    if (!fileSystem.existsSync(targetDirectory)) {
      fileSystem.mkdirSync(targetDirectory, { recursive: true });
    }

    fileSystem.writeFileSync(
      absoluteReportPath,
      JSON.stringify(reportData, null, 2),
      'utf-8',
    );
  }
}
