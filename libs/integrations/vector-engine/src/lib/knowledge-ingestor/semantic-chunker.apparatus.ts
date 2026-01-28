/** libs/integrations/vector-engine/src/lib/knowledge-ingestor/semantic-chunker.apparatus.ts */

import {
  IKnowledgeSemanticChunk,
  KnowledgeSemanticChunkSchema,
  KnowledgeOrganizationCategorySchema,
  TenantId
} from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import {
  SemanticChunkerConfigurationSchema,
  ISemanticChunkerConfiguration
} from './schemas/semantic-chunker.schema';
import { z } from 'zod';

/**
 * @name SemanticChunkerApparatus
 * @description Aparato de alta precisión encargado de la segmentación de texto.
 * Utiliza un algoritmo de ventana deslizante con detección de fronteras semánticas
 * para asegurar que los fragmentos inyectados en la base de datos vectorial
 * mantengan la coherencia lingüística necesaria para un RAG de élite.
 *
 * @protocol OEDP-Level: Elite (Semantic Integrity)
 */
export class SemanticChunkerApparatus {

  /**
   * @method executeSegmentation
   * @description Orquesta la división del contenido técnico aplicando lógica de "Smart Cut".
   *
   * @param {string} rawTextualContent - ADN técnico bruto.
   * @param {TenantId} tenantOrganizationIdentifier - ID de soberanía del suscriptor.
   * @param {string} documentTitle - Referencia al origen del conocimiento.
   * @param {z.infer<typeof KnowledgeOrganizationCategorySchema>} semanticCategory - Clasificación taxonómica.
   * @param {string[]} semanticTags - Etiquetas de búsqueda.
   * @param {Partial<ISemanticChunkerConfiguration>} customConfiguration - Parámetros de ajuste fino.
   * @returns {IKnowledgeSemanticChunk[]} Lista de fragmentos validados por SSOT.
   */
  public static executeSegmentation(
    rawTextualContent: string,
    tenantOrganizationIdentifier: TenantId,
    documentTitle: string,
    semanticCategory: z.infer<typeof KnowledgeOrganizationCategorySchema>,
    semanticTags: string[],
    customConfiguration: Partial<ISemanticChunkerConfiguration> = {}
  ): IKnowledgeSemanticChunk[] {
    const apparatusName = 'SemanticChunkerApparatus';

    return OmnisyncTelemetry.traceExecutionSync(
      apparatusName,
      'executeSegmentation',
      () => {
        // 1. Hidratación de Configuración (ADN de Operación)
        const config = SemanticChunkerConfigurationSchema.parse(customConfiguration);

        const documentChunks: IKnowledgeSemanticChunk[] = [];
        const contentSize = rawTextualContent.length;
        let textTraversalPointer = 0;

        while (textTraversalPointer < contentSize) {
          /**
           * @section Cálculo de Punto de Corte Inteligente
           * Buscamos el final de una palabra o signo de puntuación para evitar cortes bizarros.
           */
          let endPointer = Math.min(textTraversalPointer + config.maximumChunkSize, contentSize);

          if (config.enableSmartBoundaryDetection && endPointer < contentSize) {
            const nextSpaceIndex = rawTextualContent.indexOf(' ', endPointer);
            const lastPeriodIndex = rawTextualContent.lastIndexOf('.', endPointer);

            // Si hay un punto cercano (último 10% del chunk), preferimos cortar ahí.
            if (lastPeriodIndex > textTraversalPointer + (config.maximumChunkSize * 0.8)) {
                endPointer = lastPeriodIndex + 1;
            } else if (nextSpaceIndex !== -1 && nextSpaceIndex < endPointer + 20) {
                // Si hay un espacio justo después, lo incluimos.
                endPointer = nextSpaceIndex;
            }
          }

          const fragmentText = rawTextualContent.substring(textTraversalPointer, endPointer).trim();

          /**
           * @section Validación de ADN de Fragmento (SSOT)
           */
          if (fragmentText.length > 10) {
            documentChunks.push(KnowledgeSemanticChunkSchema.parse({
              id: crypto.randomUUID(),
              content: fragmentText,
              sourceName: documentTitle,
              tenantId: tenantOrganizationIdentifier,
              metadata: {
                category: semanticCategory,
                tags: semanticTags,
                chunkIndex: documentChunks.length,
                processedAt: new Date().toISOString(),
                characterCount: fragmentText.length
              }
            }));
          }

          // Desplazamiento del puntero restando el solapamiento para mantener el hilo semántico
          textTraversalPointer = endPointer - config.overlapSize;

          // Blindaje contra bucles infinitos por overlap excesivo
          if (textTraversalPointer <= 0 && documentChunks.length > 0) break;
          if (endPointer >= contentSize) break;
        }

        return documentChunks;
      }
    );
  }
}
