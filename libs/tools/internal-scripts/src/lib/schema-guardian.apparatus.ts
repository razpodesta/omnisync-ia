/** libs/tools/internal-scripts/src/lib/schema-guardian.apparatus.ts */

import * as fileSystem from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { glob } from 'glob';
import { z } from 'zod';
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
 * @protocol OEDP-Level: Elite (Sovereign Governance V2.6)
 */
export class SchemaGuardian {
  /**
   * @private
   * Ubicación institucional para la persistencia de auditorías de contrato.
   */
  private static readonly REPORT_BASE_PATH = path.resolve(
    process.cwd(),
    'reports/infrastructure/contracts'
  );

  /**
   * @private
   * Umbral físico para invalidar esquemas vacíos o corruptos.
   */
  private static readonly MINIMUM_SCHEMA_SIZE_BYTES = 50;

  /**
   * @method executeSovereignIntegrityAudit
   * @description Orquesta el escaneo masivo del monorepo buscando violaciones de paridad
   * entre lógica y contrato. Genera una semilla inmutable para auditoría externa.
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
         * Localizamos archivos .apparatus tanto en TypeScript puro como en React (tsx).
         */
        const locatedApparatusFiles = await glob('libs/**/*.{apparatus.ts,apparatus.tsx}', {
          ignore: ['**/node_modules/**', '**/dist/**', '**/internal-backups/**'],
        });

        const detectedOrphansCollection: ISchemaOrphan[] = [];
        let totalCompliantCount = 0;

        /**
         * @section Fase 2: Auditoría Quirúrgica de Paridad
         */
        for (const apparatusPath of locatedApparatusFiles) {
          const absoluteApparatusPath = path.resolve(process.cwd(), apparatusPath);
          const evaluationResult = this.auditApparatusContractParity(absoluteApparatusPath);

          if (evaluationResult.isCompliant) {
            totalCompliantCount++;
          } else {
            detectedOrphansCollection.push({
              apparatusName: path.basename(absoluteApparatusPath),
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
                ? `Acción requerida: Estandarizar ${detectedOrphansCollection.length} componentes huérfanos.`
                : 'Arquitectura óptima. Todos los aparatos poseen contratos de integridad.',
          },
        };

        this.persistSovereignAuditSeed(auditSeedPayload);

        return SchemaIntegritySeedSchema.parse(auditSeedPayload);
      }
    );
  }

  /**
   * @method auditApparatusContractParity
   * @private
   * @description Implementa la heurística de localización de esquemas espejo.
   * Soporta la transición de extensiones .tsx a .schema.ts.
   */
  private static auditApparatusContractParity(absoluteApparatusPath: string) {
    const parentDirectory = path.dirname(absoluteApparatusPath);
    
    // Normalización: Extraemos el nombre sin importar si es .ts o .tsx
    const fileName = path.basename(absoluteApparatusPath);
    const componentBaseName = fileName.replace(/\.apparatus\.(ts|tsx)$/, '');
    
    const expectedSchemaFilePath = path.join(
      parentDirectory,
      'schemas',
      `${componentBaseName}.schema.ts`
    );

    const relativeExpectedPath = path.relative(process.cwd(), expectedSchemaFilePath);

    // 1. Verificación de Existencia Física
    if (!fileSystem.existsSync(expectedSchemaFilePath)) {
      return {
        isCompliant: false,
        expectedPath: relativeExpectedPath,
        violationType: 'MISSING_FILE',
      };
    }

    // 2. Verificación de Densidad (Evita archivos dummy)
    const fileMetadata = fileSystem.statSync(expectedSchemaFilePath);
    if (fileMetadata.size < this.MINIMUM_SCHEMA_SIZE_BYTES) {
      return {
        isCompliant: false,
        expectedPath: relativeExpectedPath,
        violationType: 'EMPTY_CONTRACT',
      };
    }

    return { isCompliant: true, expectedPath: relativeExpectedPath };
  }

  /**
   * @method persistSovereignAuditSeed
   * @private
   * @description Vuelca el resultado en el repositorio de reportes del sistema.
   */
  private static persistSovereignAuditSeed(auditSeed: ISchemaIntegritySeed): void {
    const reportFileName = `${new Date().toISOString().replace(/[:.]/g, '-')}-schema-audit.json`;
    const absoluteFilePath = path.join(this.REPORT_BASE_PATH, reportFileName);

    try {
      if (!fileSystem.existsSync(this.REPORT_BASE_PATH)) {
        fileSystem.mkdirSync(this.REPORT_BASE_PATH, { recursive: true });
      }

      fileSystem.writeFileSync(
        absoluteFilePath,
        JSON.stringify(auditSeed, null, 2),
        'utf-8'
      );

      OmnisyncTelemetry.verbose(
        'SchemaGuardian',
        'persistence',
        `Semilla de integridad generada: ${reportFileName}`
      );
    } catch (criticalIOError: unknown) {
      console.error('[CRITICAL-IO-FAILURE]: Error al persistir auditoría.', criticalIOError);
    }
  }
}