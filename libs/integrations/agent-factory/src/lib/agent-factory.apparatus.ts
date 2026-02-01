/** libs/integrations/agent-factory/src/lib/agent-factory.apparatus.ts */

import * as crypto from 'node:crypto';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { 
  OmnisyncContracts, 
  INeuralIntent, 
  IArtificialIntelligenceDriver,
  TenantId
} from '@omnisync/core-contracts';
import { TokenPricingApparatus } from '@omnisync/core-auditor';

/** @section Sincronización de ADN Local */
import { 
  NeuralAgentDefinitionSchema, 
  INeuralAgentDefinition, 
  SwarmResolutionSchema, 
  ISwarmResolution 
} from './schemas/agent-factory.schema';

/**
 * @name OmnisyncAgentFactory
 * @description Nodo maestro de Inteligencia de Enjambre (Fase 5.5).
 * Orquesta la selección de identidades mediante un algoritmo de Aptitud Adaptativa.
 * Implementa la visión "Ojos de Mosca": monitoriza integridad del registro, 
 * sentimiento biyectivo y ROI predictivo de tokens (Input + Forecast Output).
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Adaptive-Swarm-Intelligence V5.5.2)
 */
export class OmnisyncAgentFactory {
  private static readonly apparatusName = 'OmnisyncAgentFactory';

  /** @private Sello SHA-256 inmutable generado al arranque del nodo */
  private static REGISTRY_INTEGRITY_STAMP: string = '';

  private static readonly SOVEREIGN_AGENT_REGISTRY: readonly INeuralAgentDefinition[] = [
    {
      agentId: 'a1b2c3d4-0001-4000-a000-000000000001',
      agentName: 'Soporte Técnico Élite',
      specialty: 'TECHNICAL_SUPPORT',
      isEnabled: true,
      dispatchGovernance: { sentimentThreshold: 0.2, costWeight: 0.1, priorityLevel: 5 },
      modelConfiguration: { modelName: 'gemini-1.5-pro', temperature: 0.2, maxTokens: 2048 },
      systemPersona: 'Usted es el Agente Técnico Senior. Utilice lógica RAG inexpugnable. Responda con rigor técnico.'
    },
    {
      agentId: 'a1b2c3d4-0002-4000-a000-000000000002',
      agentName: 'Conciliador de Crisis',
      specialty: 'EMPATHY_CORE',
      isEnabled: true,
      dispatchGovernance: { sentimentThreshold: -0.5, costWeight: 0.05, priorityLevel: 5 },
      modelConfiguration: { modelName: 'gemini-1.5-pro', temperature: 0.8, maxTokens: 1024 },
      systemPersona: 'Usted es el Especialista en Crisis. Su prioridad es la calma, la contención emocional y la resolución humana.'
    },
    {
      agentId: 'a1b2c3d4-0003-4000-a000-000000000003',
      agentName: 'Asistente Flash',
      specialty: 'TECHNICAL_SUPPORT',
      isEnabled: true,
      dispatchGovernance: { sentimentThreshold: 0.8, costWeight: 0.6, priorityLevel: 1 },
      modelConfiguration: { modelName: 'gemini-1.5-flash', temperature: 0.7, maxTokens: 512 },
      systemPersona: 'Usted es el Asistente Rápido. Sea breve, eficiente y priorice el ahorro de tokens.'
    }
  ];

  /**
   * @method resolveOptimalAgentNeural
   * @description Ejecuta el triaje Darwiniano con validación de integridad SHA-256.
   */
  public static async resolveOptimalAgentNeural(
    incomingIntent: INeuralIntent,
    classifierDriver: IArtificialIntelligenceDriver
  ): Promise<ISwarmResolution> {
    const operationName = 'resolveOptimalAgentNeural';

    return await OmnisyncTelemetry.traceExecution(this.apparatusName, operationName, async () => {
      
      // 1. AUDITORÍA DE INTEGRIDAD DEL REGISTRO (OEDP V5.5)
      this.ensureRegistryIntegrity();

      const rawSentiment = (incomingIntent.payload.metadata['urgencyScore'] as number) || 50;
      const normalizedSentiment = (rawSentiment - 50) / 50;

      try {
        // 2. TRIAJE SEMÁNTICO (Clasificación por IA)
        const semanticCategory = await this.performSemanticTriage(incomingIntent, classifierDriver);

        /**
         * @section Selección por Aptitud Darwiniana
         * Ponderamos: Especialidad (40%) + Emoción (40%) + ROI/Costo (20%)
         */
        const fitnessResults = this.SOVEREIGN_AGENT_REGISTRY
          .filter(agent => agent.isEnabled)
          .map(agent => ({
            agent,
            fitness: this.calculateAgentFitness(agent, semanticCategory, normalizedSentiment)
          }))
          .sort((a, b) => b.fitness - a.fitness);

        const winner = fitnessResults[0];

        // 3. CÁLCULO DE ROI PREDICTIVO (Ojos de Mosca)
        // Calculamos costo de Input + Estimación de Output basada en el maxTokens del agente.
        const inputTokens = classifierDriver.calculateTokens(winner.agent.systemPersona + incomingIntent.payload.content);
        const forecastOutputTokens = winner.agent.modelConfiguration.maxTokens * 0.4; // Heurística de consumo típico

        const projectedCost = TokenPricingApparatus.calculateCost(
          winner.agent.modelConfiguration.modelName, 
          inputTokens, 
          forecastOutputTokens
        );

        const swarmResult: ISwarmResolution = {
          resolvedAgentId: winner.agent.agentId,
          fitnessScore: winner.fitness,
          integrityHash: this.REGISTRY_INTEGRITY_STAMP,
          resolutionReason: `agent.factory.status.agent_selected`,
          dispatchMetadata: {
            estimatedFullTransactionCost: projectedCost,
            sentimentAdjustmentApplied: Math.abs(normalizedSentiment) > 0.3,
            isGenesisFallback: false,
            resolutionFingerprint: this.calculateResolutionSeal(incomingIntent.id, winner.agent.agentId)
          }
        };

        OmnisyncTelemetry.verbose(this.apparatusName, 'darwin_selection', 
          `Agente: ${winner.agent.agentName} | ROI Predictivo: $${projectedCost}`,
          { fitness: winner.fitness.toFixed(4) }
        );

        return OmnisyncContracts.validate(SwarmResolutionSchema, swarmResult, this.apparatusName);

      } catch (criticalSwarmError: unknown) {
        return await this.handleSwarmColapse(incomingIntent, criticalSwarmError);
      }
    }, { intentId: incomingIntent.id });
  }

  /**
   * @method calculateAgentFitness
   * @private
   */
  private static calculateAgentFitness(
    agent: INeuralAgentDefinition, 
    targetSpecialty: string, 
    userSentiment: number
  ): number {
    const specialtyMatch = agent.specialty === targetSpecialty ? 1 : 0.2;
    
    const isCrisis = userSentiment < -0.6;
    let emotionalFitness = 0.5;

    if (agent.specialty === 'EMPATHY_CORE' && userSentiment < agent.dispatchGovernance.sentimentThreshold) {
      emotionalFitness = 1;
    } else if (!isCrisis && agent.modelConfiguration.modelName.includes('flash')) {
      emotionalFitness = 0.9; 
    }

    const costEfficiency = isCrisis ? 1 : (1 - agent.dispatchGovernance.costWeight);

    return (specialtyMatch * 0.4) + (emotionalFitness * 0.4) + (costEfficiency * 0.2);
  }

  /**
   * @method ensureRegistryIntegrity
   * @private
   * @description Implementa SHA-256 para validación de origen inexpugnable.
   */
  private static ensureRegistryIntegrity(): void {
    const currentHash = crypto.createHash('sha256').update(JSON.stringify(this.SOVEREIGN_AGENT_REGISTRY)).digest('hex');
    
    if (!this.REGISTRY_INTEGRITY_STAMP) {
      this.REGISTRY_INTEGRITY_STAMP = currentHash;
      return;
    }

    if (this.REGISTRY_INTEGRITY_STAMP !== currentHash) {
      OmnisyncSentinel.report({
        errorCode: 'OS-SEC-500',
        severity: 'CRITICAL',
        apparatus: this.apparatusName,
        operation: 'registry_audit',
        message: 'agent.factory.errors.registry_corrupt',
        isRecoverable: false
      });
      throw new Error('OS-SEC-500: ADN del Enjambre alterado en Runtime.');
    }
  }

  private static calculateResolutionSeal(intentId: string, agentId: string): string {
    return crypto.createHash('sha256').update(`${intentId}:${agentId}:${this.REGISTRY_INTEGRITY_STAMP}`).digest('hex');
  }

  private static async performSemanticTriage(intent: INeuralIntent, driver: IArtificialIntelligenceDriver): Promise<string> {
    const prompt = `Classify intent specialty: "${intent.payload.content}". Options: TECHNICAL_SUPPORT, SALES_EXPERT, BILLING_ADMIN, EMPATHY_CORE. Output only the key.`;
    const response = await driver.generateResponse(prompt, { modelName: 'FLASH', temperature: 0, maxTokens: 20 });
    return response.trim().toUpperCase();
  }

  private static async handleSwarmColapse(intent: INeuralIntent, error: unknown): Promise<ISwarmResolution> {
    await OmnisyncSentinel.report({
      errorCode: 'OS-INTEG-604',
      severity: 'HIGH',
      apparatus: this.apparatusName,
      operation: 'swarm_failsafe',
      message: 'agent.factory.status.fallback_active',
      context: { errorTrace: String(error) }
    });

    return {
      resolvedAgentId: this.SOVEREIGN_AGENT_REGISTRY[2].agentId, 
      fitnessScore: 0.1,
      integrityHash: this.REGISTRY_INTEGRITY_STAMP,
      resolutionReason: 'EMERGENCY_GENESIS_FALLBACK',
      dispatchMetadata: { 
        estimatedFullTransactionCost: 0.001, 
        sentimentAdjustmentApplied: false, 
        isGenesisFallback: true,
        resolutionFingerprint: 'FAILSAFE_SEAL'
      }
    };
  }

  public static getAgentPersona(id: string): string {
    const agent = this.SOVEREIGN_AGENT_REGISTRY.find(a => a.agentId === id);
    return agent?.systemPersona ?? this.SOVEREIGN_AGENT_REGISTRY[2].systemPersona;
  }

  public static getAgentConfig(id: string): INeuralAgentDefinition['modelConfiguration'] {
    const agent = this.SOVEREIGN_AGENT_REGISTRY.find(a => a.agentId === id);
    return agent?.modelConfiguration ?? this.SOVEREIGN_AGENT_REGISTRY[2].modelConfiguration;
  }
}