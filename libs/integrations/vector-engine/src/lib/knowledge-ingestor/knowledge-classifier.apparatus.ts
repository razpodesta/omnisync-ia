/** libs/integrations/vector-engine/src/lib/knowledge-ingestor/knowledge-classifier.apparatus.ts */

import {
  IArtificialIntelligenceDriver,
  OmnisyncContracts,
} from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import {
  KnowledgeClassificationResponseSchema,
  IKnowledgeClassificationResponse,
} from './schemas/knowledge-classifier.schema';

/**
 * @name KnowledgeClassifierApparatus
 * @description Nodo maestro de triaje semántico (Visión Ojos de Mosca V5.5).
 * Analiza el ADN técnico para determinar densidad, intención y categoría.
 * Sus directivas controlan el comportamiento subsiguiente del pipeline RAG.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Intent-Aware-Classification V5.5)
 */
export class KnowledgeClassifierApparatus {
  private static readonly apparatusName = 'KnowledgeClassifierApparatus';

  /**
   * @method classifyDocumentContent
   * @description Ejecuta una auditoría cognitiva del contenido. 
   * Extrae la firma semántica necesaria para la fragmentación inteligente.
   */
  public static async classifyDocumentContent(
    driver: IArtificialIntelligenceDriver,
    rawContent: string,
  ): Promise<IKnowledgeClassificationResponse> {
    const operationName = 'classifyDocumentContent';

    return await OmnisyncTelemetry.traceExecution(this.apparatusName, operationName, async () => {
      // 1. CONSTRUCCIÓN DE LA DIRECTIVA DE PERCEPCIÓN
      const instruction = this.buildCompoundVisionPrompt(rawContent);

      try {
        const rawResponse = await driver.generateResponse(instruction, {
          modelName: 'FLASH',
          temperature: 0.0, // Cero entropía para máxima fidelidad estructural
          maxTokens: 800,
        });

        // 2. EXTRACCIÓN QUIRÚRGICA DE ADN (Aislamiento de JSON)
        const jsonBlock = this.isolateSovereignJson(rawResponse);
        const parsedDNA = JSON.parse(jsonBlock);

        OmnisyncTelemetry.verbose(this.apparatusName, 'intent_deciphered', 
          `Intento: ${parsedDNA.instructionalIntent} | Densidad: ${parsedDNA.technicalDensityScore}`,
          { confidence: parsedDNA.confidenceScore }
        );

        /**
         * @section Sello de Integridad SSOT
         * Validamos contra el esquema expandido de la Fase 5.
         */
        return OmnisyncContracts.validate(
          KnowledgeClassificationResponseSchema,
          parsedDNA,
          this.apparatusName
        );

      } catch (criticalAuditError: unknown) {
        return await this.triggerSovereignFallback(rawContent, criticalAuditError);
      }
    });
  }

  /**
   * @method buildCompoundVisionPrompt
   * @private
   * @description Implementa la visión "Ojos de Mosca" en el prompt.
   */
  private static buildCompoundVisionPrompt(content: string): string {
    return `
      [ROLE]: ELITE NEURAL ARCHITECT.
      [TASK]: PERFORM 5-DIMENSIONAL SEMANTIC TRIAGE.
      
      [ANALYSIS_CHANNELS]:
      1. CATEGORY: Technical, Commercial, Administrative, or Legal.
      2. TAGS: 5 high-density technical keywords.
      3. INTENT: Is it Procedural (how-to), Informative (concepts), Regulatory (rules), or Specification (data)?
      4. DENSITY: 0.0 (Prose) to 1.0 (Code/Complex Manuals).
      5. LANGUAGE: [es, en, pt].

      [OUTPUT_RULES]:
      - Return ONLY a valid JSON object.
      - No explanatory text.
      - Technical Density MUST reflect the complexity of terms.

      [CONTENT_SNAPSHOT]:
      ${content.substring(0, 4500)}
    `.trim();
  }

  /**
   * @method isolateSovereignJson
   * @private
   */
  private static isolateSovereignJson(text: string): string {
    const match = /\{[\s\S]*\}/.exec(text);
    if (!match) throw new Error('OS-CORE-604: ADN Estructural no detectado en la señal.');
    return match[0].trim();
  }

  /**
   * @method triggerSovereignFallback
   * @private
   * @description Recuperación de emergencia. Calcula la densidad mediante 
   * heurística de entropía local si la IA colapsa.
   */
  private static async triggerSovereignFallback(
    content: string, 
    error: unknown
  ): Promise<IKnowledgeClassificationResponse> {
    await OmnisyncSentinel.report({
      errorCode: 'OS-INTEG-604',
      severity: 'MEDIUM',
      apparatus: this.apparatusName,
      operation: 'fallback_triage',
      message: 'Incapacidad de clasificación neural. Activando heurística de entropía.',
      context: { errorTrace: String(error) },
      isRecoverable: true
    });

    // Heurística de Ojos de Mosca: Estimar densidad por longitud de palabras
    const wordDensity = content.split(' ').length / content.length;

    return {
      category: 'TECHNICAL',
      tags: ['fallback', 'unclassified', 'system_audit', 'dna_raw', 'pending'],
      instructionalIntent: 'INFORMATIVE',
      technicalDensityScore: wordDensity > 0.15 ? 0.4 : 0.8, // Menos palabras = Más densidad técnica
      detectedLanguage: 'es',
      confidenceScore: 0.1
    };
  }
}