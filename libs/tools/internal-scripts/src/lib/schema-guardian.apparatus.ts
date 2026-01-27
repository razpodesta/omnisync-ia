/** libs/tools/internal-scripts/src/lib/schema-guardian.apparatus.ts */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { glob } from 'glob';
import { z } from 'zod';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';

/**
 * @name SchemaIntegritySeedSchema
 * @description Contrato SSOT para el reporte de paridad Aparato-Esquema.
 */
const SchemaIntegritySeedSchema = z.object({
  reportId: z.string().uuid(),
  timestamp: z.string().datetime(),
  statistics: z.object({
    totalApparatusFound: z.number(),
    compliantApparatusCount: z.number(),
    integrityPercentage: z.number().min(0).max(100)
  }),
  orphans: z.array(z.object({
    apparatusName: z.string(),
    apparatusPath: z.string(),
    expectedSchemaPath: z.string(),
    violationType: z.enum(['MISSING_FILE', 'EMPTY_CONTRACT'])
  })),
  aiContext: z.object({
    isSystemCompromised: z.boolean(),
    remediationHint: z.string()
  })
}).readonly();

export type ISchemaIntegritySeed = z.infer<typeof SchemaIntegritySeedSchema>;

/**
 * @name SchemaGuardian
 * @description Aparato de gobernanza estructural. Garantiza que cada pieza lógica
 * (Aparato) posea un contrato de validación inmutable (Schema) bajo el estándar OEDP.
 *
 * @protocol OEDP-Level: Ultra-Holistic (Contract Censor)
 */
export class SchemaGuardian {
  private static readonly SEED_OUTPUT_PATH = 'reports/infrastructure/contracts';
  private static readonly MINIMUM_SCHEMA_SIZE_BYTES = 50; // Evita archivos dummy

  /**
   * @method executeSovereignIntegrityAudit
   * @description Escanea el monorepo y genera una semilla de integridad de contratos.
   */
  public static async executeSovereignIntegrityAudit(): Promise<ISchemaIntegritySeed> {
    return await OmnisyncTelemetry.traceExecution('SchemaGuardian', 'audit', async () => {
      const apparatusFiles = await glob('libs/**/*.apparatus.ts', { ignore: '**/node_modules/**' });
      const orphans: any[] = []; // Inferencia para mapeo, validada por Zod al final.
      let compliantCount = 0;

      for (const apparatusPath of apparatusFiles) {
        const evaluation = this.evaluateApparatusContract(apparatusPath);

        if (evaluation.isCompliant) {
          compliantCount++;
        } else {
          orphans.push({
            apparatusName: path.basename(apparatusPath),
            apparatusPath: apparatusPath,
            expectedSchemaPath: evaluation.expectedPath,
            violationType: evaluation.violationType
          });
        }
      }

      const total = apparatusFiles.length;
      const integrity = total > 0 ? (compliantCount / total) * 100 : 100;

      const seed: ISchemaIntegritySeed = {
        reportId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        statistics: {
          totalApparatusFound: total,
          compliantApparatusCount: compliantCount,
          integrityPercentage: Math.round(integrity)
        },
        orphans,
        aiContext: {
          isSystemCompromised: integrity < 90,
          remediationHint: integrity < 100
            ? `Create Zod schemas for the ${orphans.length} orphaned apparatuses in their respective /schemas directory.`
            : 'Integrity is optimal. All apparatuses are protected by SSOT contracts.'
        }
      };

      this.persistIntegritySeed(seed);
      return SchemaIntegritySeedSchema.parse(seed);
    });
  }

  /**
   * @method evaluateApparatusContract
   * @private
   */
  private static evaluateApparatusContract(apparatusPath: string) {
    const dir = path.dirname(apparatusPath);
    const baseName = path.basename(apparatusPath, '.apparatus.ts');
    const expectedPath = path.join(dir, 'schemas', `${baseName}.schema.ts`);

    if (!fs.existsSync(expectedPath)) {
      return { isCompliant: false, expectedPath, violationType: 'MISSING_FILE' };
    }

    const stats = fs.statSync(expectedPath);
    if (stats.size < this.MINIMUM_SCHEMA_SIZE_BYTES) {
      return { isCompliant: false, expectedPath, violationType: 'EMPTY_CONTRACT' };
    }

    return { isCompliant: true, expectedPath };
  }

  /**
   * @method persistIntegritySeed
   * @private
   */
  private static persistIntegritySeed(seed: ISchemaIntegritySeed): void {
    const fileName = `${new Date().toISOString().replace(/[:.]/g, '-')}-schema-integrity.json`;
    const fullPath = path.join(process.cwd(), this.SEED_OUTPUT_PATH, fileName);

    try {
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, JSON.stringify(seed, null, 2), 'utf-8');
      console.log(`[SEED-GENERATED]: ${fileName} (Structural Integrity Captured)`);
    } catch (e) {
      // No lanzamos error para no detener el build, pero reportamos la anomalía
      console.error('[SCHEMA-GUARDIAN-FAILURE] Could not persist integrity seed', e);
    }
  }
}
