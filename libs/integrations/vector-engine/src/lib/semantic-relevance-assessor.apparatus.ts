/** libs/integrations/vector-engine/src/lib/semantic-relevance-assessor.apparatus.ts */

import { IKnowledgeSemanticChunk } from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @name SemanticRelevanceAssessor
 * @description Aparato especializado en la evaluación de calidad de fragmentos semánticos.
 * Responsable de aplicar filtros de umbral y calcular el pulso de relevancia del contexto.
 * 
 * @protocol OEDP-Level: Elite (Mathematical Atomization)
 */
export class SemanticRelevanceAssessor {

  /**
   * @method filterAndRankByConfidence
   * @description Filtra fragmentos que no cumplen con el umbral de similitud y calcula el score promedio.
   */
  public static assess(
    rawChunks: IKnowledgeSemanticChunk[],
    similarityThreshold: number
  ): { readonly filteredChunks: IKnowledgeSemanticChunk[]; readonly averageScore: number } {
    return OmnisyncTelemetry.traceExecutionSync(
      'SemanticRelevanceAssessor',
      'assess',
      () => {
        const filteredChunks = rawChunks.filter((chunk) => {
          const score = this.extractScoreFromMetadata(chunk);
          return score >= similarityThreshold;
        });

        const averageScore = filteredChunks.length > 0
          ? filteredChunks.reduce((acc, curr) => acc + this.extractScoreFromMetadata(curr), 0) / filteredChunks.length
          : 0;

        return { filteredChunks, averageScore };
      }
    );
  }

  /**
   * @method extractScoreFromMetadata
   * @private
   * @description Extrae de forma segura el puntaje de similitud inyectado por el driver.
   */
  private static extractScoreFromMetadata(chunk: IKnowledgeSemanticChunk): number {
    const metadata = chunk.metadata as Record<string, unknown>;
    const score = metadata['score'];
    return typeof score === 'number' ? score : 0;
  }
}