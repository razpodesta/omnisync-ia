/** libs/integrations/ai-engine/src/lib/ai-engine.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import {
  IArtificialIntelligenceDriver,
  IArtificialIntelligenceModelConfiguration,
  IAIResponse,
  AIResponseSchema
} from '@omnisync/core-contracts';

/**
 * @name OmnisyncArtificialIntelligenceEngine
 * @description Orquestador neural de alta disponibilidad. Actúa como el puente
 * agnóstico entre los requerimientos de negocio y los LLMs.
 *
 * @protocol OEDP-Level: Elite (Contract-Aligned)
 */
export class OmnisyncArtificialIntelligenceEngine {

  /**
   * @method executeGenerativeInference
   * @description Ejecuta un flujo de razonamiento IA con blindaje de resiliencia.
   */
  public static async executeGenerativeInference(
    driver: IArtificialIntelligenceDriver,
    inferencePrompt: string,
    configuration: IArtificialIntelligenceModelConfiguration,
    conversationId: string
  ): Promise<IAIResponse> {
    return await OmnisyncTelemetry.traceExecution(
      'OmnisyncArtificialIntelligenceEngine',
      `inference:${driver.providerName}`,
      async () => {
        try {
          /**
           * Ejecución mediante Sentinel para gestionar automáticamente
           * reintentos exponenciales en caso de cuotas excedidas.
           */
          const inferenceResult = await OmnisyncSentinel.executeWithResilience(
            () => driver.generateResponse(inferencePrompt, configuration),
            'OmnisyncArtificialIntelligenceEngine',
            driver.providerName
          );

          return AIResponseSchema.parse({
            conversationId: conversationId,
            suggestion: inferenceResult,
            status: 'RESOLVED',
            confidenceScore: 1.0,
            sourceManuals: []
          });

        } catch (criticalError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-001',
            severity: 'HIGH',
            apparatus: 'OmnisyncArtificialIntelligenceEngine',
            operation: 'executeInference',
            message: 'integrations.ai_engine.errors.inference_failure',
            context: { error: String(criticalError) },
            isRecoverable: true
          });

          return AIResponseSchema.parse({
            conversationId: conversationId,
            suggestion: 'SISTEMA_TEMPORALMENTE_FUERA_DE_LINEA',
            status: 'NEED_HUMAN',
            confidenceScore: 0,
            sourceManuals: []
          });
        }
      }
    );
  }

  /**
   * @method generateVectorEmbeddings
   * @description Transforma ADN técnico en firmas vectoriales para la memoria RAG.
   */
  public static async generateVectorEmbeddings(
    driver: IArtificialIntelligenceDriver,
    textualContent: string
  ): Promise<number[]> {
    return await OmnisyncTelemetry.traceExecution(
      'OmnisyncArtificialIntelligenceEngine',
      `embedding:${driver.providerName}`,
      async () => {
        try {
          /**
           * @section Blindaje de Contrato
           * Verificamos que el driver posea la capacidad técnica antes de invocarla.
           */
          const embeddingCapableDriver = driver as IArtificialIntelligenceDriver & {
            calculateVectorEmbeddings(content: string): Promise<number[]>;
          };

          if (typeof embeddingCapableDriver.calculateVectorEmbeddings !== 'function') {
            throw new Error(`integrations.ai_engine.errors.embedding_not_supported`);
          }

          return await embeddingCapableDriver.calculateVectorEmbeddings(textualContent);

        } catch (error: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-002',
            severity: 'CRITICAL',
            apparatus: 'OmnisyncArtificialIntelligenceEngine',
            operation: 'generateEmbeddings',
            message: 'integrations.ai_engine.errors.embedding_failure',
            context: { error: String(error) }
          });
          throw error;
        }
      }
    );
  }
}
