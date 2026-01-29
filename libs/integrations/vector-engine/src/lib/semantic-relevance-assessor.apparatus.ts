/** libs/integrations/vector-engine/src/lib/semantic-relevance-assessor.apparatus.ts */

import {
  IKnowledgeSemanticChunk,
  OmnisyncContracts,
} from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import {
  KnowledgeRelevanceAssessmentSchema,
  IKnowledgeRelevanceAssessment,
} from './schemas/semantic-relevance.schema';

/**
 * @name SemanticRelevanceAssessor
 * @description Aparato especializado en la auditoría y filtrado de fragmentos semánticos.
 * Aplica algoritmos de limpieza y cálculo de pulso de relevancia para garantizar
 * que el motor de inferencia reciba únicamente ADN técnico de alta fidelidad.
 *
 * @protocol OEDP-Level: Elite (Mathematical Optimization)
 */
export class SemanticRelevanceAssessor {
  /**
   * @method evaluateContextRelevance
   * @description Realiza una evaluación quirúrgica del lote de fragmentos en una sola pasada.
   *
   * @param {IKnowledgeSemanticChunk[]} rawSemanticKnowledgeChunks - Fragmentos crudos de Qdrant.
   * @param {number} similarityScoreThreshold - Umbral mínimo de aceptación (Default: 0.70).
   * @returns {IKnowledgeRelevanceAssessment} Auditoría de calidad validada por SSOT.
   */
  public static evaluateContextRelevance(
    rawSemanticKnowledgeChunks: IKnowledgeSemanticChunk[],
    similarityScoreThreshold: number,
  ): IKnowledgeRelevanceAssessment {
    const apparatusName = 'SemanticRelevanceAssessor';

    return OmnisyncTelemetry.traceExecutionSync(
      apparatusName,
      'evaluateContextRelevance',
      () => {
        const totalChunksCaptured = rawSemanticKnowledgeChunks.length;

        // Inicialización de acumuladores para optimización de Single-Pass
        const filteredChunks: IKnowledgeSemanticChunk[] = [];
        let scoreSummation = 0;
        let hasHighConfidenceAnchor = false;

        /**
         * @section Algoritmo de Flujo Único (Single-Pass)
         * Reducimos la complejidad computacional de O(2n) a O(n).
         */
        for (const currentChunk of rawSemanticKnowledgeChunks) {
          const individualScore = this.extractTechnicalScore(currentChunk);

          if (individualScore >= similarityScoreThreshold) {
            filteredChunks.push(currentChunk);
            scoreSummation += individualScore;

            if (individualScore >= 0.9) {
              hasHighConfidenceAnchor = true;
            }
          }
        }

        const validChunksCount = filteredChunks.length;
        const averageScore =
          validChunksCount > 0 ? scoreSummation / validChunksCount : 0;
        const contextReliabilityPulse =
          totalChunksCaptured > 0 ? validChunksCount / totalChunksCaptured : 0;

        /**
         * @section Validación de Soberanía del Resultado
         */
        return OmnisyncContracts.validate(
          KnowledgeRelevanceAssessmentSchema,
          {
            filteredChunks,
            averageScore,
            contextReliabilityPulse,
            hasHighConfidenceAnchor,
          },
          apparatusName,
        );
      },
    );
  }

  /**
   * @method extractTechnicalScore
   * @private
   * @description Extrae de forma segura el puntaje de relevancia del mapa de metadatos.
   */
  private static extractTechnicalScore(chunk: IKnowledgeSemanticChunk): number {
    const metadataMap = chunk.metadata as Record<string, unknown>;
    const scoreValue = metadataMap['score'];

    /**
     * NIVELACIÓN: Type Guard para asegurar que el dato sea numérico
     * y no contamine el cálculo del promedio.
     */
    return typeof scoreValue === 'number' ? scoreValue : 0;
  }
}
