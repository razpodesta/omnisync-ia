/** libs/integrations/ai-engine/src/lib/neural-inference.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import {
  IArtificialIntelligenceDriver,
  IArtificialIntelligenceModelConfiguration,
  IAIResponse,
  AIResponseSchema
} from '@omnisync/core-contracts';

/**
 * @name NeuralInferenceApparatus
 * @description Aparato atómico encargado de la ejecución y validación de inferencias generativas.
 *
 * @protocol OEDP-Level: Elite (Linter-Corrected)
 */
export class NeuralInferenceApparatus {
  public static async executeGenerativeInference(
    artificialIntelligenceDriver: IArtificialIntelligenceDriver,
    neuralInferencePrompt: string,
    modelConfiguration: IArtificialIntelligenceModelConfiguration,
    conversationIdentifier: string
  ): Promise<IAIResponse> {
    // Corrección: Eliminación de anotación redundante :string
    const apparatusName = 'NeuralInferenceApparatus';
    const operationName = `inference:${artificialIntelligenceDriver.providerName}`;

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        try {
          const rawInferenceResult = await OmnisyncSentinel.executeWithResilience(
            () => artificialIntelligenceDriver.generateResponse(neuralInferencePrompt, modelConfiguration),
            apparatusName,
            operationName
          );

          return AIResponseSchema.parse({
            conversationId: conversationIdentifier,
            suggestion: rawInferenceResult,
            status: 'RESOLVED',
            confidenceScore: 1.0,
            sourceManuals: [],
          });
        } catch (criticalInferenceError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-601',
            severity: 'HIGH',
            apparatus: apparatusName,
            operation: 'executeGenerativeInference',
            message: 'integrations.ai_engine.inference_failure',
            context: { error: String(criticalInferenceError), conversationIdentifier },
            isRecoverable: true,
          });

          return AIResponseSchema.parse({
            conversationId: conversationIdentifier,
            suggestion: 'SISTEMA_TEMPORALMENTE_FUERA_DE_LINEA',
            status: 'NEED_HUMAN',
            confidenceScore: 0,
            sourceManuals: [],
          });
        }
      }
    );
  }
}
