/** libs/tools/internal-scripts/src/lib/library-integrity-auditor.apparatus.ts */

import * as fileSystem from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { glob } from 'glob';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import {
  LibraryIntegritySeedSchema,
  ILibraryIntegritySeed,
  ILibraryFinding,
} from './schemas/library-integrity-auditor.schema';

/**
 * @name LibraryIntegrityAuditor
 * @description Aparato encargado de velar por la consistencia técnica de las piezas LEGO.
 * Audita los archivos de configuración de TypeScript para asegurar que todas las librerías
 * operen bajo el mismo estándar de compilación y tipos.
 *
 * @protocol OEDP-Level: Elite (Workplace Governance)
 */
export class LibraryIntegrityAuditor {
  /**
   * @private
   * @description Destino institucional para los reportes de DNA.
   */
  private static readonly SEED_OUTPUT_PATH =
    'reports/infrastructure/library-dna';

  // Estándares obligatorios de compilación 2026
  private static readonly REQUIRED_COMPILATION_TARGET = 'es2022';
  private static readonly REQUIRED_TYPE_DEFINITIONS = 'node';

  /**
   * @method executeSovereignDnaAudit
   * @description Orquesta la inspección profunda de todos los tsconfig.lib.json del monorepo.
   *
   * @returns {Promise<ILibraryIntegritySeed>} Semilla de integridad validada por SSOT.
   */
  public static async executeSovereignDnaAudit(): Promise<ILibraryIntegritySeed> {
    const apparatusName = 'LibraryIntegrityAuditor';
    const operationName = 'executeSovereignDnaAudit';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        // Localización de manifiestos de configuración de librerías
        const libraryConfigurationFiles = await glob(
          'libs/**/tsconfig.lib.json',
          {
            ignore: ['**/node_modules/**', '**/dist/**'],
          },
        );

        const auditFindingsCollection: ILibraryFinding[] = [];

        for (const configurationPath of libraryConfigurationFiles) {
          auditFindingsCollection.push(
            this.evaluateLibraryStandardCompliance(configurationPath),
          );
        }

        const compliantLibrariesCount = auditFindingsCollection.filter(
          (finding) => finding.isCompliant,
        ).length;
        const totalLibrariesCount = auditFindingsCollection.length;

        const calculatedComplianceScore =
          totalLibrariesCount > 0
            ? (compliantLibrariesCount / totalLibrariesCount) * 100
            : 100;

        const auditSeedPayload: ILibraryIntegritySeed = {
          reportId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          totalLibrariesAudited: totalLibrariesCount,
          complianceScore: Math.round(calculatedComplianceScore),
          findings: auditFindingsCollection,
          aiContext: {
            summary: `Audit complete. Ecosistema operando al ${calculatedComplianceScore.toFixed(2)}% de fidelidad técnica.`,
            criticalViolationsCount:
              totalLibrariesCount - compliantLibrariesCount,
          },
        };

        // Persistencia del hallazgo en el repositorio de infraestructura
        this.persistSovereignAuditSeed(auditSeedPayload);

        return LibraryIntegritySeedSchema.parse(auditSeedPayload);
      },
    );
  }

  /**
   * @method evaluateLibraryStandardCompliance
   * @private
   * @description Analiza el contenido de un tsconfig para detectar divergencias de ADN.
   */
  private static evaluateLibraryStandardCompliance(
    filePath: string,
  ): ILibraryFinding {
    const apparatusName = 'LibraryIntegrityAuditor';

    try {
      const rawConfigurationContent = fileSystem.readFileSync(
        filePath,
        'utf-8',
      );
      const parsedConfiguration = JSON.parse(rawConfigurationContent) as {
        compilerOptions?: { target?: string; types?: string[] };
      };

      const compilerOptions = parsedConfiguration.compilerOptions || {};
      const detectedAnomalies: string[] = [];

      // Validación de Target de Compilación
      if (compilerOptions.target !== this.REQUIRED_COMPILATION_TARGET) {
        detectedAnomalies.push(
          `INVALID_TARGET: ${compilerOptions.target || 'UNDEFINED'}`,
        );
      }

      // Validación de Definiciones de Tipos
      if (!compilerOptions.types?.includes(this.REQUIRED_TYPE_DEFINITIONS)) {
        detectedAnomalies.push(
          `MISSING_CORE_TYPES: ${this.REQUIRED_TYPE_DEFINITIONS}`,
        );
      }

      const isCompliant = detectedAnomalies.length === 0;

      return {
        libraryPath: filePath,
        isCompliant,
        anomalies: detectedAnomalies,
        remediationHint: isCompliant
          ? 'N/A: Estándar óptimo.'
          : `Update target to ${this.REQUIRED_COMPILATION_TARGET} and include '${this.REQUIRED_TYPE_DEFINITIONS}' types.`,
      };
    } catch (criticalParsingError: unknown) {
      // Reporte al Sentinel ante fallos físicos de lectura o JSON corrupto
      OmnisyncSentinel.report({
        errorCode: 'OS-CORE-001',
        severity: 'LOW',
        apparatus: apparatusName,
        operation: 'evaluate_file',
        message: `Incapacidad de procesar configuración en: ${filePath}`,
        context: { errorDetail: String(criticalParsingError) },
      });

      return {
        libraryPath: filePath,
        isCompliant: false,
        anomalies: ['PARSING_FAILURE'],
        remediationHint: 'Verify JSON syntax and file permissions.',
      };
    }
  }

  /**
   * @method persistSovereignAuditSeed
   * @private
   */
  private static persistSovereignAuditSeed(
    auditSeed: ILibraryIntegritySeed,
  ): void {
    const reportFileName = `${new Date().toISOString().replace(/[:.]/g, '-')}-library-audit.json`;
    const absolutePath = path.join(
      process.cwd(),
      this.SEED_OUTPUT_PATH,
      reportFileName,
    );

    try {
      fileSystem.mkdirSync(path.dirname(absolutePath), { recursive: true });
      fileSystem.writeFileSync(
        absolutePath,
        JSON.stringify(auditSeed, null, 2),
        'utf-8',
      );

      OmnisyncTelemetry.verbose(
        'LibraryIntegrityAuditor',
        'persist_seed',
        `Hallazgo de DNA persistido: ${reportFileName}`,
      );
    } catch (ioError: unknown) {
      console.error(
        '[CRITICAL-IO-FAILURE]: No se pudo escribir la semilla de integridad de librerías.',
        ioError,
      );
    }
  }
}
