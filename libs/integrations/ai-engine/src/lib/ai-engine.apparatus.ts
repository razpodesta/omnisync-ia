/** libs/integrations/ai-engine/src/lib/ai-engine.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { IAIDriver, IAIModelConfig } from '@omnisync/core-contracts';
import { IAIResponse, AIResponseSchema } from '@omnisync/core-contracts';

/**
 * @name OmnisyncAIEngine
 * @description Orquestador neural de élite. Maneja prompts, contexto y delega la ejecución
 * al Driver de IA configurado, asegurando resiliencia y telemetría.
 */
export class OmnisyncAIEngine {
  /**
   * @method processInference
   * @description Ejecuta una inferencia de IA utilizando un driver específico.
   */
  public static async processInference(
    driver: IAIDriver,
    prompt: string,
    config: IAIModelConfig,
    conversationId: string
  ): Promise<IAIResponse> {
    return await OmnisyncTelemetry.traceExecution(
      'OmnisyncAIEngine',
      `process:${driver.providerName}`,
      async () => {
        try {
          // 1. Ejecución con Resiliencia (Sentinel Wrapper)
          const rawResponse = await OmnisyncSentinel.executeWithResilience(
            () => driver.generateResponse(prompt, config),
            'OmnisyncAIEngine',
            driver.providerName
          );

          // 2. Normalización y Validación de Salida (Contratos)
          const normalizedResponse: IAIResponse = {
            conversationId,
            suggestion: rawResponse,
            status: 'RESOLVED',
            confidenceScore: 0.95, // En el futuro vendrá del Driver
            sourceManuals: []
          };

          return AIResponseSchema.parse(normalizedResponse);
        } catch (error) {
          // El Sentinel ya reportó el error, aquí decidimos el fallback
          OmnisyncTelemetry.verbose('OmnisyncAIEngine', 'process', 'Inference failed, engine returning safety response');
          
          return AIResponseSchema.parse({
            conversationId,
            suggestion: 'SISTEMA_TEMPORALMENTE_FUERA_DE_LINEA',
            status: 'NEED_HUMAN',
            confidenceScore: 0,
            sourceManuals: []
          });
        }
      },
      { provider: driver.providerName, model: config.modelName }
    );
  }
}