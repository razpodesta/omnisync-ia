/** libs/tools/internal-scripts/src/lib/schema-guardian.apparatus.ts */

import * as fileSystem from 'node:fs';
import { z } from 'zod';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { glob } from 'glob';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import {
  SchemaIntegritySeedSchema,
  ISchemaIntegritySeed,
  ISchemaOrphan,
  SchemaViolationTypeSchema,
} from './schemas/schema-guardian.schema';

/**
 * @name SchemaGuardian
 * @description Aparato de gobernanza estructural de élite.
 * Garantiza que cada pieza lógica (Aparato) posea un contrato de validación inmutable (Schema)
 * bajo el protocolo OEDP. Actúa como el censor de calidad del ADN del monorepo.
 *
 * @protocol OEDP-Level: Elite (Sovereign Governance)
 */
export class SchemaGuardian {
  /**
   * @private
   * @description Ruta de salida para los reportes de infraestructura.
   */
  private static readonly REPORT_OUTPUT_DIRECTORY =
    'reports/infrastructure/contracts';

  /**
   * @private
   * @description Límite físico para considerar un esquema como válido y no un archivo dummy.
   */
  private static readonly MINIMUM_SCHEMA_SIZE_BYTES = 50;

  /**
   * @method executeSovereignIntegrityAudit
   * @description Orquesta el escaneo masivo del monorepo buscando violaciones de paridad
   * entre lógica y contrato. Genera una semilla inmutable para auditoría externa.
   *
   * @returns {Promise<ISchemaIntegritySeed>} El reporte de integridad validado por SSOT.
   */
  public static async executeSovereignIntegrityAudit(): Promise<ISchemaIntegritySeed> {
    const apparatusName = 'SchemaGuardian';
    const operationName = 'executeSovereignIntegrityAudit';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        /**
         * @section Fase 1: Escaneo de Superficie
         * Localizamos todos los archivos .apparatus.ts en la capa de librerías.
         */
        const locatedApparatusFiles = await glob('libs/**/*.apparatus.ts', {
          ignore: ['**/node_modules/**', '**/dist/**'],
        });

        const detectedOrphansCollection: ISchemaOrphan[] = [];
        let totalCompliantCount = 0;

        /**
         * @section Fase 2: Auditoría Quirúrgica de Paridad
         */
        for (const apparatusPath of locatedApparatusFiles) {
          const evaluationResult =
            this.auditApparatusContractParity(apparatusPath);

          if (evaluationResult.isCompliant) {
            totalCompliantCount++;
          } else {
            detectedOrphansCollection.push({
              apparatusName: path.basename(apparatusPath),
              apparatusPath: apparatusPath,
              expectedSchemaPath: evaluationResult.expectedPath,
              violationType: evaluationResult.violationType as z.infer<
                typeof SchemaViolationTypeSchema
              >,
            });
          }
        }

        const totalApparatusCount = locatedApparatusFiles.length;
        const integrityPercentage =
          totalApparatusCount > 0
            ? Math.round((totalCompliantCount / totalApparatusCount) * 100)
            : 100;

        /**
         * @section Fase 3: Consolidación y Sello de Semilla (SSOT)
         */
        const auditSeedPayload: ISchemaIntegritySeed = {
          reportId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          statistics: {
            totalApparatusFound: totalApparatusCount,
            compliantApparatusCount: totalCompliantCount,
            integrityPercentage: integrityPercentage,
          },
          orphans: detectedOrphansCollection,
          aiContext: {
            isSystemCompromised: integrityPercentage < 90,
            remediationHint:
              integrityPercentage < 100
                ? `Immediate action required: Standardize ${detectedOrphansCollection.length} orphaned components.`
                : 'System architecture is in optimal condition. All apparatuses are protected.',
          },
        };

        // Persistencia física del hallazgo
        this.persistSovereignAuditSeed(auditSeedPayload);

        // Validación final contra el esquema granular antes del retorno
        return SchemaIntegritySeedSchema.parse(auditSeedPayload);
      },
    );
  }

  /**
   * @method auditApparatusContractParity
   * @private
   * @description Implementa la heurística de localización de esquemas espejo.
   */
  private static auditApparatusContractParity(apparatusPath: string) {
    const parentDirectory = path.dirname(apparatusPath);
    const componentBaseName = path.basename(apparatusPath, '.apparatus.ts');
    const expectedSchemaFilePath = path.join(
      parentDirectory,
      'schemas',
      `${componentBaseName}.schema.ts`,
    );

    // 1. Verificación de Existencia Física
    if (!fileSystem.existsSync(expectedSchemaFilePath)) {
      return {
        isCompliant: false,
        expectedPath: expectedSchemaFilePath,
        violationType: 'MISSING_FILE',
      };
    }

    // 2. Verificación de Densidad (Evita archivos vacíos)
    const fileMetadata = fileSystem.statSync(expectedSchemaFilePath);
    if (fileMetadata.size < this.MINIMUM_SCHEMA_SIZE_BYTES) {
      return {
        isCompliant: false,
        expectedPath: expectedSchemaFilePath,
        violationType: 'EMPTY_CONTRACT',
      };
    }

    return { isCompliant: true, expectedPath: expectedSchemaFilePath };
  }

  /**
   * @method persistSovereignAuditSeed
   * @private
   * @description Vuelca el resultado en el repositorio de reportes del sistema.
   */
  private static persistSovereignAuditSeed(
    auditSeed: ISchemaIntegritySeed,
  ): void {
    const reportFileName = `${new Date().toISOString().replace(/[:.]/g, '-')}-schema-audit.json`;
    const absoluteFilePath = path.join(
      process.cwd(),
      this.REPORT_OUTPUT_DIRECTORY,
      reportFileName,
    );

    try {
      fileSystem.mkdirSync(path.dirname(absoluteFilePath), { recursive: true });
      fileSystem.writeFileSync(
        absoluteFilePath,
        JSON.stringify(auditSeed, null, 2),
        'utf-8',
      );

      OmnisyncTelemetry.verbose(
        'SchemaGuardian',
        'persist_seed',
        `Reporte inmutable generado: ${reportFileName}`,
      );
    } catch (criticalFileSystemError: unknown) {
      console.error(
        '[CRITICAL-IO-FAILURE]: No se pudo persistir la semilla de auditoría.',
        criticalFileSystemError,
      );
    }
  }
}
