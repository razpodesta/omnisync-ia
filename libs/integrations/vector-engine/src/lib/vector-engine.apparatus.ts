/** libs/integrations/vector-engine/src/lib/vector-engine.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import {
  IKnowledgeSemanticChunk,
  IKnowledgeSemanticSearchResult,
  KnowledgeSemanticSearchResultSchema,
  TenantId,
  OmnisyncContracts
} from '@omnisync/core-contracts';
import { SemanticRelevanceAssessor } from './semantic-relevance-assessor.apparatus';
import {
  IVectorDatabaseAgnosticDriver,
  VectorSearchConfigurationSchema
} from './schemas/vector-engine.schema';

/**
 * @name OmnisyncVectorEngine
 * @description Orquestador de recuperación de conocimiento (RAG).
 * Actúa como el puente de alta disponibilidad entre los drivers vectoriales y el
 * motor de inferencia, garantizando la relevancia del contexto recuperado.
 *
 * @protocol OEDP-Level: Elite (Synchronized Orchestration)
 */
export class OmnisyncVectorEngine {

  /**
   * @method retrieveRelevantKnowledgeContext
   * @description Orquesta la búsqueda semántica y valida la calidad de los resultados.
   *
   * @param {IVectorDatabaseAgnosticDriver} databaseDriver - Implementación vectorial (Lego Piece).
   * @param {number[]} queryVectorCoordinates - Firma vectorial de la consulta del usuario.
   * @param {TenantId} tenantOrganizationIdentifier - ID nominal de la organización.
   * @param {number} maximumResultsToRetrieve - Límite de chunks para el prompt.
   * @param {number} similarityScoreThreshold - Umbral mínimo de confianza.
   * @returns {Promise<IKnowledgeSemanticSearchResult>} Resultado consolidado bajo contrato SSOT.
   */
  public static async retrieveRelevantKnowledgeContext(
    databaseDriver: IVectorDatabaseAgnosticDriver,
    queryVectorCoordinates: number[],
    tenantOrganizationIdentifier: TenantId,
    maximumResultsToRetrieve = 3,
    similarityScoreThreshold = 0.7
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
           * @section Validación de Configuración
           */
          const searchConfiguration = OmnisyncContracts.validate(
            VectorSearchConfigurationSchema,
            { maximumChunksToRetrieve: maximumResultsToRetrieve, similarityScoreThreshold },
            apparatusName
          );

          /**
           * 1. Recuperación via Driver (Resiliencia Sentinel)
           */
          const searchResultsFound: IKnowledgeSemanticChunk[] = await OmnisyncSentinel.executeWithResilience(
            () => databaseDriver.executeSemanticSearch(
              queryVectorCoordinates,
              tenantOrganizationIdentifier,
              searchConfiguration.maximumChunksToRetrieve
            ),
            apparatusName,
            `vector_search_op:${databaseDriver.providerName}`
          );

          /**
           * 2. Evaluación de Relevancia (Cognitive Filtering)
           * NIVELACIÓN: Sanación de Error TS2339. Se invoca 'evaluateContextRelevance'
           * y se extraen las métricas de élite.
           */
          const {
            filteredChunks,
            averageScore,
            contextReliabilityPulse
          } = SemanticRelevanceAssessor.evaluateContextRelevance(
            searchResultsFound,
            searchConfiguration.similarityScoreThreshold
          );

          OmnisyncTelemetry.verbose(
            apparatusName,
            'context_audit',
            `RAG Quality: ${averageScore.toFixed(2)} | Pulse: ${contextReliabilityPulse.toFixed(2)}`
          );

          /**
           * 3. Consolidación SSOT
           */
          return KnowledgeSemanticSearchResultSchema.parse({
            chunks: filteredChunks,
            relevanceScore: averageScore,
            latencyInMilliseconds: performance.now() - searchStartTime
          });

        } catch (criticalRetrievalError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-601',
            severity: 'HIGH',
            apparatus: apparatusName,
            operation: operationName,
            message: 'integrations.vector_engine.retrieval_failure',
            context: {
                tenantId: tenantOrganizationIdentifier,
                error: String(criticalRetrievalError)
            },
            isRecoverable: true
          });
          throw criticalRetrievalError;
        }
      }
    );
  }
}
