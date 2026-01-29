/** libs/integrations/vector-engine/src/lib/knowledge-ingestor/semantic-chunker.apparatus.ts */

import {
  IKnowledgeSemanticChunk,
  KnowledgeSemanticChunkSchema,
  KnowledgeOrganizationCategorySchema,
  TenantId,
} from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import {
  SemanticChunkerConfigurationSchema,
  ISemanticChunkerConfiguration,
} from './schemas/semantic-chunker.schema';
import { z } from 'zod';

/**
 * @name SemanticChunkerApparatus
 * @description Aparato de alta precisión encargado de la segmentación de ADN técnico.
 * Utiliza un algoritmo de ventana deslizante con jerarquía de límites semánticos
 * para garantizar que el contexto RAG sea coherente y procesable por el AI-Engine.
 *
 * @protocol OEDP-Level: Elite (Lint-Sanated & Optimized)
 */
export class SemanticChunkerApparatus {
  /**
   * @method executeSegmentation
   * @description Orquesta la fragmentación del contenido aplicando lógica de "Jerarquía de Ruptura".
   */
  public static executeSegmentation(
    rawTextualContent: string,
    tenantOrganizationIdentifier: TenantId,
    documentTitleIdentifier: string,
    semanticCategory: z.infer<typeof KnowledgeOrganizationCategorySchema>,
    semanticTags: string[],
    customConfiguration: Partial<ISemanticChunkerConfiguration> = {},
  ): IKnowledgeSemanticChunk[] {
    const apparatusName = 'SemanticChunkerApparatus';
    const operationName = 'executeSegmentation';

    if (!rawTextualContent || rawTextualContent.length < 10) {
      return [];
    }

    return OmnisyncTelemetry.traceExecutionSync(
      apparatusName,
      operationName,
      () => {
        const chunkerConfiguration =
          this.hydrateSovereignConfiguration(customConfiguration);

        const semanticChunksCollection: IKnowledgeSemanticChunk[] = [];
        const totalContentLength = rawTextualContent.length;
        let textTraversalPointer = 0;

        while (textTraversalPointer < totalContentLength) {
          const potentialEndPointer = Math.min(
            textTraversalPointer + chunkerConfiguration.maximumChunkSize,
            totalContentLength,
          );

          const finalEndPointer = this.calculateOptimalBoundary(
            rawTextualContent,
            textTraversalPointer,
            potentialEndPointer,
            chunkerConfiguration,
          );

          const fragmentText = rawTextualContent
            .substring(textTraversalPointer, finalEndPointer)
            .trim();

          if (fragmentText.length > 5) {
            semanticChunksCollection.push(
              KnowledgeSemanticChunkSchema.parse({
                id: crypto.randomUUID(),
                content: fragmentText,
                sourceName: documentTitleIdentifier,
                tenantId: tenantOrganizationIdentifier,
                metadata: {
                  category: semanticCategory,
                  tags: semanticTags,
                  chunkIndex: semanticChunksCollection.length,
                  isFirstChunk: textTraversalPointer === 0,
                  isLastChunk: finalEndPointer >= totalContentLength,
                  processedAt: new Date().toISOString(),
                  characterCount: fragmentText.length,
                },
              }),
            );
          }

          textTraversalPointer =
            finalEndPointer - chunkerConfiguration.overlapSize;

          if (
            textTraversalPointer >= totalContentLength ||
            finalEndPointer >= totalContentLength
          ) {
            break;
          }

          if (textTraversalPointer < 0) textTraversalPointer = 0;
        }

        OmnisyncTelemetry.verbose(
          apparatusName,
          'segmentation_result',
          `Generados ${semanticChunksCollection.length} fragmentos.`,
        );
        return semanticChunksCollection;
      },
    );
  }

  /**
   * @method calculateOptimalBoundary
   * @private
   */
  private static calculateOptimalBoundary(
    content: string,
    start: number,
    end: number,
    config: ISemanticChunkerConfiguration,
  ): number {
    if (end >= content.length) return content.length;
    if (!config.enableSmartBoundaryDetection) return end;

    const searchWindowStart = start + Math.floor(config.maximumChunkSize * 0.7);
    const windowContext = content.substring(searchWindowStart, end + 30);

    const paragraphIndex = windowContext.lastIndexOf('\n\n');
    if (paragraphIndex !== -1) return searchWindowStart + paragraphIndex + 2;

    /**
     * @section Sanación de RegEx (Resolución no-useless-escape)
     * Erradicamos los backslashes innecesarios dentro de la clase de caracteres.
     */
    const sentenceMatch = /[.!?]\s/.exec(
      windowContext.split('').reverse().join(''),
    );
    if (sentenceMatch) {
      const reverseIndex = sentenceMatch.index;
      return searchWindowStart + (windowContext.length - reverseIndex);
    }

    const lastSpace = windowContext.lastIndexOf(' ');
    if (lastSpace !== -1) return searchWindowStart + lastSpace;

    return end;
  }

  /**
   * @method hydrateSovereignConfiguration
   * @private
   */
  private static hydrateSovereignConfiguration(
    custom: Partial<ISemanticChunkerConfiguration>,
  ): ISemanticChunkerConfiguration {
    const validated = SemanticChunkerConfigurationSchema.parse(custom);
    const safeOverlap = Math.min(
      validated.overlapSize,
      Math.floor(validated.maximumChunkSize / 2),
    );

    return {
      ...validated,
      overlapSize: safeOverlap,
    };
  }
}
