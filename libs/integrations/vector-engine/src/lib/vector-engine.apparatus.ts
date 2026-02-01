/** libs/integrations/vector-engine/src/lib/vector-engine.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import {
  IKnowledgeSemanticChunk,
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
 * @description Nodo maestro de Recuperación Semántica de Capas Cruzadas (V5.5).
 * Implementa la visión "Ojos de Mosca" para orquestar búsquedas vectoriales 
 * multidimensionales. No solo busca cercanía matemática, sino que audita la 
 * afinidad entre el propósito de la consulta y la intención del ADN persistido.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Cross-Layer-RAG V5.5)
 */
export class OmnisyncVectorEngine {
  private static readonly apparatusName = 'OmnisyncVectorEngine';

  /**
   * @method retrieveRelevantKnowledgeContext
   * @description Ejecuta el pipeline de recuperación cognitiva 360°. 
   * Realiza un triaje de filtros antes del despacho y una re-evaluación 
   * de relevancia post-recuperación basada en el "Intent Match".
   */
  public static async retrieveRelevantKnowledgeContext(
    databaseDriver: IVectorDatabaseAgnosticDriver,
    queryVectorCoordinates: number[],
    tenantId: TenantId,
    options: Partial<IVectorSearchConfiguration> = {}
  ): Promise<IKnowledgeSemanticSearchResult> {
    const operationName = `retrieve:${databaseDriver.providerName}`;

    return await OmnisyncTelemetry.traceExecution(this.apparatusName, operationName, async () => {
      const searchStartTime = performance.now();

      try {
        // 1. ADUANA DE CONFIGURACIÓN DINÁMICA
        const config = OmnisyncContracts.validate(VectorSearchConfigurationSchema, options, this.apparatusName);

        // 2. DESPACHO FILTRADO (Handshake con Driver)
        // Inyectamos los filtros de intención en la consulta física para que el motor vectorial (Qdrant)
        // optimice el escaneo del índice.
        const rawChunksFound = await OmnisyncSentinel.executeWithResilience(
          () => databaseDriver.executeSemanticSearch(
            queryVectorCoordinates,
            tenantId,
            config.maximumChunksToRetrieve,
            this.assembleMetadataFilters(config)
          ),
          this.apparatusName,
          'vector_physical_fetch'
        );

        // 3. TRIAJE DE RESONANCIA SEMÁNTICA (Ojos de Mosca)
        // No solo validamos el score, sino que penalizamos o premiamos según el match de intención.
        const weightedChunks = this.applyIntentAffinityWeighting(rawChunksFound, config);

        const relevanceAudit = SemanticRelevanceAssessor.evaluateContextRelevance(
          weightedChunks,
          config.similarityScoreThreshold
        );

        OmnisyncTelemetry.verbose(this.apparatusName, 'semantic_resonance_established', 
          `Resonance: ${relevanceAudit.averageScore.toFixed(4)} | Chunks: ${relevanceAudit.filteredChunks.length}`,
          { hasAnchor: relevanceAudit.hasHighConfidenceAnchor }
        );

        // 4. SELLO DE RESULTADO SOBERANO (SSOT)
        const searchResult: IKnowledgeSemanticSearchResult = {
          chunks: relevanceAudit.filteredChunks,
          relevanceScore: relevanceAudit.averageScore,
          latencyInMilliseconds: performance.now() - searchStartTime,
        };

        return OmnisyncContracts.validate(
          KnowledgeSemanticSearchResultSchema,
          searchResult,
          this.apparatusName
        );

      } catch (criticalRetrievalError: unknown) {
        return await this.handleRetrievalColapse(tenantId, criticalRetrievalError, searchStartTime);
      }
    }, { tenantId, provider: databaseDriver.providerName });
  }

  /**
   * @method assembleMetadataFilters
   * @private
   * @description Transforma la intención de búsqueda en gramática de filtrado para el driver.
   */
  private static assembleMetadataFilters(config: IVectorSearchConfiguration): Record<string, unknown> {
    const filters: Record<string, unknown> = {};
    
    if (config.filters?.requiredIntent) {
      filters['instructionalIntent'] = config.filters.requiredIntent;
    }

    if (config.filters?.minimumTechnicalDensity) {
      filters['technicalDensity'] = { gte: config.filters.minimumTechnicalDensity };
    }

    return filters;
  }

  /**
   * @method applyIntentAffinityWeighting
   * @private
   * @description Algoritmo de "Afinidad de Capa". 
   * Penaliza fragmentos que, aunque cercanos matemáticamente, no coinciden 
   * con la intención técnica de la consulta.
   */
  private static applyIntentAffinityWeighting(
    chunks: IKnowledgeSemanticChunk[],
    config: IVectorSearchConfiguration
  ): IKnowledgeSemanticChunk[] {
    if (!config.filters?.requiredIntent) return chunks;

    return chunks.map(chunk => {
      const chunkMetadata = chunk.metadata as any;
      const originalScore = chunkMetadata.score || 0;
      
      // Si la intención no coincide, aplicamos el Semantic Penalty Factor
      const intentMatch = chunkMetadata.instructionalIntent === config.filters?.requiredIntent;
      const weightedScore = intentMatch ? originalScore : originalScore * (1 - config.semanticPenaltyFactor);

      return {
        ...chunk,
        metadata: { ...chunkMetadata, score: weightedScore }
      };
    });
  }

  /**
   * @method handleRetrievalColapse
   * @private
   */
  private static async handleRetrievalColapse(
    tenantId: TenantId, 
    error: unknown, 
    start: number
  ): Promise<IKnowledgeSemanticSearchResult> {
    await OmnisyncSentinel.report({
      errorCode: 'OS-INTEG-601',
      severity: 'HIGH',
      apparatus: this.apparatusName,
      operation: 'retrieve_pipeline',
      message: 'Colapso en la recuperación semántica de capas cruzadas.',
      context: { tenantId, errorTrace: String(error) },
      isRecoverable: true
    });

    return {
      chunks: [],
      relevanceScore: 0,
      latencyInMilliseconds: performance.now() - start
    };
  }
}