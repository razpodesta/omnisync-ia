/** libs/integrations/ai-engine/src/lib/neural-embedding.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { IArtificialIntelligenceDriver } from '@omnisync/core-contracts';

/**
 * @interface IEmbeddingCapableDriver
 * @description Interfaz extendida para drivers que poseen el motor de vectorización activo.
 */
interface IEmbeddingCapableDriver extends IArtificialIntelligenceDriver {
  calculateVectorEmbeddings(textualContent: string): Promise<number[]>;
}

/**
 * @name NeuralEmbeddingApparatus
 * @description Aparato de élite especializado en la generación de firmas vectoriales (embeddings).
 * Transforma el ADN textual en coordenadas matemáticas para la memoria semántica (RAG).
 *
 * @protocol OEDP-Level: Elite (Batch-Ready & Type-Safe)
 */
export class NeuralEmbeddingApparatus {
  /**
   * @method generateVectorEmbeddings
   * @description Genera la huella digital matemática de un bloque de texto.
   * Orquesta la validación de capacidad del driver y la resiliencia de la operación.
   *
   * @param {IArtificialIntelligenceDriver} driver - Implementación técnica activa.
   * @param {string} textualContentToEmbed - El contenido semántico a vectorizar.
   * @returns {Promise<number[]>} Firma vectorial (array de flotantes).
   */
  public static async generateVectorEmbeddings(
    driver: IArtificialIntelligenceDriver,
    textualContentToEmbed: string,
  ): Promise<number[]> {
    const apparatusName = 'NeuralEmbeddingApparatus';
    const operationName = `embedding:${driver.providerName}`;

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        /**
         * @section 1. Validación de Soberanía Técnica
         * Verificamos si el driver inyectado tiene el motor de vectores habilitado.
         */
        if (!this.isDriverEmbeddingCapable(driver)) {
          const capabilityError = `El driver [${driver.providerName}] no posee capacidades de vectorización semántica.`;

          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-604',
            severity: 'CRITICAL',
            apparatus: apparatusName,
            operation: 'capability_check',
            message: capabilityError,
            isRecoverable: false,
          });

          throw new Error(capabilityError);
        }

        try {
          /**
           * @section 2. Ejecución con Blindaje de Resiliencia
           * El Sentinel gestiona el backoff si el proveedor (Gemini) reporta Rate Limits.
           */
          const vectorCoordinates =
            await OmnisyncSentinel.executeWithResilience(
              () => driver.calculateVectorEmbeddings(textualContentToEmbed),
              apparatusName,
              operationName,
            );

          OmnisyncTelemetry.verbose(
            apparatusName,
            'generation_success',
            `Vector generado: ${vectorCoordinates.length} dimensiones.`,
          );

          return vectorCoordinates;
        } catch (criticalEmbeddingError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-602',
            severity: 'HIGH',
            apparatus: apparatusName,
            operation: operationName,
            message: 'integrations.ai_engine.embedding_generation_failed',
            context: {
              error: String(criticalEmbeddingError),
              contentPreview: textualContentToEmbed.substring(0, 50),
            },
            isRecoverable: true,
          });

          throw criticalEmbeddingError;
        }
      },
    );
  }

  /**
   * @method generateBatchEmbeddings
   * @description Procesa una colección de fragmentos optimizando el flujo de red.
   * Preparado para la ingesta masiva de manuales técnicos (V3.0).
   */
  public static async generateBatchEmbeddings(
    driver: IArtificialIntelligenceDriver,
    textualFragmentsCollection: string[],
  ): Promise<number[][]> {
    const apparatusName = 'NeuralEmbeddingApparatus';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      'generateBatchEmbeddings',
      async () => {
        // En V3.1 se implementará el procesamiento concurrente por chunks de 5
        const results: number[][] = [];
        for (const fragment of textualFragmentsCollection) {
          const vector = await this.generateVectorEmbeddings(driver, fragment);
          results.push(vector);
        }
        return results;
      },
    );
  }

  /**
   * @method isDriverEmbeddingCapable
   * @private
   * @description Type Guard de alta fidelidad para asegurar integridad de tipos en tiempo de ejecución.
   */
  private static isDriverEmbeddingCapable(
    driver: IArtificialIntelligenceDriver,
  ): driver is IEmbeddingCapableDriver {
    return (
      'calculateVectorEmbeddings' in driver &&
      typeof (driver as IEmbeddingCapableDriver).calculateVectorEmbeddings ===
        'function'
    );
  }
}
