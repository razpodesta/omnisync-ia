/** libs/tools/internal-scripts/src/lib/data-snapshot-extractor.apparatus.ts */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { z } from 'zod';
import { OmnisyncDatabase } from '@omnisync-ecosystem/persistence';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';

/**
 * @name SovereignSnapshotSeedSchema
 * @description Contrato de integridad para el snapshot de ADN del sistema.
 */
const SovereignSnapshotSeedSchema = z.object({
  snapshotIdentifier: z.string().uuid(),
  timestamp: z.string().datetime(),
  schemaVersion: z.string(),
  layers: z.object({
    relational: z.object({ status: z.string(), recordsCaptured: z.number() }),
    vectorial: z.object({ status: z.string(), collectionsNoted: z.number() }),
    volatile: z.object({ status: z.string(), keysNoted: z.number() })
  }),
  checksum: z.string()
}).readonly();

export type ISovereignSnapshotSeed = z.infer<typeof SovereignSnapshotSeedSchema>;

/**
 * @name DataSnapshotExtractor
 * @description Aparato encargado de la persistencia de seguridad del estado del sistema.
 * Genera copias de fidelidad total del ADN operativo para auditoría y recuperación.
 *
 * @protocol OEDP-Level: Ultra-Holistic (System DNA Chronicler)
 */
export class DataSnapshotExtractor {
  private static readonly SNAPSHOT_BASE_DIRECTORY = 'internal-backups/snapshots';

  /**
   * @method executeSovereignSnapshotExtraction
   * @description Orquesta el volcado coordinado de todas las capas de datos del ecosistema.
   */
  public static async executeSovereignSnapshotExtraction(): Promise<ISovereignSnapshotSeed> {
    return await OmnisyncTelemetry.traceExecution('DataSnapshotExtractor', 'execute', async () => {
      const snapshotStartTime = new Date().toISOString();
      const snapshotId = crypto.randomUUID();

      // 1. Snapshot de Capa Relacional (Supabase/PostgreSQL)
      const relationalStatus = await this.captureRelationalDNA();

      // 2. Snapshot de Capa Vectorial (Qdrant - Metadata Only)
      const vectorialStatus = await this.captureVectorialMetadata();

      const seedPayload: ISovereignSnapshotSeed = {
        snapshotIdentifier: snapshotId,
        timestamp: snapshotStartTime,
        schemaVersion: '2026.01.v1',
        layers: {
          relational: relationalStatus,
          vectorial: vectorialStatus,
          volatile: { status: 'OBSERVED', keysNoted: 0 } // Integración con Redis en fase 2
        },
        checksum: 'PENDING_SHA256'
      };

      this.persistSeedToDisk(seedPayload, 'master-integrity.json');

      console.log(`[DNA-SNAPSHOT-COMPLETED]: ID ${snapshotId}`);
      return SovereignSnapshotSeedSchema.parse(seedPayload);
    });
  }

  /**
   * @method captureRelationalDNA
   * @private
   * @description Resuelve el error TS2339 usando la propiedad nivelada 'databaseEngine'.
   */
  private static async captureRelationalDNA() {
    try {
      const engine = OmnisyncDatabase.databaseEngine;

      // Captura atómica de tablas núcleo
      const [tenants, supportThreads] = await Promise.all([
        engine.tenant.findMany(),
        engine.supportThread.findMany()
      ]);

      this.persistDataChunk('supabase/tenants-records.json', tenants);
      this.persistDataChunk('supabase/support-threads.json', supportThreads);

      return {
        status: 'SUCCESS',
        recordsCaptured: tenants.length + supportThreads.length
      };
    } catch (criticalError: unknown) {
      await OmnisyncSentinel.report({
        errorCode: 'OS-CORE-002',
        severity: 'HIGH',
        apparatus: 'DataSnapshotExtractor',
        operation: 'capture_relational',
        message: 'core.snapshot.relational_failure',
        context: { error: String(criticalError) }
      });
      return { status: 'FAILED', recordsCaptured: 0 };
    }
  }

  /**
   * @method captureVectorialMetadata
   * @private
   */
  private static async captureVectorialMetadata() {
    // Actualmente la captura de vectores es informativa para evitar latencia de Scroll API
    this.persistDataChunk('qdrant/vector-status.json', {
      lastAudit: new Date().toISOString(),
      note: 'Semantic vector data persists in Qdrant Cloud Cluster'
    });
    return { status: 'OBSERVED', collectionsNoted: 1 };
  }

  /**
   * @method persistDataChunk
   * @private
   */
  private static persistDataChunk(relativePath: string, data: unknown): void {
    const fullPath = path.join(process.cwd(), this.SNAPSHOT_BASE_DIRECTORY, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf-8');
  }

  private static persistSeedToDisk(seed: ISovereignSnapshotSeed, fileName: string): void {
    const fullPath = path.join(process.cwd(), this.SNAPSHOT_BASE_DIRECTORY, fileName);
    fs.writeFileSync(fullPath, JSON.stringify(seed, null, 2), 'utf-8');
  }
}
