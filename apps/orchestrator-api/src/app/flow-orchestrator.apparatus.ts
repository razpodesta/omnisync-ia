/** apps/orchestrator-api/src/app/flow-orchestrator.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncSecurity } from '@omnisync/core-security';
import { OmnisyncDatabase, OmnisyncMemory } from '@omnisync-ecosystem/persistence';
import {
  ArtificialIntelligenceDriverFactory,
  OmnisyncArtificialIntelligenceEngine
} from '@omnisync/ai-engine';
import { OmnisyncVectorEngine } from '@omnisync/vector-engine';
import { QdrantDriver } from '@omnisync/vector-qdrant';
import { OmnisyncEnterpriseResourcePlanningOrchestrator } from '@omnisync/erp-engine';

// Adaptadores ERP (Lego Pieces)
import { MockEnterpriseResourcePlanningAdapter } from '@omnisync/erp-mock';
import { OdooAdapterApparatus } from '@omnisync/erp-odoo';

import { NeuralPromptApparatus } from './neural-prompt.apparatus';
import {
  INeuralIntent,
  INeuralFlowResult,
  NeuralFlowResultSchema,
  TenantConfigurationSchema,
  ITenantConfiguration,
  IAIResponse,
  IEnterpriseResourcePlanningActionResponse,
  IEnterpriseResourcePlanningAdapter,
  TenantId
} from '@omnisync/core-contracts';

/**
 * @name NeuralFlowOrchestrator
 * @description Cerebro de orquestación neural de alto rendimiento.
 * Coordina la resolución de identidad, recuperación de memoria, contexto RAG
 * e inferencia operativa mediante una tubería de fases atomizadas.
 *
 * @version 2.1 - Dynamic ERP Injection Nivelada
 * @protocol OEDP-Level: Elite (Atomized Pipeline)
 */
export class NeuralFlowOrchestrator {

  /**
   * @method processNeuralIntentMessage
   * @description Punto de entrada principal. Dirige la orquestación neural 360°.
   */
  public static async processNeuralIntentMessage(
    incomingNeuralIntent: INeuralIntent
  ): Promise<INeuralFlowResult> {
    return await OmnisyncTelemetry.traceExecution(
      'NeuralFlowOrchestrator',
      'processNeuralIntentMessage',
      async () => {
        const executionStartTime = performance.now();

        try {
          // 1. Fase de Soberanía (Identity)
          const tenantConfiguration = await this.resolveTenantSovereignty(incomingNeuralIntent.tenantId);

          // 2. Fase de Memoria (Hydration)
          const sessionIdentifier = `os:session:${tenantConfiguration.id}:${incomingNeuralIntent.externalUserId}`;
          const conversationHistory = await OmnisyncMemory.getHistory(sessionIdentifier);

          // 3. Fase de Cognición (RAG & Inference)
          const aiResponse = await this.executeCognitiveInference(
            incomingNeuralIntent,
            tenantConfiguration,
            conversationHistory
          );

          // 4. Fase de Acción (Dynamic ERP Execution)
          // NIVELACIÓN: Ahora se inyecta la configuración para resolución dinámica.
          const erpAction = await this.executeOperationalActionIfNecessary(
            incomingNeuralIntent,
            aiResponse,
            tenantConfiguration
          );

          // 5. Fase de Persistencia (Synchronization)
          await this.synchronizeConversationMemory(sessionIdentifier, incomingNeuralIntent, aiResponse);

          /**
           * @section Consolidación SSOT
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
            apparatus: 'NeuralFlowOrchestrator',
            operation: 'pipeline_execution',
            message: 'neural.flow.orchestration_failed',
            context: { intentId: incomingNeuralIntent.id, error: String(criticalError) },
            isRecoverable: true
          });
          throw criticalError;
        }
      }
    );
  }

  /**
   * @method resolveTenantSovereignty
   * @private
   */
  private static async resolveTenantSovereignty(tenantId: TenantId): Promise<ITenantConfiguration> {
    const rawConfig = await OmnisyncDatabase.databaseEngine.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!rawConfig) {
      throw new Error(`OS-DOM-404: Node [${tenantId}] missing in infrastructure.`);
    }

    return TenantConfigurationSchema.parse(rawConfig);
  }

  /**
   * @method executeCognitiveInference
   * @private
   */
  private static async executeCognitiveInference(
    intent: INeuralIntent,
    config: ITenantConfiguration,
    history: unknown[]
  ): Promise<IAIResponse> {
    const aiDriver = ArtificialIntelligenceDriverFactory.getSovereignDriver(config.artificialIntelligence.provider);

    const queryVector = await OmnisyncArtificialIntelligenceEngine.generateVectorEmbeddings(
      aiDriver,
      intent.payload.content
    );

    const knowledgeContext = await OmnisyncVectorEngine.retrieveRelevantKnowledgeContext(
      new QdrantDriver(),
      queryVector,
      config.id,
      config.knowledgeRetrieval.maximumChunksToRetrieve,
      config.knowledgeRetrieval.similarityScoreThreshold
    );

    const enrichedPrompt = NeuralPromptApparatus.buildEnrichedInferencePrompt(
      config.artificialIntelligence.systemPrompt,
      knowledgeContext.chunks,
      intent.payload.content,
      history
    );

    return await OmnisyncArtificialIntelligenceEngine.executeGenerativeInference(
      aiDriver,
      enrichedPrompt,
      config.artificialIntelligence.modelConfiguration,
      intent.id
    );
  }

  /**
   * @method executeOperationalActionIfNecessary
   * @private
   * @description Orquesta la ejecución en el ERP basándose en el ADN del Tenant.
   * Implementa la fábrica dinámica de adaptadores.
   */
  private static async executeOperationalActionIfNecessary(
    intent: INeuralIntent,
    aiResponse: IAIResponse,
    tenantConfiguration: ITenantConfiguration
  ): Promise<IEnterpriseResourcePlanningActionResponse | undefined> {
    if (aiResponse.status !== 'ESCALATED_TO_ERP') return undefined;

    return await OmnisyncTelemetry.traceExecution(
        'NeuralFlowOrchestrator',
        'resolve_and_execute_erp',
        async () => {
            const erpAdapter = await this.resolveSovereignErpAdapter(tenantConfiguration);

            return await OmnisyncEnterpriseResourcePlanningOrchestrator.executeServiceTicketProvisioning(
                erpAdapter,
                {
                    externalUserId: intent.externalUserId,
                    subject: `Incidencia Neural: ${intent.id.substring(0,8)}`,
                    description: aiResponse.suggestion,
                    priority: 'MEDIUM'
                }
            );
        }
    );
  }

  /**
   * @method resolveSovereignErpAdapter
   * @private
   * @description Factoría interna para la resolución de adaptadores ERP con desencriptación de llaves.
   */
  private static async resolveSovereignErpAdapter(
      config: ITenantConfiguration
  ): Promise<IEnterpriseResourcePlanningAdapter> {
      const adapterType = config.enterpriseResourcePlanning.adapterIdentifier;

      switch (adapterType) {
          case 'ODOO_V16': // Mapeo para Odoo Online
              // En un flujo real, 'secretKey' se recupera de variables de entorno de Render
              const credentials = await OmnisyncSecurity.decryptSensitiveData(
                  config.enterpriseResourcePlanning.encryptedCredentials,
                  process.env['SYSTEM_ENCRYPTION_KEY'] ?? 'fallback_key'
              );
              return new OdooAdapterApparatus(JSON.parse(credentials));

          case 'MOCK_SYSTEM':
          default:
              return new MockEnterpriseResourcePlanningAdapter();
      }
  }

  /**
   * @method synchronizeConversationMemory
   * @private
   */
  private static async synchronizeConversationMemory(
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
