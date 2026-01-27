/** libs/tools/internal-scripts/src/lib/connectivity-integrity.apparatus.ts */

import { OmnisyncDatabase } from '@omnisync-ecosystem/persistence';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { z } from 'zod';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * @name ConnectivityReportSchema
 * @description Contrato SSOT para el reporte de salud, optimizado para consumo por IA.
 */
const ConnectivityReportSchema = z.object({
  reportId: z.string().uuid(),
  timestamp: z.string().datetime(),
  environment: z.string(),
  overallStatus: z.enum(['HEALTHY', 'DEGRADED', 'FAILING']),
  nodes: z.record(z.string(), z.object({
    status: z.string(),
    latencyMs: z.number().optional(),
    provider: z.string(),
    error: z.string().optional(),
    remediationHint: z.string().optional()
  })),
  aiContext: z.object({
    summary: z.string(),
    isActionRequired: z.boolean()
  })
}).readonly();

export type IConnectivityReport = z.infer<typeof ConnectivityReportSchema>;

/**
 * @name ConnectivityIntegrity
 * @description Aparato de auditoría profunda de infraestructura Cloud.
 * Genera reportes de grado arquitectónico para el entrenamiento y diagnóstico de IA.
 *
 * @protocol OEDP-Level: Ultra-Holistic (AI-Ready)
 */
export class ConnectivityIntegrity {
  private static readonly REPORT_PATH = 'reports/infrastructure/connectivity';

  /**
   * @method executeSovereignAudit
   * @description Realiza una sonda de 360° sobre los pilares de la red neural.
   */
  public static async executeSovereignAudit(): Promise<IConnectivityReport> {
    return await OmnisyncTelemetry.traceExecution('ConnectivityIntegrity', 'audit', async () => {
      const auditStartTime = performance.now();

      const [supabase, upstash, qdrant] = await Promise.all([
        this.pingSupabaseCloud(),
        this.pingUpstashRedis(),
        this.pingQdrantCloud()
      ]);

      const report: IConnectivityReport = {
        reportId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        environment: process.env['NODE_ENV'] || 'development',
        overallStatus: this.calculateOverallHealth([supabase.status, upstash.status, qdrant.status]),
        nodes: {
          database_sql: supabase,
          memory_cache: upstash,
          vector_engine: qdrant
        },
        aiContext: {
          summary: `Audit completed in ${(performance.now() - auditStartTime).toFixed(2)}ms.`,
          isActionRequired: [supabase.status, upstash.status, qdrant.status].includes('CRITICAL_FAILURE')
        }
      };

      this.persistReportSeed(report);
      return ConnectivityReportSchema.parse(report);
    });
  }

  /**
   * @method pingSupabaseCloud
   * @private
   */
  private static async pingSupabaseCloud() {
    const start = performance.now();
    try {
      await OmnisyncDatabase.databaseEngine.$queryRaw`SELECT 1`;
      return {
        status: 'OPERATIONAL',
        latencyMs: performance.now() - start,
        provider: 'Supabase Cloud (PostgreSQL)',
        remediationHint: 'None required.'
      };
    } catch (e: unknown) {
      return {
        status: 'CRITICAL_FAILURE',
        provider: 'Supabase Cloud',
        error: String(e),
        remediationHint: 'Check DATABASE_URL and Supabase project status. Possible IP block in Geofencing.'
      };
    }
  }

  /**
   * @method pingUpstashRedis
   * @private
   */
  private static async pingUpstashRedis() {
    const start = performance.now();
    try {
      const url = process.env['UPSTASH_REDIS_REST_URL'];
      const token = process.env['UPSTASH_REDIS_REST_TOKEN'];
      if (!url || !token) throw new Error('Missing credentials');

      const res = await fetch(`${url}/ping`, { headers: { Authorization: `Bearer ${token}` } });
      return {
        status: res.ok ? 'OPERATIONAL' : 'DEGRADED',
        latencyMs: performance.now() - start,
        provider: 'Upstash Redis (REST)',
        remediationHint: res.ok ? 'None' : 'Check Upstash monthly quota and REST token validity.'
      };
    } catch (e: unknown) {
      return { status: 'CRITICAL_FAILURE', provider: 'Upstash', error: String(e), remediationHint: 'Verify UPSTASH_REDIS_REST_URL and token in .env.' };
    }
  }

  /**
   * @method pingQdrantCloud
   * @private
   */
  private static async pingQdrantCloud() {
    const start = performance.now();
    try {
      const url = process.env['QDRANT_URL'];
      if (!url) throw new Error('Missing URL');

      const res = await fetch(`${url}/healthz`);
      return {
        status: res.ok ? 'OPERATIONAL' : 'FAILING',
        latencyMs: performance.now() - start,
        provider: 'Qdrant Cloud (Vector DB)',
        remediationHint: res.ok ? 'None' : 'Check Qdrant cluster status and API Key in headers.'
      };
    } catch (e: unknown) {
      return { status: 'CRITICAL_FAILURE', provider: 'Qdrant', error: String(e), remediationHint: 'Verify QDRANT_URL. If on Free Tier, cluster might be hibernating.' };
    }
  }

  private static calculateOverallHealth(statuses: string[]): 'HEALTHY' | 'DEGRADED' | 'FAILING' {
    if (statuses.every(s => s === 'OPERATIONAL')) return 'HEALTHY';
    if (statuses.some(s => s === 'CRITICAL_FAILURE')) return 'FAILING';
    return 'DEGRADED';
  }

  /**
   * @method persistReportSeed
   * @private
   * @description Vuelca el reporte en una ubicación que la IA utilizará como "Base de Conocimientos" de infraestructura.
   */
  private static persistReportSeed(report: IConnectivityReport): void {
    const fileName = `${new Date().toISOString().replace(/[:.]/g, '-')}-connectivity-audit.json`;
    const fullPath = path.join(process.cwd(), this.REPORT_PATH, fileName);

    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, JSON.stringify(report, null, 2), 'utf-8');

    console.log(`[SEED-GENERATED]: ${fileName} (Ready for IA ingestion)`);
  }
}
