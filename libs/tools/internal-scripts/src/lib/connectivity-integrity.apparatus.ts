/** libs/tools/internal-scripts/src/lib/connectivity-integrity.apparatus.ts */

import * as fileSystem from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { OmnisyncDatabase } from '@omnisync-ecosystem/persistence';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import {
  ConnectivityReportSchema,
  IConnectivityReport,
  IConnectivityNodeHealth,
} from './schemas/connectivity-integrity.schema';

/**
 * @name ConnectivityIntegrity
 * @description Aparato de auditoría profunda de infraestructura Cloud.
 * Realiza sondas de integridad sobre los pilares de la red neural (SQL, Redis, Vector DB)
 * para generar semillas de conocimiento arquitectónico.
 *
 * @protocol OEDP-Level: Elite (Ultra-Holistic Monitoring)
 */
export class ConnectivityIntegrity {
  /**
   * @private
   * @description Ruta de persistencia para reportes de salud consumibles por IA.
   */
  private static readonly REPORT_BASE_PATH =
    'reports/infrastructure/connectivity';

  /**
   * @method executeSovereignAudit
   * @description Orquesta una inspección síncrona de 360° sobre la nube Omnisync.
   *
   * @returns {Promise<IConnectivityReport>} Reporte validado por contrato SSOT.
   */
  public static async executeSovereignAudit(): Promise<IConnectivityReport> {
    const apparatusName = 'ConnectivityIntegrity';
    const operationName = 'executeSovereignAudit';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        const auditStartTime = performance.now();

        // Ejecución concurrente de sondas de integridad
        const [databaseStatus, memoryStatus, vectorStatus] = await Promise.all([
          this.probeSupabaseCloud(),
          this.probeUpstashRedis(),
          this.probeQdrantCloud(),
        ]);

        const auditPayload: IConnectivityReport = {
          reportId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          environment: process.env['NODE_ENV'] || 'development',
          overallStatus: this.calculateConsolidatedHealth([
            databaseStatus.status,
            memoryStatus.status,
            vectorStatus.status,
          ]),
          nodes: {
            relational_persistence: databaseStatus,
            volatile_memory: memoryStatus,
            semantic_vector_engine: vectorStatus,
          },
          aiContext: {
            summary: `Audit finished in ${(performance.now() - auditStartTime).toFixed(2)}ms.`,
            isActionRequired: [
              databaseStatus.status,
              memoryStatus.status,
              vectorStatus.status,
            ].includes('CRITICAL_FAILURE'),
          },
        };

        // Vuelco inmutable de la semilla de conocimiento
        this.persistSovereignReportSeed(auditPayload);

        return ConnectivityReportSchema.parse(auditPayload);
      },
    );
  }

  /**
   * @method probeSupabaseCloud
   * @private
   */
  private static async probeSupabaseCloud(): Promise<IConnectivityNodeHealth> {
    const probeStartTime = performance.now();
    try {
      // Sonda de bajo nivel contra PostgreSQL
      await OmnisyncDatabase.databaseEngine.$queryRaw`SELECT 1`;

      return {
        status: 'OPERATIONAL',
        latencyInMilliseconds: performance.now() - probeStartTime,
        provider: 'Supabase Cloud (PostgreSQL 15+)',
        remediationHint: 'Handshake successful.',
      };
    } catch (criticalError: unknown) {
      return {
        status: 'CRITICAL_FAILURE',
        provider: 'Supabase Cloud',
        error: String(criticalError),
        remediationHint:
          'Verify DATABASE_URL and Supabase project state. Possible IP Geofencing block.',
      };
    }
  }

  /**
   * @method probeUpstashRedis
   * @private
   */
  private static async probeUpstashRedis(): Promise<IConnectivityNodeHealth> {
    const probeStartTime = performance.now();
    try {
      const cloudRestUrl = process.env['UPSTASH_REDIS_REST_URL'];
      const cloudRestToken = process.env['UPSTASH_REDIS_REST_TOKEN'];

      if (!cloudRestUrl || !cloudRestToken)
        throw new Error('OS-SEC-004: Missing Cloud Memory Credentials.');

      const networkResponse = await fetch(`${cloudRestUrl}/ping`, {
        headers: { Authorization: `Bearer ${cloudRestToken}` },
      });

      return {
        status: networkResponse.ok ? 'OPERATIONAL' : 'DEGRADED',
        latencyInMilliseconds: performance.now() - probeStartTime,
        provider: 'Upstash Redis (REST Interface)',
        remediationHint: networkResponse.ok
          ? 'Heartbeat active.'
          : 'Check Upstash quota or token expiration.',
      };
    } catch (criticalError: unknown) {
      return {
        status: 'CRITICAL_FAILURE',
        provider: 'Upstash Memory',
        error: String(criticalError),
        remediationHint:
          'Verify UPSTASH environment variables and network egress.',
      };
    }
  }

  /**
   * @method probeQdrantCloud
   * @private
   */
  private static async probeQdrantCloud(): Promise<IConnectivityNodeHealth> {
    const probeStartTime = performance.now();
    try {
      const vectorUrl = process.env['QDRANT_URL'];
      if (!vectorUrl)
        throw new Error('OS-SEC-004: Qdrant URL is not configured.');

      const networkResponse = await fetch(`${vectorUrl}/healthz`);

      return {
        status: networkResponse.ok ? 'OPERATIONAL' : 'FAILING',
        latencyInMilliseconds: performance.now() - probeStartTime,
        provider: 'Qdrant Cloud (Rust Vector Engine)',
        remediationHint: networkResponse.ok
          ? 'Cluster healthy.'
          : 'Check Qdrant dashboard for maintenance alerts.',
      };
    } catch (criticalError: unknown) {
      return {
        status: 'CRITICAL_FAILURE',
        provider: 'Qdrant Cloud',
        error: String(criticalError),
        remediationHint:
          'If using Free Tier, cluster might be in hibernation mode.',
      };
    }
  }

  /**
   * @method calculateConsolidatedHealth
   * @private
   */
  private static calculateConsolidatedHealth(
    nodeStatuses: string[],
  ): IConnectivityReport['overallStatus'] {
    if (nodeStatuses.every((current) => current === 'OPERATIONAL'))
      return 'HEALTHY';
    if (nodeStatuses.some((current) => current === 'CRITICAL_FAILURE'))
      return 'FAILING';
    return 'DEGRADED';
  }

  /**
   * @method persistSovereignReportSeed
   * @private
   */
  private static persistSovereignReportSeed(report: IConnectivityReport): void {
    const reportFileName = `${new Date().toISOString().replace(/[:.]/g, '-')}-connectivity-audit.json`;
    const absolutePath = path.join(
      process.cwd(),
      this.REPORT_BASE_PATH,
      reportFileName,
    );

    try {
      fileSystem.mkdirSync(path.dirname(absolutePath), { recursive: true });
      fileSystem.writeFileSync(
        absolutePath,
        JSON.stringify(report, null, 2),
        'utf-8',
      );

      OmnisyncTelemetry.verbose(
        'ConnectivityIntegrity',
        'persist_seed',
        `Semilla de salud generada: ${reportFileName}`,
      );
    } catch (criticalFileSystemError: unknown) {
      console.error(
        '[CRITICAL-IO-FAILURE]: No se pudo persistir el reporte de conectividad.',
        criticalFileSystemError,
      );
    }
  }
}
