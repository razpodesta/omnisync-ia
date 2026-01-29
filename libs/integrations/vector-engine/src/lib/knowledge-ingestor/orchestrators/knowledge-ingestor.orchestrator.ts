/** libs/integrations/vector-engine/src/lib/knowledge-ingestor/orchestrators/knowledge-ingestor.orchestrator.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { NeuralEmbeddingApparatus } from '@omnisync/ai-engine';
import {
  IArtificialIntelligenceDriver,
  IKnowledgeSemanticChunk,
  TenantId,
  OmnisyncContracts,
} from '@omnisync/core-contracts';

import { IVectorDatabaseAgnosticDriver } from '../../schemas/vector-engine.schema';
import { KnowledgeClassifierApparatus } from '../knowledge-classifier.apparatus';
import { SemanticChunkerApparatus } from '../semantic-chunker.apparatus';
import { KnowledgeIngestionPipelineSchema } from '../schemas/knowledge-ingestor.schema';

/**
 * @name KnowledgeIngestorOrchestrator
 * @description Director de orquesta de alta disponibilidad para la ingesta de conocimiento.
 * Coordina la taxonomía cognitiva, fragmentación semántica y sincronización vectorial masiva.
 * Implementa una arquitectura de tubería síncrona con optimización de carga por lotes.
 *
 * @protocol OEDP-Level: Elite (Batch-Optimized & Forensic)
 */
export class KnowledgeIngestorOrchestrator {
  /**
   * @method executeFullIngestionPipeline
   * @description Ejecuta el pipeline neural 360°. Transforma texto bruto en vectores
   * persistidos mediante procesamiento de lotes de alta performance.
   *
   * @param {string} documentRawContent - Texto bruto a procesar.
   * @param {string} documentTitleIdentifier - Nombre del recurso de conocimiento.
   * @param {TenantId} tenantOrganizationIdentifier - ID nominal del suscriptor.
   * @param {IArtificialIntelligenceDriver} artificialIntelligenceDriver - Driver de IA activo.
   * @param {IVectorDatabaseAgnosticDriver} vectorDatabaseDriver - Driver de persistencia vectorial.
   */
  public static async executeFullIngestionPipeline(
    documentRawContent: string,
    documentTitleIdentifier: string,
    tenantOrganizationIdentifier: TenantId,
    artificialIntelligenceDriver: IArtificialIntelligenceDriver,
    vectorDatabaseDriver: IVectorDatabaseAgnosticDriver,
  ): Promise<void> {
    const apparatusName = 'KnowledgeIngestorOrchestrator';
    const operationName = 'executeFullIngestionPipeline';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        try {
          /**
           * @section 1. Fase de Validación de Soberanía (SSOT)
           */
          OmnisyncContracts.validate(
            KnowledgeIngestionPipelineSchema,
            {
              rawContent: documentRawContent,
              documentTitle: documentTitleIdentifier,
              tenantOrganizationIdentifier,
            },
            apparatusName,
          );

          /**
           * @section 2. Clasificación y Fragmentación
           * Determinamos la taxonomía y dividimos el ADN técnico en Smart Chunks.
           */
          const { category, tags } =
            await KnowledgeClassifierApparatus.classifyDocumentContent(
              artificialIntelligenceDriver,
              documentRawContent,
            );

          const knowledgeChunks = SemanticChunkerApparatus.executeSegmentation(
            documentRawContent,
            tenantOrganizationIdentifier,
            documentTitleIdentifier,
            category,
            tags,
          );

          OmnisyncTelemetry.verbose(
            apparatusName,
            'segmentation_complete',
            `Documento fragmentado en ${knowledgeChunks.length} unidades.`,
          );

          /**
           * @section 3. Fase de Vectorización Masiva (Batch Processing)
           * NIVELACIÓN V3.0: Erradicamos el bucle secuencial. Enviamos todos los
           * contenidos al motor de embeddings en una única operación de lote.
           */
          const textualContentsToEmbed = knowledgeChunks.map(
            (chunk) => chunk.content,
          );

          const vectorMatrix =
            await NeuralEmbeddingApparatus.generateBatchEmbeddings(
              artificialIntelligenceDriver,
              textualContentsToEmbed,
            );

          /**
           * @section 4. Hidratación de ADN Vectorial
           * Vinculamos las coordenadas calculadas con sus respectivos metadatos.
           */
          const finalizedEnrichedChunks: IKnowledgeSemanticChunk[] =
            knowledgeChunks.map((chunk, index) => ({
              ...chunk,
              metadata: {
                ...chunk.metadata,
                vectorCoordinates: vectorMatrix[index],
                indexationTimestamp: new Date().toISOString(),
                pipelineVersion: '3.0.ELITE',
                // Huella digital para control de integridad
                contentFingerprint: this.generateContentFingerprint(
                  chunk.content,
                ),
              },
            }));

          /**
           * @section 5. Sincronización con Nube Vectorial (Qdrant)
           * Persistencia atómica de la colección enriquecida.
           */
          await OmnisyncSentinel.executeWithResilience(
            () =>
              vectorDatabaseDriver.upsertKnowledgeChunks(
                finalizedEnrichedChunks,
              ),
            apparatusName,
            `bulk_upsert:${vectorDatabaseDriver.providerName}`,
          );

          OmnisyncTelemetry.verbose(
            apparatusName,
            'ingestion_success',
            `Pipeline completado: ${finalizedEnrichedChunks.length} vectores sincronizados.`,
          );
        } catch (criticalPipelineError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-602',
            severity: 'CRITICAL',
            apparatus: apparatusName,
            operation: operationName,
            message: 'integrations.vector_engine.pipeline_failure',
            context: {
              document: documentTitleIdentifier,
              tenant: tenantOrganizationIdentifier,
              error: String(criticalPipelineError),
            },
            isRecoverable: false,
          });
          throw criticalPipelineError;
        }
      },
    );
  }

  /**
   * @method generateContentFingerprint
   * @private
   * @description Genera un hash simplificado para identificación de contenido.
   * En V3.1 se sustituirá por un motor SHA-256 nativo de Node.
   */
  private static generateContentFingerprint(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `os_hash_${Math.abs(hash)}`;
  }
}
