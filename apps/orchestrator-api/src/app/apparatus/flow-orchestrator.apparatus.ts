/** apps/orchestrator-api/src/app/flow-orchestrator.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncMemory } from '@omnisync-ecosystem/persistence';
import {
  NeuralInferenceApparatus,
  NeuralEmbeddingApparatus,
  ArtificialIntelligenceDriverFactory
} from '@omnisync/ai-engine';
import { OmnisyncVectorEngine } from '@omnisync/vector-engine';
import { QdrantDriver } from '@omnisync/vector-qdrant';
import { NeuralPromptApparatus } from './neural-prompt.apparatus';
// Nota: Importaremos los nuevos aparatos de la misma capa una vez creados
import { ActionDispatcherApparatus } from './apparatus/action-dispatcher.apparatus';
import { SovereigntyResolverApparatus } from './apparatus/sovereignty-resolver.apparatus';

import {
  INeuralIntent,
  INeuralFlowResult,
  NeuralFlowResultSchema,
  ITenantConfiguration,
  IAIResponse,
  IEnterpriseResourcePlanningActionResponse,
  TenantId
} from '@omnisync/core-contracts';

/**
 * @name NeuralFlowOrchestrator
 * @description Director de orquesta neural de alta fidelidad.
 * Gestiona el ciclo de vida completo de una intención neural, coordinando
 * la resolución de soberanía, cognición RAG y despacho de acciones operativas.
 *
 * @protocol OEDP-Level: Elite (Clean Orchestration)
 */
export class NeuralFlowOrchestrator {

  /**
   * @method processNeuralIntentMessage
   * @description Punto de entrada soberano para el procesamiento de mensajes.
   *
   * @param {INeuralIntent} incomingNeuralIntent - La intención normalizada bajo contrato SSOT.
   * @returns {Promise<INeuralFlowResult>} El resultado consolidado de la inferencia y acción.
   */
  public static async processNeuralIntentMessage(
    incomingNeuralIntent: INeuralIntent
  ): Promise<INeuralFlowResult> {
    const apparatusName = 'NeuralFlowOrchestrator';
    const operationName = 'processNeuralIntentMessage';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        const executionStartTime = performance.now();

        try {
          /**
           * 1. FASE DE SOBERANÍA (Identity & Config)
           * Delegamos la resolución de la configuración al aparato especializado.
           */
          const tenantConfiguration = await SovereigntyResolverApparatus.resolveTenantSovereignty(
            incomingNeuralIntent.tenantId
          );

          /**
           * 2. FASE DE HIDRATACIÓN (Memory)
           */
          const sessionIdentifier = `os:session:${tenantConfiguration.id}:${incomingNeuralIntent.externalUserId}`;
          const conversationHistory = await OmnisyncMemory.getHistory(sessionIdentifier);

          /**
           * 3. FASE DE COGNICIÓN (RAG & Inference)
           * Implementamos la nueva arquitectura de IA atomizada.
           */
          const aiResponse = await this.executeCognitiveCycle(
            incomingNeuralIntent,
            tenantConfiguration,
            conversationHistory
          );

          /**
           * 4. FASE DE ACCIÓN (ERP Dispatch)
           * Delegamos la resolución del adaptador y ejecución al ActionDispatcher.
           */
          const erpAction = await ActionDispatcherApparatus.dispatchOperationalAction(
            incomingNeuralIntent,
            aiResponse,
            tenantConfiguration
          );

          /**
           * 5. FASE DE SINCRONIZACIÓN (Persistence)
           */
          await this.persistNeuralSymmetry(sessionIdentifier, incomingNeuralIntent, aiResponse);

          /**
           * @section Consolidación de Resultado Soberano
           */
          return NeuralFlowResultSchema.parse({
            intentId: incomingNeuralIntent.id,
            tenantId: incomingNeuralIntent.tenantId,
            aiResponse: aiResponse,
            erpAction: erpAction,
            finalMessage: aiResponse.suggestion,
            executionTime: performance.now() - executionStartTime
          });

        } catch (criticalError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-CORE-500',
            severity: 'HIGH',
            apparatus: apparatusName,
            operation: operationName,
            message: 'core.orchestration.pipeline_failed',
            context: {
              intentId: incomingNeuralIntent.id,
              error: String(criticalError)
            },
            isRecoverable: true
          });
          throw criticalError;
        }
      }
    );
  }

  /**
   * @method executeCognitiveCycle
   * @private
   * @description Orquesta la recuperación RAG y la inferencia utilizando aparatos atómicos.
   */
  private static async executeCognitiveCycle(
    intent: INeuralIntent,
    tenantConfig: ITenantConfiguration,
    history: unknown[]
  ): Promise<IAIResponse> {
    const aiDriver = ArtificialIntelligenceDriverFactory.getSovereignDriver(
      tenantConfig.artificialIntelligence.provider
    );

    // Invocación al nuevo NeuralEmbeddingApparatus (Atomizado)
    const queryVectorCoordinates = await NeuralEmbeddingApparatus.generateVectorEmbeddings(
      aiDriver,
      intent.payload.content
    );

    const knowledgeContext = await OmnisyncVectorEngine.retrieveRelevantKnowledgeContext(
      new QdrantDriver(),
      queryVectorCoordinates,
      tenantConfig.id,
      tenantConfig.knowledgeRetrieval.maximumChunksToRetrieve,
      tenantConfig.knowledgeRetrieval.similarityScoreThreshold
    );

    const enrichedPrompt = NeuralPromptApparatus.buildEnrichedInferencePrompt(
      tenantConfig.artificialIntelligence.systemPrompt,
      knowledgeContext.chunks,
      intent.payload.content,
      history
    );

    // Invocación al nuevo NeuralInferenceApparatus (Atomizado)
    return await NeuralInferenceApparatus.executeGenerativeInference(
      aiDriver,
      enrichedPrompt,
      tenantConfig.artificialIntelligence.modelConfiguration,
      intent.id
    );
  }

  /**
   * @method persistNeuralSymmetry
   * @private
   */
  private static async persistNeuralSymmetry(
    sessionId: string,
    intent: INeuralIntent,
    aiResponse: IAIResponse
  ): Promise<void> {
    await Promise.all([
      OmnisyncMemory.pushHistory(sessionId, { role: 'user', content: intent.payload.content }),
      OmnisyncMemory.pushHistory(sessionId, { role: 'assistant', content: aiResponse.suggestion })
    ]);
  }
}
