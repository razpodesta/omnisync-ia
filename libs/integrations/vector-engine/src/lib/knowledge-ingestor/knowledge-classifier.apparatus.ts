/** libs/integrations/vector-engine/src/lib/knowledge-ingestor/knowledge-classifier.apparatus.ts */

import {
  IArtificialIntelligenceDriver,
  KnowledgeOrganizationCategorySchema,
  OmnisyncContracts
} from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { z } from 'zod';

/**
 * @name ClassificationResponseSchema
 * @description Esquema de integridad para la respuesta de categorización.
 */
const ClassificationResponseSchema = z.object({
  category: KnowledgeOrganizationCategorySchema,
  tags: z.array(z.string()).length(5),
  confidenceScore: z.number().min(0).max(1)
}).readonly();

type IClassificationResponse = z.infer<typeof ClassificationResponseSchema>;

/**
 * @name KnowledgeClassifierApparatus
 * @description Aparato de cognición encargado de la taxonomía automatizada.
 * Transforma contenido técnico bruto en metadatos clasificados para optimizar el RAG.
 *
 * @protocol OEDP-Level: Elite (Cognitive Sanitization)
 */
export class KnowledgeClassifierApparatus {

  /**
   * @method classifyDocumentContent
   * @description Orquesta el proceso de análisis semántico y validación de contrato.
   */
  public static async classifyDocumentContent(
    artificialIntelligenceDriver: IArtificialIntelligenceDriver,
    textualContent: string
  ): Promise<IClassificationResponse> {
    return await OmnisyncTelemetry.traceExecution(
      'KnowledgeClassifierApparatus',
      'classifyDocumentContent',
      async () => {
        const instructionPrompt = this.buildSovereignClassificationPrompt(textualContent);

        try {
          /**
           * @section Inferencia de Ejecución
           * Se utiliza la configuración nivelada para Gemini 3 Flash.
           */
          const rawResponse = await artificialIntelligenceDriver.generateResponse(
            instructionPrompt,
            {
              modelName: 'FLASH',
              temperature: 0.1,
              maxTokens: 600
            }
          );

          const sanitizedJson = this.extractStructuralJson(rawResponse);

          return OmnisyncContracts.validate(
            ClassificationResponseSchema,
            JSON.parse(sanitizedJson),
            'KnowledgeClassifierApparatus'
          );

        } catch (criticalError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-604',
            severity: 'MEDIUM',
            apparatus: 'KnowledgeClassifierApparatus',
            operation: 'classify',
            message: 'integrations.vector_engine.errors.classification_failed',
            context: { error: String(criticalError) }
          });

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
      ACTÚA COMO UN ARQUITECTO DE DATOS DE ELITE.
      OBJETIVO: Analizar el fragmento de conocimiento y clasificarlo.

      REGLAS DE SALIDA:
      1. Responde ÚNICAMENTE con un objeto JSON válido.
      2. No incluyas explicaciones, preámbulos ni Markdown.
      3. Categorías permitidas: [TECHNICAL, COMMERCIAL, ADMINISTRATIVE, LEGAL].
      4. Genera exactamente 5 tags técnicos.

      ESQUEMA REQUERIDO:
      {
        "category": "string",
        "tags": ["string", "string", "string", "string", "string"],
        "confidenceScore": number (0.0 a 1.0)
      }

      CONTENIDO A PROCESAR:
      ${content.substring(0, 3000)}
    `.trim();
  }

  /**
   * @method extractStructuralJson
   * @private
   * @description Implementa un algoritmo de limpieza de residuos del LLM para
   * garantizar que solo el bloque JSON sea procesado por el parser.
   */
  private static extractStructuralJson(rawAiResponse: string): string {
    const firstBraceIndex = rawAiResponse.indexOf('{');
    const lastBraceIndex = rawAiResponse.lastIndexOf('}');

    if (firstBraceIndex === -1 || lastBraceIndex === -1) {
      throw new Error('No structural JSON found in AI response');
    }

    return rawAiResponse.substring(firstBraceIndex, lastBraceIndex + 1);
  }
}
