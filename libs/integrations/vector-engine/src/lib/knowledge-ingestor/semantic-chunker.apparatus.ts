/** libs/integrations/vector-engine/src/lib/knowledge-ingestor/semantic-chunker.apparatus.ts */

import {
  IKnowledgeSemanticChunk,
  KnowledgeSemanticChunkSchema,
  KnowledgeOrganizationCategorySchema,
  TenantId
} from '@omnisync/core-contracts';
import { z } from 'zod';

/**
 * @name SemanticChunkerApparatus
 * @description Aparato encargado de la fragmentación de texto mediante algoritmos
 * de ventana deslizante (Sliding Window). Garantiza que los fragmentos inyectados
 * en la base de datos vectorial preserven el contexto semántico necesario para
 * una recuperación RAG de alta precisión.
 *
 * @protocol OEDP-Level: Elite
 */
export class SemanticChunkerApparatus {
  /**
   * @section Parámetros de Fragmentación de Élite
   * Optimizados para modelos Gemini 1.5 y preservación de coherencia.
   */
  private static readonly CHUNK_MAXIMUM_SIZE = 1000;
  private static readonly OVERLAP_SIZE = 200;

  /**
   * @method executeSegmentation
   * @description Divide un flujo de texto masivo en fragmentos atómicos validados.
   *
   * @param {string} textualContent - Contenido técnico bruto.
   * @param {TenantId} tenantOrganizationIdentifier - ID de soberanía del cliente.
   * @param {string} documentTitle - Referencia al manual original.
   * @param {z.infer<typeof KnowledgeOrganizationCategorySchema>} semanticCategory - Clasificación técnica.
   * @param {string[]} semanticTags - Etiquetas de búsqueda.
   * @returns {IKnowledgeSemanticChunk[]} Lista de fragmentos listos para vectorización.
   */
  public static executeSegmentation(
    textualContent: string,
    tenantOrganizationIdentifier: TenantId,
    documentTitle: string,
    semanticCategory: z.infer<typeof KnowledgeOrganizationCategorySchema>,
    semanticTags: string[]
  ): IKnowledgeSemanticChunk[] {
    const documentChunks: IKnowledgeSemanticChunk[] = [];

    // NIVELACIÓN: Inferencia trivial de tipo 'number' removida
    let currentPointerPosition = 0;

    while (currentPointerPosition < textualContent.length) {
      const fragmentText = textualContent.substring(
        currentPointerPosition,
        currentPointerPosition + this.CHUNK_MAXIMUM_SIZE
      );

      /**
       * @section Validación de ADN (SSOT)
       * Cada fragmento se valida contra el esquema global antes de ser procesado.
       */
      documentChunks.push(KnowledgeSemanticChunkSchema.parse({
        id: crypto.randomUUID(),
        content: fragmentText.trim(),
        sourceName: documentTitle,
        tenantId: tenantOrganizationIdentifier,
        metadata: {
          category: semanticCategory,
          tags: semanticTags,
          chunkIndex: documentChunks.length,
          processedAt: new Date().toISOString()
        }
      }));

      // Desplazamiento de ventana con solapamiento semántico
      currentPointerPosition += (this.CHUNK_MAXIMUM_SIZE - this.OVERLAP_SIZE);
    }

    return documentChunks;
  }
}
