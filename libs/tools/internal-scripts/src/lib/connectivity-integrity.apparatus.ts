/** libs/tools/internal-scripts/src/lib/connectivity-integrity.apparatus.ts */

import * as fileSystem from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
/** 
 * @section Sincronización de Persistencia
 * RESOLUCIÓN TS2307: Se actualiza al alias nominal soberano.
 */
import { OmnisyncDatabase } from '@omnisync/core-persistence';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncContracts } from '@omnisync/core-contracts';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';

import {
  ConnectivityReportSchema,
  IConnectivityReport,
  IConnectivityNodeHealth,
} from './schemas/connectivity-integrity.schema';

/**
 * @name ConnectivityIntegrity
 * @description Aparato de auditoría profunda de infraestructura Cloud.
 * Realiza sondas de integridad (Handshakes) sobre los pilares de la red neural
 * para medir latencia, disponibilidad y consistencia de secretos.
 *
 * @protocol OEDP-Level: Elite (Cloud-Health-Audit V3.0)
 */
export class ConnectivityIntegrity {
  /**
   * @private
   * Ubicación institucional para la persistencia de semillas de salud.
   */
  private static readonly REPORT_BASE_PATH = path.resolve(
    process.cwd(),
    'reports/infrastructure/connectivity'
  );

  /**
   * @method executeSovereignAudit
   * @description Orquesta una inspección síncrona de 360° sobre la nube.
   * Genera un reporte inmutable consumible por el Dashboard de Administración.
   */
  public static async executeSovereignAudit(): Promise<IConnectivityReport> {
    const apparatusName = 'ConnectivityIntegrity';
    const operationName = 'executeSovereignAudit';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        const auditStartTime = performance.now();

        /**
         * @section Ejecución de Sondas Paralelas
         * Validamos los tres estados de materia de datos: Relacional, Volátil y Vectorial.
         */
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

        // Persistencia física del hallazgo para auditoría forense
        this.persistSovereignReportSeed(auditPayload);

        /**
         * @section Sello de Integridad (SSOT)
         */
        return OmnisyncContracts.validate(
          ConnectivityReportSchema, 
          auditPayload, 
          apparatusName
        );
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
      /**
       * Handshake físico con la persistencia relacional.
       * Si falla, el orquestador no podrá resolver identidades de Tenants.
       */
      await OmnisyncDatabase.databaseEngine.$queryRaw`SELECT 1`;

      return {
        status: 'OPERATIONAL',
        latencyInMilliseconds: Number((performance.now() - probeStartTime).toFixed(2)),
        provider: 'Supabase Cloud (PostgreSQL)',
        remediationHint: 'Handshake successful.',
      };
    } catch (criticalError: unknown) {
      return {
        status: 'CRITICAL_FAILURE',
        provider: 'Supabase Cloud',
        error: String(criticalError),
        remediationHint: 'Verify DATABASE_URL environment variable and IP White-listing.',
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

      if (!cloudRestUrl || !cloudRestToken) throw new Error('Missing Cloud Memory Credentials');

      const response = await fetch(`${cloudRestUrl}/ping`, {
        headers: { Authorization: `Bearer ${cloudRestToken}` },
      });

      return {
        status: response.ok ? 'OPERATIONAL' : 'DEGRADED',
        latencyInMilliseconds: Number((performance.now() - probeStartTime).toFixed(2)),
        provider: 'Upstash Redis (REST)',
        remediationHint: response.ok ? 'Stable Connection' : 'Check REST API Quotas',
      };
    } catch (error: unknown) {
      return {
        status: 'CRITICAL_FAILURE',
        provider: 'Upstash Memory',
        error: String(error),
        remediationHint: 'Verify UPSTASH_REDIS_REST environment variables.',
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
      if (!vectorUrl) throw new Error('Qdrant Endpoint not defined');

      const response = await fetch(`${vectorUrl}/healthz`);

      return {
        status: response.ok ? 'OPERATIONAL' : 'FAILING',
        latencyInMilliseconds: Number((performance.now() - probeStartTime).toFixed(2)),
        provider: 'Qdrant Cloud (Rust)',
        remediationHint: response.ok ? 'Healthy Cluster' : 'Verify API Key and Cluster Status.',
      };
    } catch (error: unknown) {
      return {
        status: 'CRITICAL_FAILURE',
        provider: 'Qdrant Cloud',
        error: String(error),
        remediationHint: 'Ensure QDRANT_URL is accessible from this node.',
      };
    }
  }

  private static calculateConsolidatedHealth(
    nodeStatuses: string[],
  ): IConnectivityReport['overallStatus'] {
    if (nodeStatuses.every((current) => current === 'OPERATIONAL')) return 'HEALTHY';
    if (nodeStatuses.some((current) => current === 'CRITICAL_FAILURE')) return 'FAILING';
    return 'DEGRADED';
  }

  /**
   * @method persistSovereignReportSeed
   * @private
   */
  private static persistSovereignReportSeed(report: IConnectivityReport): void {
    try {
      if (!fileSystem.existsSync(this.REPORT_BASE_PATH)) {
        fileSystem.mkdirSync(this.REPORT_BASE_PATH, { recursive: true });
      }

      const reportFileName = `${new Date().toISOString().replace(/[:.]/g, '-')}-connectivity-audit.json`;
      const absolutePath = path.join(this.REPORT_BASE_PATH, reportFileName);

      fileSystem.writeFileSync(absolutePath, JSON.stringify(report, null, 2), 'utf-8');
    } catch (persistenceError: unknown) {
      /**
       * @section Gestión de Anomalía en Script
       * Reportamos al Sentinel que la herramienta de auditoría no puede persistir sus propios resultados.
       */
      OmnisyncSentinel.report({
        errorCode: 'OS-CORE-001',
        severity: 'LOW',
        apparatus: 'ConnectivityIntegrity',
        operation: 'persist_report',
        message: 'Incapacidad de escribir semilla de conectividad en disco.',
        context: { error: String(persistenceError) }
      });
    }
  }
}