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
 * @description Aparato de élite encargado de la taxonomía automatizada de ADN técnico.
 * Actúa como el "Bibliotecario Neural" que analiza, categoriza y etiqueta el conocimiento
 * antes de su fragmentación y vectorización.
 *
 * @protocol OEDP-Level: Elite (Resilient Cognitive Extraction)
 */
export class KnowledgeClassifierApparatus {
  /**
   * @method classifyDocumentContent
   * @description Orquesta el proceso de triaje semántico. Transforma texto amorfo
   * en metadatos estructurados validados por contrato SSOT.
   *
   * @param {IArtificialIntelligenceDriver} driver - Driver de IA (Se recomienda Tier: FLASH).
   * @param {string} rawContent - El bloque de texto técnico a inspeccionar.
   * @returns {Promise<IKnowledgeClassificationResponse>} Resultado validado y categorizado.
   */
  public static async classifyDocumentContent(
    driver: IArtificialIntelligenceDriver,
    rawContent: string,
  ): Promise<IKnowledgeClassificationResponse> {
    const apparatusName = 'KnowledgeClassifierApparatus';
    const operationName = 'classifyDocumentContent';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        /**
         * @section Fase 1: Construcción de Directiva Soberana
         */
        const cognitiveInstruction =
          this.buildSovereignTaxonomyPrompt(rawContent);

        try {
          const rawInferenceResult = await driver.generateResponse(
            cognitiveInstruction,
            {
              modelName: 'FLASH',
              temperature: 0.1, // Baja temperatura para máxima precisión estructural
              maxTokens: 600,
            },
          );

          /**
           * @section Fase 2: Extracción y Saneamiento
           * Erradicamos el ruido visual y explicativo del LLM mediante RegEx.
           */
          const cleanedJsonString =
            this.isolateSovereignJsonObject(rawInferenceResult);
          const parsedResult = JSON.parse(cleanedJsonString);

          // Registro de fidelidad para auditoría
          OmnisyncTelemetry.verbose(
            apparatusName,
            'classification_audit',
            `Confianza: ${parsedResult.confidenceScore}`,
          );

          /**
           * @section Fase 3: Validación de Contrato SSOT
           */
          return OmnisyncContracts.validate(
            KnowledgeClassificationResponseSchema,
            parsedResult,
            apparatusName,
          );
        } catch (criticalClassificationError: unknown) {
          return await this.handleClassificationAnomalies(
            apparatusName,
            operationName,
            criticalClassificationError,
          );
        }
      },
    );
  }

  /**
   * @method buildSovereignTaxonomyPrompt
   * @private
   * @description Ensambla una directiva de ingeniería de prompts de grado arquitectónico.
   */
  private static buildSovereignTaxonomyPrompt(content: string): string {
    return `
      [SYSTEM_ROLE]: ELITE NEURAL LIBRARIAN.
      [OBJECTIVE]: Perform semantic triage on technical content for a high-performance vector database.

      [RULES]:
      1. Analyze the context and language.
      2. Categorize into ONLY ONE: [TECHNICAL, COMMERCIAL, ADMINISTRATIVE, LEGAL].
      3. Generate exactly 5 technical keywords (tags).
      4. Output MUST BE a single valid JSON object. No preambles.

      [SCHEMA_DEFINITION]:
      {
        "category": "TECHNICAL" | "COMMERCIAL" | "ADMINISTRATIVE" | "LEGAL",
        "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
        "confidenceScore": float (0.0 to 1.0)
      }

      [CONTENT_TO_TRIAGE]:
      ${content.substring(0, 5000)}
    `.trim();
  }

  /**
   * @method isolateSovereignJsonObject
   * @private
   * @description Algoritmo de aislamiento mediante RegEx para extraer JSON puro
   * ignorando bloques de markdown o texto explicativo (Resiliencia 2026).
   */
  private static isolateSovereignJsonObject(rawText: string): string {
    const jsonRegexPattern = /\{[\s\S]*\}/;
    const regexMatch = jsonRegexPattern.exec(rawText);

    if (!regexMatch) {
      throw new Error(
        'OS-CORE-604: No structural DNA detected in AI response.',
      );
    }

    return regexMatch[0].trim();
  }

  /**
   * @method handleClassificationAnomalies
   * @private
   */
  private static async handleClassificationAnomalies(
    apparatus: string,
    operation: string,
    error: unknown,
  ): Promise<IKnowledgeClassificationResponse> {
    await OmnisyncSentinel.report({
      errorCode: 'OS-INTEG-604',
      severity: 'MEDIUM',
      apparatus,
      operation,
      message: 'integrations.vector_engine.classification_failed',
      context: { originalError: String(error) },
      isRecoverable: true,
    });

    /**
     * @section Protocolo de Fallback
     * Retorna una clasificación neutra de "Seguridad" para no detener el pipeline de ingesta.
     */
    return {
      category: 'TECHNICAL',
      tags: [
        'system_fallback',
        'unclassified',
        'pending_review',
        'neural',
        'triage_fail',
      ],
      confidenceScore: 0,
    };
  }
}
