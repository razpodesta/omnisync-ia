/** libs/integrations/vector-engine/src/lib/knowledge-ingestor/knowledge-ingestor.orchestrator.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncArtificialIntelligenceEngine } from '@omnisync/ai-engine';
import { 
  IArtificialIntelligenceDriver,
  IKnowledgeSemanticChunk,
  TenantId
} from '@omnisync/core-contracts';
import { IVectorDatabaseAgnosticDriver } from '../vector-engine.apparatus';
import { KnowledgeClassifierApparatus } from './knowledge-classifier.apparatus';
import { SemanticChunkerApparatus } from './semantic-chunker.apparatus';

/**
 * @name KnowledgeIngestorOrchestrator
 * @description Director de orquesta para la ingesta de conocimiento.
 * Coordina la clasificación, fragmentación, vectorización y persistencia.
 */
export class KnowledgeIngestorOrchestrator {
  
  /**
   * @method executeFullIngestionPipeline
   * @description Ejecuta el pipeline neural 360° para transformar texto en ADN técnico.
   */
  public static async executeFullIngestionPipeline(
    rawContent: string,
    documentTitle: string,
    tenantOrganizationIdentifier: TenantId,
    aiDriver: IArtificialIntelligenceDriver,
    vectorDriver: IVectorDatabaseAgnosticDriver
  ): Promise<void> {
    return await OmnisyncTelemetry.traceExecution(
      'KnowledgeIngestorOrchestrator',
      'executeFullIngestionPipeline',
      async () => {
        try {
          // 1. Clasificación Cognitiva
          const { category, tags } = await KnowledgeClassifierApparatus.classifyDocumentContent(
            aiDriver, 
            rawContent
          );

          // 2. Fragmentación Semántica
          const knowledgeChunks = SemanticChunkerApparatus.executeSegmentation(
            rawContent,
            tenantOrganizationIdentifier,
            documentTitle,
            category,
            tags
          );

          // 3. Generación de Firmas Vectoriales (Embeddings)
          // Se procesa cada chunk para inyectar sus coordenadas en los metadatos.
          const enrichedChunks: IKnowledgeSemanticChunk[] = await Promise.all(
            knowledgeChunks.map(async (chunk) => {
              const vectorCoordinates = await OmnisyncArtificialIntelligenceEngine.generateVectorEmbeddings(
                aiDriver,
                chunk.content
              );

              return {
                ...chunk,
                metadata: { ...chunk.metadata, vectorCoordinates }
              };
            })
          );

          // 4. Persistencia Vectorial Agonística
          await OmnisyncSentinel.executeWithResilience(
            () => vectorDriver.upsertKnowledgeChunks(enrichedChunks),
            'KnowledgeIngestorOrchestrator',
            `upsert:${vectorDriver.providerName}`
          );

          OmnisyncTelemetry.verbose(
            'KnowledgeIngestorOrchestrator',
            'success',
            `Pipeline completado: ${enrichedChunks.length} fragmentos indexados.`
          );

        } catch (criticalError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-602',
            severity: 'CRITICAL',
            apparatus: 'KnowledgeIngestorOrchestrator',
            operation: 'pipeline',
            message: 'Fallo sistémico en la ingesta de ADN técnico',
            context: { documentTitle, error: String(criticalError) }
          });
          throw criticalError;
        }
      }
    );
  }
}