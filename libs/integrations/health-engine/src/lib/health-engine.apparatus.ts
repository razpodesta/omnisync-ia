/** libs/integrations/health-engine/src/lib/health-engine.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncContracts } from '@omnisync/core-contracts';
import { OmnisyncDatabase } from '@omnisync/core-persistence';
import { OmnisyncAgentFactory } from '@omnisync/agent-factory';
import { ArtificialIntelligenceDriverFactory } from '@omnisync/ai-engine';

import { 
  GlobalHealthReportSchema, 
  IGlobalHealthReport, 
  IInfrastructureHeartbeat,
  IInfrastructureNodeHealthStatus,
  IInfrastructurePillar
} from './schemas/health-engine.schema';

/**
 * @name OmnisyncHealthEngine
 * @description Nodo maestro de observabilidad holística (Omni-Pulse). 
 * Orquesta la ejecución de sondas de red concurrentes para validar la disponibilidad 
 * del ecosistema neural 360°. Implementa el triaje de salud basado en los 5 pilares 
 * fundamentales del Framework.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Full-Stack-Health-Orchestration V4.0)
 * @vision Ultra-Holística: Real-time-Infrastructure-Triage & Sovereign-Audit-Trail
 */
export class OmnisyncHealthEngine {
  /**
   * @method generateGlobalHealthReport
   * @description Genera un diagnóstico integral de la infraestructura. 
   * Coordina la captura de ADN operativo mediante ejecución paralela resiliente.
   * 
   * @returns {Promise<IGlobalHealthReport>} Reporte validado por contrato SSOT V4.0.
   */
  public static async generateGlobalHealthReport(): Promise<IGlobalHealthReport> {
    const apparatusName = 'OmnisyncHealthEngine';
    const operationName = 'generateGlobalHealthReport';
    const traceIdentifier = crypto.randomUUID();

    return await OmnisyncTelemetry.traceExecution(apparatusName, operationName, async () => {
      /**
       * @section Ejecución de Sondas de 5 Dimensiones
       * Utilizamos 'allSettled' para asegurar que el colapso de un pilar (ej. AI Offline)
       * no impida conocer el estado de la persistencia o la memoria.
       */
      const probeOutcomes = await Promise.allSettled([
        InfrastructureProbeApparatus.probeRelationalPersistence(),
        InfrastructureProbeApparatus.probeVolatileMemory(),
        InfrastructureProbeApparatus.probeVectorMemory(),
        InfrastructureProbeApparatus.probeCognitiveEngine(),
        InfrastructureProbeApparatus.probeGovernanceSwarm(),
      ]);

      // Extracción y normalización de resultados de las sondas
      const infrastructureComponents: Record<string, IInfrastructureHeartbeat> = {};
      const componentPulses: IInfrastructureHeartbeat[] = [];

      probeOutcomes.forEach((outcome) => {
        if (outcome.status === 'fulfilled') {
          const heartbeat = outcome.value;
          const componentKey = heartbeat.pillar.toLowerCase();
          infrastructureComponents[componentKey] = heartbeat;
          componentPulses.push(heartbeat);
        }
      });

      const reportPayload: IGlobalHealthReport = {
        reportIdentifier: crypto.randomUUID(),
        traceIdentifier: traceIdentifier,
        timestamp: new Date().toISOString(),
        overallHealthStatus: this.consolidateOverallHealth(componentPulses),
        infrastructureComponents: infrastructureComponents,
        executionEnvironment: process.env['NODE_ENV'] || 'development',
        engineVersion: 'OEDP-V4.0-HEALTH-PULSE',
      };

      /**
       * @note Sello de Integridad Final (Aduana de Salida)
       */
      return OmnisyncContracts.validate(
        GlobalHealthReportSchema, 
        reportPayload, 
        apparatusName
      );
    }, { traceIdentifier });
  }

  /**
   * @method consolidateOverallHealth
   * @private
   * @description Algoritmo de triaje para determinar el estado general del ecosistema.
   */
  private static consolidateOverallHealth(nodes: IInfrastructureHeartbeat[]): IInfrastructureNodeHealthStatus {
    if (nodes.length === 0) return 'UNREACHABLE';
    
    const statuses = nodes.map(n => n.operationalStatus);
    
    if (statuses.includes('UNREACHABLE')) return 'UNREACHABLE';
    if (statuses.includes('DEGRADED')) return 'DEGRADED';
    if (statuses.includes('THROTTLED')) return 'THROTTLED';
    
    return 'HEALTHY';
  }
}

/**
 * @name InfrastructureProbeApparatus
 * @description Aparato subordinado especializado en la ejecución física de sondas.
 * Encapsula la complejidad de protocolos Cloud y reporta anomalías al Sentinel.
 */
class InfrastructureProbeApparatus {
  /**
   * @method probeRelationalPersistence
   * @description Valida el handshake físico con Supabase/PostgreSQL (Pilar 1).
   */
  public static async probeRelationalPersistence(): Promise<IInfrastructureHeartbeat> {
    const startTime = performance.now();
    const pillar: IInfrastructurePillar = 'RELATIONAL_PERSISTENCE';
    
    try {
      await OmnisyncDatabase.databaseEngine.$queryRaw`SELECT 1`;
      return this.createHeartbeat('Supabase/PostgreSQL', pillar, 'HEALTHY', performance.now() - startTime);
    } catch (error: unknown) {
      await this.reportProbeAnomaly(pillar, error);
      return this.createHeartbeat('Supabase/PostgreSQL', pillar, 'UNREACHABLE', 0, 'sql_persistence_offline');
    }
  }

  /**
   * @method probeVolatileMemory
   * @description Valida la conexión REST con Upstash Redis (Pilar 2).
   */
  public static async probeVolatileMemory(): Promise<IInfrastructureHeartbeat> {
    const startTime = performance.now();
    const pillar: IInfrastructurePillar = 'VOLATILE_MEMORY';
    
    try {
      const url = process.env['UPSTASH_REDIS_REST_URL'];
      const token = process.env['UPSTASH_REDIS_REST_TOKEN'];
      
      if (!url || !token) throw new Error('CREDENTIALS_MISSING');

      const response = await fetch(`${url}/ping`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      if (response.status === 429) {
        return this.createHeartbeat('Upstash/Redis', pillar, 'THROTTLED', performance.now() - startTime);
      }

      if (!response.ok) throw new Error('COMMUNICATION_BREAK');

      return this.createHeartbeat('Upstash/Redis', pillar, 'HEALTHY', performance.now() - startTime);
    } catch (error: unknown) {
      await this.reportProbeAnomaly(pillar, error);
      return this.createHeartbeat('Upstash/Redis', pillar, 'UNREACHABLE', 0, 'memory_cluster_unreachable');
    }
  }

  /**
   * @method probeVectorMemory
   * @description Valida la disponibilidad del cluster Qdrant Cloud (Pilar 3).
   */
  public static async probeVectorMemory(): Promise<IInfrastructureHeartbeat> {
    const startTime = performance.now();
    const pillar: IInfrastructurePillar = 'VECTOR_MEMORY';
    
    try {
      const url = process.env['QDRANT_URL'];
      if (!url) throw new Error('ENDPOINT_UNDEFINED');
      
      const response = await fetch(`${url}/healthz`);
      
      return this.createHeartbeat(
        'Qdrant/Cloud', 
        pillar, 
        response.ok ? 'HEALTHY' : 'DEGRADED', 
        performance.now() - startTime
      );
    } catch (error: unknown) {
      await this.reportProbeAnomaly(pillar, error);
      return this.createHeartbeat('Qdrant/Cloud', pillar, 'UNREACHABLE', 0, 'vector_engine_offline');
    }
  }

  /**
   * @method probeCognitiveEngine
   * @description Sonda de integridad para validar el canal con Google Gemini (Pilar 4).
   */
  public static async probeCognitiveEngine(): Promise<IInfrastructureHeartbeat> {
    const startTime = performance.now();
    const pillar: IInfrastructurePillar = 'COGNITIVE_ENGINE';
    
    try {
      const driver = ArtificialIntelligenceDriverFactory.getSovereignDriver('GOOGLE_GEMINI', 'FLASH');
      const tokenCheck = driver.calculateTokens('Infrastructure Pulse');
      
      if (tokenCheck <= 0) throw new Error('DRIVER_RESPONSED_INVALID_DNA');
      
      return this.createHeartbeat('Google/Gemini', pillar, 'HEALTHY', performance.now() - startTime);
    } catch (error: unknown) {
      await this.reportProbeAnomaly(pillar, error);
      return this.createHeartbeat('Google/Gemini', pillar, 'DEGRADED', 0, 'inference_engine_unstable');
    }
  }

  /**
   * @method probeGovernanceSwarm
   * @description Valida la integridad del registro del enjambre de agentes (Pilar 5).
   */
  public static async probeGovernanceSwarm(): Promise<IInfrastructureHeartbeat> {
    const startTime = performance.now();
    const pillar: IInfrastructurePillar = 'GOVERNANCE_SWARM';
    
    try {
      // Intentamos recuperar la personalidad de un agente núcleo
      const persona = OmnisyncAgentFactory.getAgentPersona('a1b2c3d4-0001-4000-a000-000000000001');
      if (!persona) throw new Error('AGENT_REGISTRY_BREACH');

      return this.createHeartbeat('Swarm/Factory', pillar, 'HEALTHY', performance.now() - startTime);
    } catch (error: unknown) {
      await this.reportProbeAnomaly(pillar, error);
      return this.createHeartbeat('Swarm/Factory', pillar, 'DEGRADED', 0, 'swarm_registry_corrupt');
    }
  }

  /**
   * @method reportProbeAnomaly
   * @private
   */
  private static async reportProbeAnomaly(pillar: IInfrastructurePillar, error: unknown): Promise<void> {
    await OmnisyncSentinel.report({
      errorCode: 'OS-CORE-503',
      severity: 'HIGH',
      apparatus: 'InfrastructureProbeApparatus',
      operation: `probe_${pillar}`,
      message: `Anomalía detectada en el pulso del pilar: ${pillar}`,
      context: { errorTrace: String(error) },
      isRecoverable: true
    });
  }

  /**
   * @method createHeartbeat
   * @private
   */
  private static createHeartbeat(
    name: string, 
    pillar: IInfrastructurePillar,
    status: IInfrastructureNodeHealthStatus, 
    duration: number, 
    errorKey?: string
  ): IInfrastructureHeartbeat {
    return {
      nodeName: name,
      pillar: pillar,
      operationalStatus: status,
      responseTimeInMilliseconds: Number(duration.toFixed(2)),
      lastCheckTimestamp: new Date().toISOString(),
      forensicErrorMessage: errorKey,
      remediationPath: status === 'HEALTHY' ? undefined : `Verify_${pillar}_Endpoint_And_Secrets`
    };
  }
}