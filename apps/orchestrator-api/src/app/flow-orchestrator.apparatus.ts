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

// Adaptadores ERP (Lego Pieces) Sincronizados
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
 * @version 2.3 - Global Identity & Action Alignment
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
    const rawConfigurationRecord = await OmnisyncDatabase.databaseEngine.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!rawConfigurationRecord) {
      throw new Error(`OS-DOM-404: Nodo [${tenantId}] no localizado en la infraestructura.`);
    }

    return TenantConfigurationSchema.parse(rawConfigurationRecord);
  }

  /**
   * @method executeCognitiveInference
   * @private
   */
  private static async executeCognitiveInference(
    intent: INeuralIntent,
    tenantConfiguration: ITenantConfiguration,
    history: unknown[]
  ): Promise<IAIResponse> {
    const aiDriver = ArtificialIntelligenceDriverFactory.getSovereignDriver(tenantConfiguration.artificialIntelligence.provider);

    // Generación de Embeddings para RAG
    const queryVectorCoordinates = await OmnisyncArtificialIntelligenceEngine.generateVectorEmbeddings(
      aiDriver,
      intent.payload.content
    );

    const knowledgeContext = await OmnisyncVectorEngine.retrieveRelevantKnowledgeContext(
      new QdrantDriver(),
      queryVectorCoordinates,
      tenantConfiguration.id,
      tenantConfiguration.knowledgeRetrieval.maximumChunksToRetrieve,
      tenantConfiguration.knowledgeRetrieval.similarityScoreThreshold
    );

    const enrichedPrompt = NeuralPromptApparatus.buildEnrichedInferencePrompt(
      tenantConfiguration.artificialIntelligence.systemPrompt,
      knowledgeContext.chunks,
      intent.payload.content,
      history
    );

    return await OmnisyncArtificialIntelligenceEngine.executeGenerativeInference(
      aiDriver,
      enrichedPrompt,
      tenantConfiguration.artificialIntelligence.modelConfiguration,
      intent.id
    );
  }

  /**
   * @method executeOperationalActionIfNecessary
   * @private
   */
  private static async executeOperationalActionIfNecessary(
    incomingNeuralIntent: INeuralIntent,
    aiResponse: IAIResponse,
    tenantConfiguration: ITenantConfiguration
  ): Promise<IEnterpriseResourcePlanningActionResponse | undefined> {
    if (aiResponse.status !== 'ESCALATED_TO_ERP') return undefined;

    return await OmnisyncTelemetry.traceExecution(
        'NeuralFlowOrchestrator',
        'resolve_and_execute_erp',
        async () => {
            const dynamicErpAdapter = await this.resolveSovereignErpAdapter(tenantConfiguration);

            return await OmnisyncEnterpriseResourcePlanningOrchestrator.executeServiceTicketProvisioning(
              dynamicErpAdapter,
              {
                userId: incomingNeuralIntent.externalUserId,
                subject: `Incidencia Neural: ${incomingNeuralIntent.id.substring(0,8)}`,
                description: aiResponse.suggestion,
                priority: 'MEDIUM',
                createdAt: new Date().toISOString()
              }
            );
        }
    );
  }

  /**
   * @method resolveSovereignErpAdapter
   * @private
   * @description Factoría dinámica de adaptadores.
   * Se utiliza el bloque léxico {} en cada case para cumplir con las leyes de ESLint.
   */
  private static async resolveSovereignErpAdapter(
      tenantConfiguration: ITenantConfiguration
  ): Promise<IEnterpriseResourcePlanningAdapter> {
      const adapterIdentifier = tenantConfiguration.enterpriseResourcePlanning.adapterIdentifier;

      switch (adapterIdentifier) {
          case 'ODOO_V16': {
              const masterSystemEncryptionKey = process.env['SYSTEM_ENCRYPTION_KEY'];

              if (!masterSystemEncryptionKey) {
                  throw new Error('OS-SEC-004: Llave maestra ausente en el entorno de ejecución.');
              }

              const decryptedCredentialsRaw = await OmnisyncSecurity.decryptSensitiveData(
                tenantConfiguration.enterpriseResourcePlanning.encryptedCredentials,
                masterSystemEncryptionKey
              );

              return new OdooAdapterApparatus(JSON.parse(decryptedCredentialsRaw));
          }

          case 'MOCK_SYSTEM':
          default: {
              return new MockEnterpriseResourcePlanningAdapter();
          }
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
