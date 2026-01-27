/** libs/integrations/vector-engine/src/lib/vector-engine.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import {
  IKnowledgeSemanticChunk,
  IKnowledgeSemanticSearchResult,
  KnowledgeSemanticSearchResultSchema
} from '@omnisync/core-contracts';
import { SemanticRelevanceAssessor } from './semantic-relevance-assessor.apparatus';

/**
 * @interface IVectorDatabaseAgnosticDriver
 * @description Contrato para proveedores de base de datos vectorial.
 */
export interface IVectorDatabaseAgnosticDriver {
  readonly providerName: string;
  executeSemanticSearch(
    queryVector: number[],
    tenantId: string,
    limit: number
  ): Promise<IKnowledgeSemanticChunk[]>;
  upsertKnowledgeChunks(knowledgeChunks: IKnowledgeSemanticChunk[]): Promise<void>;
}

/**
 * @name OmnisyncVectorEngine
 * @description Orquestador de recuperación de conocimiento (RAG).
 * Puente de alta disponibilidad entre los drivers vectoriales y el AI-Engine.
 * 
 * @protocol OEDP-Level: Elite (Clean Orchestration)
 */
export class OmnisyncVectorEngine {

  /**
   * @method retrieveRelevantKnowledgeContext
   * @description Orquesta la búsqueda semántica y delega la evaluación de relevancia.
   */
  public static async retrieveRelevantKnowledgeContext(
    databaseDriver: IVectorDatabaseAgnosticDriver,
    queryVectorCoordinates: number[],
    tenantId: string,
    maximumResultsToRetrieve = 3,
    similarityThreshold = 0.7
  ): Promise<IKnowledgeSemanticSearchResult> {
    return await OmnisyncTelemetry.traceExecution(
      'OmnisyncVectorEngine',
      `retrieve:${databaseDriver.providerName}`,
      async () => {
        const searchStartTime = performance.now();

        try {
          /**
           * 1. Recuperación via Driver (Resiliencia Sentinel)
           */
          const searchResultsFound = await OmnisyncSentinel.executeWithResilience(
            () => databaseDriver.executeSemanticSearch(
              queryVectorCoordinates,
              tenantId,
              maximumResultsToRetrieve
            ),
            'OmnisyncVectorEngine',
            `search_operation:${databaseDriver.providerName}`
          );

          /**
           * 2. Evaluación de Relevancia (Delegación Atómica)
           */
          const { filteredChunks, averageScore } = SemanticRelevanceAssessor.assess(
            searchResultsFound,
            similarityThreshold
          );

          /**
           * 3. Consolidación SSOT
           */
          return KnowledgeSemanticSearchResultSchema.parse({
            chunks: filteredChunks,
            relevanceScore: averageScore,
            latencyInMilliseconds: performance.now() - searchStartTime
          });

        } catch (criticalError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-601',
            severity: 'HIGH',
            apparatus: 'OmnisyncVectorEngine',
            operation: 'retrieveRelevantKnowledgeContext',
            message: 'integrations.vector_engine.errors.retrieval_failure',
            context: { tenantId, error: String(criticalError) },
            isRecoverable: true
          });
          throw criticalError;
        }
      }
    );
  }
}