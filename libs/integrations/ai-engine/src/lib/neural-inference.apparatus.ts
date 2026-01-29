/** libs/integrations/ai-engine/src/lib/neural-inference.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import {
  OmnisyncContracts,
  IArtificialIntelligenceDriver,
  IArtificialIntelligenceModelConfiguration,
  IAIResponse,
  AIResponseSchema,
} from '@omnisync/core-contracts';

/**
 * @name NeuralInferenceApparatus
 * @description Aparato de élite encargado de la orquestación, ejecución y
 * normalización de inferencias generativas. Actúa como el puente de verdad
 * entre los drivers de bajo nivel y los orquestadores de flujo neural.
 *
 * @protocol OEDP-Level: Elite (Atomic & Instrumented)
 */
export class NeuralInferenceApparatus {
  /**
   * @method executeGenerativeInference
   * @description Nodo maestro de inferencia. Orquesta la resiliencia del driver
   * y transforma la respuesta cruda en un contrato de IA soberano.
   *
   * @param {IArtificialIntelligenceDriver} driver - Implementación técnica activa (Gemini, etc).
   * @param {string} prompt - Instrucción cognitiva enriquecida (System + RAG + Context).
   * @param {IArtificialIntelligenceModelConfiguration} configuration - Hiperparámetros de ejecución.
   * @param {string} conversationId - Identificador único del hilo de diálogo.
   * @returns {Promise<IAIResponse>} Respuesta validada bajo estándar SSOT.
   */
  public static async executeGenerativeInference(
    driver: IArtificialIntelligenceDriver,
    prompt: string,
    configuration: IArtificialIntelligenceModelConfiguration,
    conversationId: string,
  ): Promise<IAIResponse> {
    const apparatusName = 'NeuralInferenceApparatus';
    const operationName = `inference:${driver.providerName}`;

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        try {
          /**
           * @section Fase 1: Ejecución Resiliente
           * Delegamos la ejecución al Sentinel para manejar reintentos y backoff.
           */
          const rawInferenceResult =
            await OmnisyncSentinel.executeWithResilience(
              () => driver.generateResponse(prompt, configuration),
              apparatusName,
              operationName,
            );

          /**
           * @section Fase 2: Normalización y Mapeo
           * Transformamos el string crudo en un objeto IA soberano.
           */
          return this.mapSuccessfulInference(
            conversationId,
            rawInferenceResult,
          );
        } catch (criticalInferenceError: unknown) {
          /**
           * @section Fase 3: Activación de Protocolo Failsafe
           * Reportamos la anomalía y retornamos una respuesta de seguridad.
           */
          return await this.handleInferenceFailure(
            apparatusName,
            operationName,
            conversationId,
            criticalInferenceError,
          );
        }
      },
      {
        estimatedInputTokens: driver.calculateTokens(prompt),
        modelTier: configuration.modelName,
      },
    );
  }

  /**
   * @method mapSuccessfulInference
   * @private
   * @description Realiza el triaje de la respuesta de la IA para determinar su estado operativo.
   */
  private static mapSuccessfulInference(
    conversationId: string,
    rawText: string,
  ): IAIResponse {
    const apparatusName = 'NeuralInferenceApparatus:Mapper';

    // Heurística de escalación: ¿La IA determinó que no puede ayudar?
    const requiresHumanEscalation =
      rawText.includes('ESCALATE_TO_HUMAN') ||
      rawText.includes('HUMAN_REQUIRED');

    const responsePayload: unknown = {
      conversationId,
      suggestion: rawText.trim(),
      status: requiresHumanEscalation ? 'NEED_HUMAN' : 'RESOLVED',
      confidenceScore: 1.0, // En V3.1 se integrará análisis de logprobs si el driver lo permite
      sourceManuals: [], // Inyectado por el Vector Engine en el orquestador maestro
    };

    return OmnisyncContracts.validate(
      AIResponseSchema,
      responsePayload,
      apparatusName,
    );
  }

  /**
   * @method handleInferenceFailure
   * @private
   * @description Orquesta la respuesta del sistema ante caídas totales del proveedor de IA.
   */
  private static async handleInferenceFailure(
    apparatus: string,
    operation: string,
    conversationId: string,
    error: unknown,
  ): Promise<IAIResponse> {
    await OmnisyncSentinel.report({
      errorCode: 'OS-INTEG-601',
      severity: 'HIGH',
      apparatus,
      operation,
      message: 'integrations.ai_engine.inference_failure',
      context: { error: String(error), conversationId },
      isRecoverable: true,
    });

    /**
     * @note Sello de Failsafe
     * Retornamos una respuesta neutra que el Front-end mapeará mediante i18n
     * usando la sugerencia como identificador de error amigable.
     */
    return AIResponseSchema.parse({
      conversationId,
      suggestion: 'CORE_AI_OFFLINE_RETRY_LATER',
      status: 'NEED_HUMAN',
      confidenceScore: 0,
      sourceManuals: [],
    });
  }
}
