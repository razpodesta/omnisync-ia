/** libs/integrations/vector-engine/src/lib/knowledge-ingestor/semantic-chunker.apparatus.ts */

import * as crypto from 'node:crypto';
import {
  IKnowledgeSemanticChunk,
  KnowledgeSemanticChunkSchema,
  KnowledgeOrganizationCategorySchema,
  TenantId,
  OmnisyncContracts,
} from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { 
  SemanticChunkerConfigurationSchema, 
  ISemanticChunkerConfiguration 
} from './schemas/semantic-chunker.schema';
import { IKnowledgeClassificationResponse } from './schemas/knowledge-classifier.schema';

/**
 * @name SemanticChunkerApparatus
 * @description Nodo maestro de fragmentación elástica (Visión Ojos de Mosca V5.5).
 * Transmuta el ADN técnico en fragmentos vectoriales cuya escala física es una 
 * función de su densidad semántica e intención instruccional.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Adaptive-Semantic-Segmentation V5.5)
 */
export class SemanticChunkerApparatus {
  private static readonly apparatusName = 'SemanticChunkerApparatus';

  /**
   * @method executeSegmentation
   * @description Orquesta la metamorfosis del texto en Smart Chunks. 
   * Calcula parámetros adaptativos basados en el triaje del KnowledgeClassifier.
   */
  public static executeSegmentation(
    rawText: string,
    tenantId: TenantId,
    documentTitle: string,
    classifierResult: IKnowledgeClassificationResponse,
    customConfig: Partial<ISemanticChunkerConfiguration> = {}
  ): IKnowledgeSemanticChunk[] {
    const operationName = 'executeSegmentation';

    return OmnisyncTelemetry.traceExecutionSync(this.apparatusName, operationName, () => {
      // 1. HIDRATACIÓN DE CONFIGURACIÓN ADAPTATIVA
      const config = OmnisyncContracts.validate(SemanticChunkerConfigurationSchema, customConfig, this.apparatusName);
      const { adaptiveChunkSize, adaptiveOverlap } = this.calculateAdaptiveBounds(config, classifierResult);

      const chunks: IKnowledgeSemanticChunk[] = [];
      const totalLength = rawText.length;
      let pointer = 0;

      OmnisyncTelemetry.verbose(this.apparatusName, 'adaptive_ignition', 
        `Iniciando segmentación: Size ${adaptiveChunkSize} | Overlap ${adaptiveOverlap}`,
        { density: classifierResult.technicalDensityScore, intent: classifierResult.instructionalIntent }
      );

      // 2. BUCLE DE SEGMENTACIÓN QUIRÚRGICA
      while (pointer < totalLength) {
        let end = Math.min(pointer + adaptiveChunkSize, totalLength);

        // Ajuste de fronteras basado en el "Ojo de Mosca" (Fly-Eye Boundary Correction)
        if (config.enableSmartBoundaryDetection && end < totalLength) {
          end = this.findOptimalBoundary(rawText, pointer, end, classifierResult.instructionalIntent);
        }

        const fragment = rawText.substring(pointer, end).trim();

        if (fragment.length >= config.enforceMinimumChunkLength) {
          chunks.push(this.sealChunk(
            fragment, 
            tenantId, 
            documentTitle, 
            chunks.length, 
            classifierResult,
            pointer === 0,
            end === totalLength
          ));
        }

        // Desplazamiento de ventana considerando el solapamiento elástico
        pointer = end - adaptiveOverlap;
        
        if (pointer >= totalLength || (end === totalLength)) break;
      }

      return chunks;
    });
  }

  /**
   * @method calculateAdaptiveBounds
   * @private
   * @description Algoritmo de escalado elástico: 
   * Alta densidad (1.0) -> Reducción de tamaño del chunk.
   * Baja densidad (0.0) -> Expansión de tamaño del chunk.
   */
  private static calculateAdaptiveBounds(
    config: ISemanticChunkerConfiguration, 
    meta: IKnowledgeClassificationResponse
  ) {
    // Escala inversa: +densidad = -tamaño
    const sizeMultiplier = 1.5 - (meta.technicalDensityScore * config.scalingSensitivity);
    // Escala directa: +densidad = +solapamiento
    const overlapMultiplier = 1.0 + (meta.technicalDensityScore * 0.5);

    return {
      adaptiveChunkSize: Math.floor(config.baseChunkSize * sizeMultiplier),
      adaptiveOverlap: Math.floor(config.baseOverlapSize * overlapMultiplier)
    };
  }

  /**
   * @method findOptimalBoundary
   * @private
   * @description Especialista en detección de límites según la intención del autor.
   */
  private static findOptimalBoundary(
    text: string, 
    start: number, 
    end: number, 
    intent: string
  ): number {
    const lookbackLimit = Math.floor((end - start) * 0.3); // 30% de ventana de búsqueda
    const window = text.substring(end - lookbackLimit, end + 50);

    // Prioridad por Intento
    if (intent === 'PROCEDURAL') {
      const stepBreak = window.lastIndexOf('\n'); // En manuales de pasos, el salto de línea es sagrado
      if (stepBreak > 0) return (end - lookbackLimit) + stepBreak;
    }

    if (intent === 'REGULATORY') {
      const paragraphBreak = window.lastIndexOf('\n\n');
      if (paragraphBreak > 0) return (end - lookbackLimit) + paragraphBreak + 2;
    }

    // Default: Límites gramaticales estándar (Punto, Signos)
    const punctuationMatch = /[.!?]\s/.exec(window.split('').reverse().join(''));
    if (punctuationMatch) {
      return end - punctuationMatch.index;
    }

    const spaceBreak = window.lastIndexOf(' ');
    return spaceBreak > 0 ? (end - lookbackLimit) + spaceBreak : end;
  }

  /**
   * @method sealChunk
   * @private
   */
  private static sealChunk(
    content: string, 
    tenantId: TenantId, 
    source: string, 
    index: number,
    classifier: IKnowledgeClassificationResponse,
    isFirst: boolean,
    isLast: boolean
  ): IKnowledgeSemanticChunk {
    const chunkId = crypto.randomUUID();
    
    return KnowledgeSemanticChunkSchema.parse({
      id: chunkId,
      content,
      sourceName: source,
      tenantId,
      metadata: {
        category: classifier.category,
        tags: classifier.tags,
        instructionalIntent: classifier.instructionalIntent,
        technicalDensity: classifier.technicalDensityScore,
        language: classifier.detectedLanguage,
        chunkIndex: index,
        isFirstChunk: isFirst,
        isLastChunk: isLast,
        processedAt: new Date().toISOString(),
        forensicHash: crypto.createHash('md5').update(content).digest('hex')
      }
    });
  }
}