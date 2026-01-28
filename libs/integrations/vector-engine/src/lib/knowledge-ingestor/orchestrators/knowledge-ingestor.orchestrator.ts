/** libs/integrations/vector-engine/src/lib/knowledge-ingestor/orchestrators/knowledge-ingestor.orchestrator.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { NeuralEmbeddingApparatus } from '@omnisync/ai-engine';
import {
  IArtificialIntelligenceDriver,
  IKnowledgeSemanticChunk,
  TenantId,
  OmnisyncContracts
} from '@omnisync/core-contracts';

/**
 * @section Sincronización de ADN
 * Importación corregida desde el esquema soberano de la capa vectorial.
 */
import { IVectorDatabaseAgnosticDriver } from '../../schemas/vector-engine.schema';
import { KnowledgeClassifierApparatus } from '../knowledge-classifier.apparatus';
import { SemanticChunkerApparatus } from '../semantic-chunker.apparatus';
import { KnowledgeIngestionPipelineSchema } from '../schemas/knowledge-ingestor.schema';

/**
 * @name KnowledgeIngestorOrchestrator
 * @description Director de orquesta de alta disponibilidad para la ingesta de conocimiento.
 * Coordina la taxonomía cognitiva, fragmentación semántica y sincronización vectorial.
 * Implementa control de flujo secuencial para garantizar la soberanía de cuotas de IA.
 *
 * @protocol OEDP-Level: Elite (Path-Nivelated & Resilient)
 */
export class KnowledgeIngestorOrchestrator {

  /**
   * @method executeFullIngestionPipeline
   * @description Ejecuta el pipeline neural 360° con blindaje de integridad y trazabilidad.
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
    vectorDatabaseDriver: IVectorDatabaseAgnosticDriver
  ): Promise<void> {
    const apparatusName = 'KnowledgeIngestorOrchestrator';
    const operationName = 'executeFullIngestionPipeline';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        try {
          // 1. Fase de Validación de Contrato (ADN Preventivo)
          OmnisyncContracts.validate(KnowledgeIngestionPipelineSchema, {
            rawContent: documentRawContent,
            documentTitle: documentTitleIdentifier,
            tenantOrganizationIdentifier
          }, apparatusName);

          // 2. Fase de Clasificación Cognitiva (Taxonomía)
          const { category, tags } = await KnowledgeClassifierApparatus.classifyDocumentContent(
            artificialIntelligenceDriver,
            documentRawContent
          );

          // 3. Fase de Fragmentación Semántica (Smart Chunks)
          const knowledgeChunks = SemanticChunkerApparatus.executeSegmentation(
            documentRawContent,
            tenantOrganizationIdentifier,
            documentTitleIdentifier,
            category,
            tags
          );

          /**
           * 4. Fase de Vectorización (Sequential Embedding Generation)
           * NIVELACIÓN: Procesamiento determinista para evitar regresiones por
           * saturación de sockets o Rate Limits en entornos Serverless.
           */
          const enrichedChunks: IKnowledgeSemanticChunk[] = [];

          OmnisyncTelemetry.verbose(apparatusName, 'embedding_cycle_start', `Generando firmas para ${knowledgeChunks.length} fragmentos.`);

          for (const currentChunk of knowledgeChunks) {
            const vectorCoordinates = await NeuralEmbeddingApparatus.generateVectorEmbeddings(
              artificialIntelligenceDriver,
              currentChunk.content
            );

            enrichedChunks.push({
              ...currentChunk,
              metadata: {
                ...currentChunk.metadata,
                vectorCoordinates,
                indexationTimestamp: new Date().toISOString()
              }
            });
          }

          /**
           * 5. Fase de Persistencia Vectorial
           */
          await OmnisyncSentinel.executeWithResilience(
            () => vectorDatabaseDriver.upsertKnowledgeChunks(enrichedChunks),
            apparatusName,
            `upsert:${vectorDatabaseDriver.providerName}`
          );

          OmnisyncTelemetry.verbose(
            apparatusName,
            'pipeline_success',
            `Conocimiento indexado: ${enrichedChunks.length} vectores sincronizados en ${vectorDatabaseDriver.providerName}.`
          );

        } catch (criticalPipelineError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-602',
            severity: 'CRITICAL',
            apparatus: apparatusName,
            operation: operationName,
            message: 'integrations.vector_engine.pipeline_failure',
            context: {
                title: documentTitleIdentifier,
                tenant: tenantOrganizationIdentifier,
                error: String(criticalPipelineError)
            },
            isRecoverable: false
          });
          throw criticalPipelineError;
        }
      }
    );
  }
}
