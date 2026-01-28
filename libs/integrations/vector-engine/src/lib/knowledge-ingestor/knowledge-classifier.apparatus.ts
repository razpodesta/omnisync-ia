/** libs/integrations/vector-engine/src/lib/knowledge-ingestor/knowledge-classifier.apparatus.ts */

import {
  IArtificialIntelligenceDriver,
  OmnisyncContracts
} from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import {
  KnowledgeClassificationResponseSchema,
  IKnowledgeClassificationResponse
} from './schemas/knowledge-classifier.schema';

/**
 * @name KnowledgeClassifierApparatus
 * @description Aparato de cognición encargado de la taxonomía automatizada de documentos.
 * Transforma contenido técnico bruto en metadatos clasificados utilizando inferencia
 * de baja latencia para optimizar el ciclo de vida del ADN vectorial.
 *
 * @protocol OEDP-Level: Elite (Atomic Cognitive Function)
 */
export class KnowledgeClassifierApparatus {

  /**
   * @method classifyDocumentContent
   * @description Orquesta el proceso de análisis semántico mediante IA y valida el contrato resultante.
   *
   * @param {IArtificialIntelligenceDriver} artificialIntelligenceDriver - Driver del LLM (ej. Gemini Flash).
   * @param {string} textualContentToAnalyze - El bloque de texto a categorizar.
   * @returns {Promise<IKnowledgeClassificationResponse>} Resultado validado por el esquema granular.
   */
  public static async classifyDocumentContent(
    artificialIntelligenceDriver: IArtificialIntelligenceDriver,
    textualContentToAnalyze: string
  ): Promise<IKnowledgeClassificationResponse> {
    const apparatusName = 'KnowledgeClassifierApparatus';
    const operationName = 'classifyDocumentContent';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        const classificationInstructionPrompt = this.buildSovereignClassificationPrompt(textualContentToAnalyze);

        try {
          /**
           * @section Ejecución de Inferencia
           * Se utiliza una configuración de alta temperatura para permitir
           * discernimiento semántico, pero limitada en tokens para eficiencia.
           */
          const rawInferenceResponse = await artificialIntelligenceDriver.generateResponse(
            classificationInstructionPrompt,
            {
              modelName: 'FLASH',
              temperature: 0.2,
              maxTokens: 500
            }
          );

          /**
           * @section Limpieza de Residuos Cognitivos
           * Erradicamos cualquier texto, preámbulo o Markdown inyectado por el LLM.
           */
          const sanitizedJsonPayload = this.extractPureJsonContent(rawInferenceResponse);

          /**
           * @section Validación de Soberanía del Dato (SSOT)
           * Separación física: el esquema se importa de su propio archivo granular.
           */
          return OmnisyncContracts.validate(
            KnowledgeClassificationResponseSchema,
            JSON.parse(sanitizedJsonPayload),
            apparatusName
          );

        } catch (criticalClassificationError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-604',
            severity: 'MEDIUM',
            apparatus: apparatusName,
            operation: 'classify',
            message: 'integrations.vector_engine.classification_failed',
            context: { error: String(criticalClassificationError) },
            isRecoverable: true
          });

          // Fallback institucional para mantener la continuidad del pipeline
          return {
            category: 'TECHNICAL',
            tags: ['general', 'system', 'unclassified', 'data', 'neural'],
            confidenceScore: 0
          };
        }
      }
    );
  }

  /**
   * @method buildSovereignClassificationPrompt
   * @private
   */
  private static buildSovereignClassificationPrompt(content: string): string {
    return `
      ACT AS AN ELITE DATA ARCHITECT.
      OBJECTIVE: Analyze technical content and classify it for a vector database.

      OUTPUT RULES:
      1. Respond ONLY with a valid JSON object.
      2. No explanations, no markdown blocks, no preambles.
      3. Categories allowed: [TECHNICAL, COMMERCIAL, ADMINISTRATIVE, LEGAL].
      4. Generate exactly 5 technical tags.

      REQUIRED SCHEMA:
      {
        "category": "string",
        "tags": ["string", "string", "string", "string", "string"],
        "confidenceScore": number (0.0 to 1.0)
      }

      CONTENT TO PROCESS:
      ${content.substring(0, 4000)}
    `.trim();
  }

  /**
   * @method extractPureJsonContent
   * @private
   * @description Implementa un algoritmo de recorte quirúrgico para aislar el objeto JSON
   * de posibles residuos textuales del modelo generativo.
   */
  private static extractPureJsonContent(rawText: string): string {
    const firstBraceIdentifier = rawText.indexOf('{');
    const lastBraceIdentifier = rawText.lastIndexOf('}');

    if (firstBraceIdentifier === -1 || lastBraceIdentifier === -1) {
      throw new Error('OS-CORE-JSON: No structural JSON found in AI response.');
    }

    return rawText.substring(firstBraceIdentifier, lastBraceIdentifier + 1);
  }
}
