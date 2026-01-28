/** libs/integrations/ai-engine/src/lib/neural-embedding.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { IArtificialIntelligenceDriver } from '@omnisync/core-contracts';

/**
 * @name NeuralEmbeddingApparatus
 * @description Aparato especializado en la generación de firmas vectoriales (embeddings).
 *
 * @protocol OEDP-Level: Elite (Linter-Corrected)
 */
export class NeuralEmbeddingApparatus {
  public static async generateVectorEmbeddings(
    artificialIntelligenceDriver: IArtificialIntelligenceDriver,
    textualContentToEmbed: string
  ): Promise<number[]> {
    // Corrección: Eliminación de anotación redundante :string
    const apparatusName = 'NeuralEmbeddingApparatus';
    const operationName = `embedding:${artificialIntelligenceDriver.providerName}`;

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        try {
          const capableDriver = artificialIntelligenceDriver as IArtificialIntelligenceDriver & {
            calculateVectorEmbeddings(content: string): Promise<number[]>;
          };

          if (typeof capableDriver.calculateVectorEmbeddings !== 'function') {
            throw new Error(`The driver [${artificialIntelligenceDriver.providerName}] does not support vector embeddings.`);
          }

          return await capableDriver.calculateVectorEmbeddings(textualContentToEmbed);
        } catch (embeddingError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-602',
            severity: 'CRITICAL',
            apparatus: apparatusName,
            operation: 'generateVectorEmbeddings',
            message: 'integrations.ai_engine.embedding_generation_failed',
            context: { error: String(embeddingError) },
            isRecoverable: false,
          });
          throw embeddingError;
        }
      }
    );
  }
}
