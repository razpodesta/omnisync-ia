/** apps/orchestrator-api/src/app/apparatus/flow-orchestrator.apparatus.ts */

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

/**
 * @section Inyección de Aparatos Subordinados
 */
import { NeuralPromptApparatus } from './neural-prompt.apparatus';
import { ActionDispatcherApparatus } from './action-dispatcher.apparatus';
import { SovereigntyResolverApparatus } from './sovereignty-resolver.apparatus';

import {
  INeuralIntent,
  INeuralFlowResult,
  NeuralFlowResultSchema,
  ITenantConfiguration,
  IAIResponse as IArtificialIntelligenceResponse,
} from '@omnisync/core-contracts';

/**
 * @name NeuralFlowOrchestrator
 * @description Director de orquesta neural de alta fidelidad.
 * Orquesta el ciclo de vida completo de una intención neural, coordinando secuencialmente
 * la resolución de soberanía, la recuperación semántica (RAG), la inferencia cognitiva
 * y el despacho de acciones operativas en sistemas externos.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Full-Sovereign-Orchestration V3.2)
 * @vision Ultra-Holística: Zero-Discrepancy-DNA & Financial-Sovereignty
 */
export class NeuralFlowOrchestrator {
  /**
   * @method processNeuralIntentMessage
   * @description Punto de entrada soberano para el procesamiento de mensajes omnicanal.
   * Ejecuta la tubería de orquestación 360° bajo blindaje de telemetría y resiliencia.
   *
   * @param {INeuralIntent} incomingNeuralIntent - La intención normalizada bajo contrato SSOT.
   * @returns {Promise<INeuralFlowResult>} El resultado consolidado de la inferencia y la acción.
   */
  public static async processNeuralIntentMessage(
    incomingNeuralIntent: INeuralIntent,
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
           * 1. FASE DE SOBERANÍA (Identity & Configuration)
           * Resolvemos el ADN técnico de la organización suscriptora con soporte de Caché L1.
           */
          const tenantConfiguration =
            await SovereigntyResolverApparatus.resolveTenantSovereignty(
              incomingNeuralIntent.tenantId,
            );

          /**
           * 2. FASE DE HIDRATACIÓN (Memory Retrieval)
           * Recuperamos el hilo de conversación desde Upstash Redis para coherencia semántica.
           */
          const sessionIdentifier = `os:session:${tenantConfiguration.id}:${incomingNeuralIntent.externalUserId}`;
          const conversationHistory =
            await OmnisyncMemory.getHistory(sessionIdentifier);

          /**
           * 3. FASE DE COGNICIÓN (RAG & Neural Inference)
           * Ejecutamos el ciclo de pensamiento asistido por base de conocimientos y auditoría financiera.
           */
          const artificialIntelligenceResponse =
            await this.executeCognitiveCycle(
              incomingNeuralIntent,
              tenantConfiguration,
              conversationHistory,
            );

          /**
           * 4. FASE DE ACCIÓN (ERP/CRM Dispatching)
           * Si la IA emite la señal 'ESCALATED_TO_ERP', el dispatcher activa el puente operativo.
           */
          const enterpriseResourcePlanningAction =
            await ActionDispatcherApparatus.dispatchOperationalAction(
              incomingNeuralIntent,
              artificialIntelligenceResponse,
              tenantConfiguration,
            );

          /**
           * 5. FASE DE SINCRONIZACIÓN (Symmetry Persistence)
           * Persistimos la interacción en la memoria volátil para futuros turnos de diálogo.
           */
          await this.persistNeuralSymmetry(
            sessionIdentifier,
            incomingNeuralIntent,
            artificialIntelligenceResponse,
          );

          /**
           * @section Consolidación de Resultado Soberano (SSOT)
           * Validamos que la salida cumpla estrictamente con el contrato maestro de orquestación.
           */
          return NeuralFlowResultSchema.parse({
            neuralIntentIdentifier: incomingNeuralIntent.id,
            tenantId: incomingNeuralIntent.tenantId,
            artificialIntelligenceResponse: artificialIntelligenceResponse,
            enterpriseResourcePlanningAction: enterpriseResourcePlanningAction,
            finalMessage: artificialIntelligenceResponse.suggestion,
            executionTimeInMilliseconds: performance.now() - executionStartTime,
          });
        } catch (criticalOrchestrationError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-CORE-500',
            severity: 'HIGH',
            apparatus: apparatusName,
            operation: operationName,
            message: 'core.orchestration.pipeline_failed',
            context: {
              neuralIntentIdentifier: incomingNeuralIntent.id,
              error: String(criticalOrchestrationError),
              tenantId: incomingNeuralIntent.tenantId,
            },
            isRecoverable: true,
          });
          throw criticalOrchestrationError;
        }
      },
      {
        channel: incomingNeuralIntent.channel,
        tenantId: incomingNeuralIntent.tenantId,
      },
    );
  }

  /**
   * @method executeCognitiveCycle
   * @private
   * @description Orquesta la recuperación de contexto (RAG) y la inferencia generativa auditada.
   */
  private static async executeCognitiveCycle(
    neuralIntent: INeuralIntent,
    tenantConfiguration: ITenantConfiguration,
    conversationHistory: unknown[],
  ): Promise<IArtificialIntelligenceResponse> {
    const aiDriver = ArtificialIntelligenceDriverFactory.getSovereignDriver(
      tenantConfiguration.artificialIntelligence.provider,
    );

    /**
     * 3a. Generación de Firma Vectorial (Query Embedding)
     * Transforma el lenguaje natural en coordenadas para el motor Rust de Qdrant.
     */
    const queryVectorCoordinates =
      await NeuralEmbeddingApparatus.generateVectorEmbeddings(
        aiDriver,
        neuralIntent.payload.content,
      );

    /**
     * 3b. Recuperación Semántica (Vector Retrieval)
     * Localiza los fragmentos de manuales técnicos más relevantes para el Tenant.
     */
    const knowledgeContext =
      await OmnisyncVectorEngine.retrieveRelevantKnowledgeContext(
        new QdrantDriver(),
        queryVectorCoordinates,
        tenantConfiguration.id,
        tenantConfiguration.knowledgeRetrieval.maximumChunksToRetrieve,
        tenantConfiguration.knowledgeRetrieval.similarityScoreThreshold,
      );

    /**
     * 3c. Construcción de Prompt Enriquecido
     * Ensambla Directiva de Sistema + RAG Context + Historial + Consulta.
     */
    const enrichedPrompt = NeuralPromptApparatus.buildEnrichedInferencePrompt(
      tenantConfiguration.artificialIntelligence.systemPrompt,
      knowledgeContext.chunks,
      neuralIntent.payload.content,
      conversationHistory,
    );

    /**
     * 3d. Inferencia Generativa Propietaria
     * RESOLUCIÓN TS2554: Se inyecta 'tenantConfiguration.id' como 5to argumento
     * para habilitar la soberanía financiera y auditoría de tokens.
     */
    return await NeuralInferenceApparatus.executeGenerativeInference(
      aiDriver,
      enrichedPrompt,
      tenantConfiguration.artificialIntelligence.modelConfiguration,
      neuralIntent.id,
      tenantConfiguration.id,
    );
  }

  /**
   * @method persistNeuralSymmetry
   * @private
   * @description Registra biyectivamente el diálogo en la capa de memoria volátil.
   */
  private static async persistNeuralSymmetry(
    sessionIdentifier: string,
    neuralIntent: INeuralIntent,
    artificialIntelligenceResponse: IArtificialIntelligenceResponse,
  ): Promise<void> {
    await Promise.all([
      OmnisyncMemory.pushHistory(sessionIdentifier, {
        role: 'user',
        content: neuralIntent.payload.content,
      }),
      OmnisyncMemory.pushHistory(sessionIdentifier, {
        role: 'assistant',
        content: artificialIntelligenceResponse.suggestion,
      }),
    ]);
  }
}