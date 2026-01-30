/** libs/integrations/vector-engine/src/lib/vector-engine.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import {
  IKnowledgeSemanticChunk, // SANEADO: Ahora se usa explícitamente en el flujo
  IKnowledgeSemanticSearchResult,
  KnowledgeSemanticSearchResultSchema,
  TenantId,
  OmnisyncContracts,
} from '@omnisync/core-contracts';
import { SemanticRelevanceAssessor } from './semantic-relevance-assessor.apparatus';
import {
  IVectorDatabaseAgnosticDriver,
  VectorSearchConfigurationSchema,
  IVectorSearchConfiguration,
} from './schemas/vector-engine.schema';

/**
 * @name OmnisyncVectorEngine
 * @description Nodo maestro de Recuperación Semántica (RAG). 
 * Orquesta el ciclo de vida de la consulta de conocimiento, actuando como 
 * puente de alta disponibilidad entre los drivers vectoriales (Qdrant/Pinecone) 
 * y el motor de inferencia. Garantiza que solo el ADN técnico más relevante 
 * sea inyectado en el prompt de la IA.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (RAG-Orchestration V3.2)
 * @vision Ultra-Holística: Zero-Hallucination & Mathematical-Triage
 */
export class OmnisyncVectorEngine {
  /**
   * @method retrieveRelevantKnowledgeContext
   * @description Ejecuta el pipeline de recuperación cognitiva. 
   * Valida la configuración, orquesta la búsqueda resiliente y delega 
   * el triaje de relevancia al aparato especialista.
   *
   * @param {IVectorDatabaseAgnosticDriver} databaseDriver - Driver vectorial activo.
   * @param {number[]} queryVectorCoordinates - Firma matemática de la consulta.
   * @param {TenantId} tenantId - Identificador nominal de soberanía.
   * @param {number} maxResults - Límite de fragmentos (Default: 3).
   * @param {number} scoreThreshold - Umbral de similitud (Default: 0.75).
   * @returns {Promise<IKnowledgeSemanticSearchResult>} ADN de contexto validado por SSOT.
   */
  public static async retrieveRelevantKnowledgeContext(
    databaseDriver: IVectorDatabaseAgnosticDriver,
    queryVectorCoordinates: number[],
    tenantId: TenantId,
    maxResults = 3,
    scoreThreshold = 0.75,
  ): Promise<IKnowledgeSemanticSearchResult> {
    const apparatusName = 'OmnisyncVectorEngine';
    const operationName = `retrieve:${databaseDriver.providerName}`;

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        const searchStartTime = performance.now();

        try {
          /**
           * @section Fase 1: Validación de Frontera (SSOT)
           */
          const config: IVectorSearchConfiguration = OmnisyncContracts.validate(
            VectorSearchConfigurationSchema,
            { maximumChunksToRetrieve: maxResults, similarityScoreThreshold: scoreThreshold },
            apparatusName
          );

          /**
           * @section Fase 2: Recuperación Física (Resiliencia Sentinel)
           * NIVELACIÓN LINT: Se tipa explícitamente la colección capturada para usar el import.
           */
          const rawChunksFound: IKnowledgeSemanticChunk[] = await OmnisyncSentinel.executeWithResilience(
            () => databaseDriver.executeSemanticSearch(
              queryVectorCoordinates,
              tenantId,
              config.maximumChunksToRetrieve
            ),
            apparatusName,
            `vector_search_op:${databaseDriver.providerName}`
          );

          /**
           * @section Fase 3: Triaje Cognitivo (Atomización)
           * Delegamos la evaluación matemática al SemanticRelevanceAssessor.
           */
          const relevanceAudit = SemanticRelevanceAssessor.evaluateContextRelevance(
            [...rawChunksFound],
            config.similarityScoreThreshold
          );

          OmnisyncTelemetry.verbose(
            apparatusName,
            'knowledge_pulse',
            `RAG Quality: ${relevanceAudit.averageScore.toFixed(4)} | Reliable: ${relevanceAudit.hasHighConfidenceAnchor}`,
            { chunksProcessed: rawChunksFound.length }
          );

          /**
           * @section Fase 4: Consolidación de Resultado Soberano
           */
          const searchResult: IKnowledgeSemanticSearchResult = {
            chunks: [...relevanceAudit.filteredChunks],
            relevanceScore: relevanceAudit.averageScore,
            latencyInMilliseconds: performance.now() - searchStartTime,
          };

          return OmnisyncContracts.validate(
            KnowledgeSemanticSearchResultSchema,
            searchResult,
            `${apparatusName}:FinalConsolidation`
          );

        } catch (criticalRetrievalError: unknown) {
          /**
           * @note Protocolo de Desastre
           * El fallo en RAG es MEDIUM/HIGH: la IA puede responder pero sin contexto.
           */
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-601',
            severity: 'HIGH',
            apparatus: apparatusName,
            operation: operationName,
            message: 'integrations.vector_engine.retrieval_failure',
            context: { tenantId, error: String(criticalRetrievalError) },
            isRecoverable: true,
          });
          throw criticalRetrievalError;
        }
      },
      { tenantId, provider: databaseDriver.providerName }
    );
  }
}