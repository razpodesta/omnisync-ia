/** apps/orchestrator-api/src/app/apparatus/flow-orchestrator.apparatus.ts */

import * as crypto from 'node:crypto';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncMemory } from '@omnisync/core-persistence';
import {
  NeuralInferenceApparatus,
  NeuralEmbeddingApparatus,
  ArtificialIntelligenceDriverFactory,
} from '@omnisync/ai-engine';
import { OmnisyncVectorEngine } from '@omnisync/vector-engine';
import { QdrantDriver } from '@omnisync/vector-qdrant';
import { OmnisyncAgentFactory } from '@omnisync/agent-factory';

import { NeuralPromptApparatus } from './neural-prompt.apparatus';
import { ActionDispatcherApparatus } from './action-dispatcher.apparatus';
import { SovereigntyResolverApparatus } from './sovereignty-resolver.apparatus';

import {
  INeuralIntent,
  INeuralFlowResult,
  NeuralFlowResultSchema,
  ITenantConfiguration,
  IAIResponse as IArtificialIntelligenceResponse,
  OmnisyncContracts,
} from '@omnisync/core-contracts';

/**
 * @name NeuralFlowOrchestrator
 * @description Director de orquesta neural de alta fidelidad (Fase 5.5).
 * Orquesta el ciclo de vida 360° validando la integridad biyectiva del ADN, 
 * el triaje Darwiniano del enjambre y la fiscalización financiera del ROI.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Sovereign-Flow-Orchestration V5.5.2)
 */
export class NeuralFlowOrchestrator {
  private static readonly apparatusName = 'NeuralFlowOrchestrator';

  /**
   * @method processNeuralIntentMessage
   * @description Punto de entrada soberano. Implementa el Protocolo de Sello Biyectivo.
   */
  public static async processNeuralIntentMessage(
    incomingNeuralIntent: INeuralIntent,
  ): Promise<INeuralFlowResult> {
    const operationName = 'processNeuralIntentMessage';

    return await OmnisyncTelemetry.traceExecution(this.apparatusName, operationName, async () => {
      const executionStartTime = performance.now();

      try {
        // 1. FASE DE INTEGRIDAD: Verificación de Sello biyectivo V5.5
        this.verifyIntentChainOfCustody(incomingNeuralIntent);

        // 2. FASE DE SOBERANÍA: Resolución de ADN Técnico
        const tenantConfiguration = await SovereigntyResolverApparatus.resolveTenantSovereignty(
          incomingNeuralIntent.tenantId,
        );

        // 3. FASE DE HIDRATACIÓN: Memoria de Contexto (L2)
        const sessionKey = `os:session:${tenantConfiguration.id}:${incomingNeuralIntent.externalUserId}`;
        const history = await OmnisyncMemory.getHistory(sessionKey);

        // 4. FASE DE COGNICIÓN: Triaje de Enjambre e Inferencia Multimodal
        const aiResponse = await this.executeSovereignCognitiveCycle(
          incomingNeuralIntent,
          tenantConfiguration,
          history,
        );

        // 5. FASE DE ACCIÓN: Despacho ERP bajo Action Guard
        const erpAction = await ActionDispatcherApparatus.dispatchOperationalAction(
          incomingNeuralIntent,
          aiResponse,
          tenantConfiguration,
        );

        // 6. FASE DE SINCRONIZACIÓN: Persistencia de Simetría
        await this.persistNeuralSymmetry(sessionKey, incomingNeuralIntent, aiResponse);

        /** @section Consolidación SSOT Final */
        return OmnisyncContracts.validate(NeuralFlowResultSchema, {
          neuralIntentIdentifier: incomingNeuralIntent.id,
          tenantId: incomingNeuralIntent.tenantId,
          artificialIntelligenceResponse: aiResponse,
          enterpriseResourcePlanningAction: erpAction,
          finalMessage: aiResponse.suggestion,
          executionTimeInMilliseconds: performance.now() - executionStartTime,
        }, this.apparatusName);

      } catch (criticalError: unknown) {
        return await this.handleOrchestrationCollapse(incomingNeuralIntent, criticalError);
      }
    }, { tenantId: incomingNeuralIntent.tenantId });
  }

  /**
   * @method executeSovereignCognitiveCycle
   * @private
   * @description Orquesta el triaje Darwiniano y la recuperación RAG.
   */
  private static async executeSovereignCognitiveCycle(
    intent: INeuralIntent,
    config: ITenantConfiguration,
    history: unknown[],
  ): Promise<IArtificialIntelligenceResponse> {
    const aiDriver = ArtificialIntelligenceDriverFactory.getSovereignDriver(config.artificialIntelligence.provider);

    // 1. RAG: Recuperación semántica auditada
    const queryVector = await NeuralEmbeddingApparatus.generateVectorEmbeddings(aiDriver, intent.payload.content);
    const knowledge = await OmnisyncVectorEngine.retrieveRelevantKnowledgeContext(
      new QdrantDriver(),
      queryVector,
      config.id,
    );

    // 2. SWARM: Triaje Darwiniano (Ojos de Mosca - ROI Predictivo)
    const swarm = await OmnisyncAgentFactory.resolveOptimalAgentNeural(intent, aiDriver);
    
    OmnisyncTelemetry.verbose(this.apparatusName, 'swarm_selected', 
      `Agente: ${swarm.resolvedAgentId} | ROI Forecast: $${swarm.dispatchMetadata.estimatedFullTransactionCost}`
    );

    // 3. PROMPT: Ingeniería de Conciencia Situacional (Zero-Any)
    const environmentalMetadata = intent.payload.metadata.transport; // Acceso tipado V5.5
    
    const prompt = NeuralPromptApparatus.buildEnrichedInferencePrompt(
      OmnisyncAgentFactory.getAgentPersona(swarm.resolvedAgentId),
      knowledge.chunks,
      intent.payload.content,
      history,
      environmentalMetadata as any // Mapeo a gramática de IA
    );

    // 4. INFERENCIA: Ejecución bajo Sello de Conciencia
    return await NeuralInferenceApparatus.executeSovereignInference(
      config.id,
      intent.payload.content,
      intent.id,
      intent.channel as 'WHATSAPP' | 'WEB_CHAT' | 'VOICE_CALL'
    );
  }

  /**
   * @method verifyIntentChainOfCustody
   * @private
   * @description Valida que el ADN de la intención no haya mutado desde el Gateway.
   */
  private static verifyIntentChainOfCustody(intent: INeuralIntent): void {
    const expectedHash = crypto.createHash('sha256')
      .update(`${intent.id}:${intent.tenantId}:${intent.payload.content}`)
      .digest('hex');

    if (intent.dnaChecksum !== expectedHash) {
      OmnisyncSentinel.report({
        errorCode: 'OS-SEC-500',
        severity: 'CRITICAL',
        apparatus: this.apparatusName,
        operation: 'custody_audit',
        message: 'flow.orchestrator.errors.integrity_breach',
        context: { intentId: intent.id }
      });
      throw new Error('OS-SEC-500: Cadena de custodia de ADN neural rota.');
    }
  }

  private static async persistNeuralSymmetry(key: string, intent: INeuralIntent, res: IArtificialIntelligenceResponse): Promise<void> {
    await Promise.all([
      OmnisyncMemory.pushHistory(key, { role: 'user', content: intent.payload.content }),
      OmnisyncMemory.pushHistory(key, { role: 'assistant', content: res.suggestion }),
    ]);
  }

  private static async handleOrchestrationCollapse(intent: INeuralIntent, error: unknown): Promise<never> {
    await OmnisyncSentinel.report({
      errorCode: 'OS-CORE-500',
      severity: 'HIGH',
      apparatus: this.apparatusName,
      operation: 'pipeline_execution',
      message: 'flow.orchestrator.errors.cognitive_collapse',
      context: { intentId: intent.id, errorTrace: String(error) },
      isRecoverable: true
    });
    throw error;
  }
}