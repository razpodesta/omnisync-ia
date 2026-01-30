/** libs/integrations/health-engine/src/lib/health-engine.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncContracts } from '@omnisync/core-contracts';
import { OmnisyncDatabase } from '@omnisync/core-persistence';
import { 
  GlobalHealthReportSchema, 
  IGlobalHealthReport, 
  IInfrastructureHeartbeat,
  NodeHealthStatusSchema
} from './schemas/health-engine.schema';
import { z } from 'zod';

/**
 * @type NodeHealthStatus
 * @description Inferencia local del estado de salud para erradicar el uso de 'any'.
 */
type NodeHealthStatus = z.infer<typeof NodeHealthStatusSchema>;

/**
 * @name OmnisyncHealthEngine
 * @description Nodo maestro de observabilidad holística. Orquesta la ejecución de 
 * sondas de red concurrentes para validar la disponibilidad del ecosistema Cloud.
 * Implementa el protocolo de resiliencia "Heartbeat Pulse".
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Health-Orchestration V3.2)
 * @vision Ultra-Holística: Real-time-Infrastructure-Triage
 */
export class OmnisyncHealthEngine {
  /**
   * @method generateGlobalHealthReport
   * @description Genera un diagnóstico integral 360°. Coordina la captura de ADN 
   * operativo de todas las capas de persistencia y memoria.
   * 
   * @returns {Promise<IGlobalHealthReport>} Reporte validado por contrato SSOT.
   */
  public static async generateGlobalHealthReport(): Promise<IGlobalHealthReport> {
    const apparatusName = 'OmnisyncHealthEngine';
    const operationName = 'generateGlobalHealthReport';

    return await OmnisyncTelemetry.traceExecution(apparatusName, operationName, async () => {
      /**
       * @section Ejecución de Sondas Concurrentes
       * Maximizamos la performance lanzando los handshakes en paralelo.
       */
      const [sqlPulse, redisPulse, vectorPulse] = await Promise.all([
        InfrastructureProbeApparatus.probeRelationalPersistence(),
        InfrastructureProbeApparatus.probeVolatileMemory(),
        InfrastructureProbeApparatus.probeVectorDatabase(),
      ]);

      const reportPayload: IGlobalHealthReport = {
        reportId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        overallStatus: this.consolidateOverallHealth([sqlPulse, redisPulse, vectorPulse]),
        components: {
          relational_sql: sqlPulse,
          volatile_redis: redisPulse,
          vector_qdrant: vectorPulse,
        },
        environment: process.env['NODE_ENV'] || 'development',
      };

      /**
       * @note Sello de Integridad SSOT
       */
      return OmnisyncContracts.validate(
        GlobalHealthReportSchema, 
        reportPayload, 
        apparatusName
      );
    });
  }

  /**
   * @method consolidateOverallHealth
   * @private
   * @description Algoritmo de triaje para determinar el estado general del Framework.
   */
  private static consolidateOverallHealth(nodes: IInfrastructureHeartbeat[]): NodeHealthStatus {
    if (nodes.some(n => n.status === 'UNREACHABLE')) return 'UNREACHABLE';
    if (nodes.some(n => n.status === 'DEGRADED')) return 'DEGRADED';
    return 'HEALTHY';
  }
}

/**
 * @name InfrastructureProbeApparatus
 * @description Aparato subordinado especializado en la ejecución física de sondas.
 * Encapsula la complejidad de cada protocolo de red (SQL, REST, Cloud SDK).
 */
class InfrastructureProbeApparatus {
  /**
   * @method probeRelationalPersistence
   * @description Valida el handshake con Supabase Cloud.
   */
  public static async probeRelationalPersistence(): Promise<IInfrastructureHeartbeat> {
    const start = performance.now();
    try {
      // Handshake físico mediante consulta de baja carga
      await OmnisyncDatabase.databaseEngine.$queryRaw`SELECT 1`;
      return this.createHeartbeat('Supabase/PostgreSQL', 'HEALTHY', performance.now() - start);
    } catch (error: unknown) {
      await OmnisyncSentinel.report({
        errorCode: 'OS-CORE-503',
        severity: 'HIGH',
        apparatus: 'HealthEngine:SQL',
        operation: 'probe',
        message: 'sql_persistence_unreachable',
        context: { error: String(error) }
      });
      return this.createHeartbeat('Supabase/PostgreSQL', 'UNREACHABLE', 0, String(error));
    }
  }

  /**
   * @method probeVolatileMemory
   * @description Valida la conexión REST con Upstash Redis.
   */
  public static async probeVolatileMemory(): Promise<IInfrastructureHeartbeat> {
    const start = performance.now();
    try {
      const url = process.env['UPSTASH_REDIS_REST_URL'];
      const token = process.env['UPSTASH_REDIS_REST_TOKEN'];

      if (!url || !token) throw new Error('Missing Upstash Credentials');

      const response = await fetch(`${url}/ping`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      const status: NodeHealthStatus = response.ok ? 'HEALTHY' : 'DEGRADED';
      return this.createHeartbeat('Upstash/Redis', status, performance.now() - start);
    } catch (error: unknown) {
      return this.createHeartbeat('Upstash/Redis', 'UNREACHABLE', 0, String(error));
    }
  }

  /**
   * @method probeVectorDatabase
   * @description Valida la disponibilidad del cluster Qdrant Cloud.
   */
  public static async probeVectorDatabase(): Promise<IInfrastructureHeartbeat> {
    const start = performance.now();
    try {
      const url = process.env['QDRANT_URL'];
      if (!url) throw new Error('Missing Qdrant URL');

      const response = await fetch(`${url}/healthz`);
      const status: NodeHealthStatus = response.ok ? 'HEALTHY' : 'DEGRADED';
      
      return this.createHeartbeat('Qdrant/Cloud', status, performance.now() - start);
    } catch (error: unknown) {
      return this.createHeartbeat('Qdrant/Cloud', 'UNREACHABLE', 0, String(error));
    }
  }

  /**
   * @method createHeartbeat
   * @private
   * @description Constructor de objetos de latitud y estado.
   */
  private static createHeartbeat(
    node: string, 
    status: NodeHealthStatus, 
    latency: number, 
    error?: string
  ): IInfrastructureHeartbeat {
    return {
      nodeName: node,
      status,
      latencyMs: Number(latency.toFixed(2)),
      lastCheck: new Date().toISOString(),
      errorMessage: error,
    };
  }
}