/** libs/integrations/ai-engine/src/lib/ai-driver.factory.ts */

import { IArtificialIntelligenceDriver } from '@omnisync/core-contracts';
import { GoogleGeminiDriver } from '@omnisync/ai-google';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

export type NeuralModelTier = 'PRO' | 'FLASH' | 'DEEP_THINK';

/**
 * @name ArtificialIntelligenceDriverFactory
 * @description Fábrica de infraestructura para resolución de drivers de IA.
 *
 * @protocol OEDP-Level: Elite (Linter-Corrected)
 */
export class ArtificialIntelligenceDriverFactory {
  public static getSovereignDriver(
    artificialIntelligenceProviderIdentifier: string,
    neuralModelTier: NeuralModelTier = 'FLASH'
  ): IArtificialIntelligenceDriver {
    // Corrección: Eliminación de anotación redundante :string
    const apparatusName = 'ArtificialIntelligenceDriverFactory';
    const normalizedProviderIdentifier = artificialIntelligenceProviderIdentifier.toUpperCase().trim();

    return OmnisyncTelemetry.traceExecutionSync(
      apparatusName,
      'getSovereignDriver',
      () => {
        switch (normalizedProviderIdentifier) {
          case 'GOOGLE_GEMINI':
            return new GoogleGeminiDriver(neuralModelTier);

          default: {
            // Corrección: Eliminación de anotación redundante :string
            const executionError = `[OS-AI-FACTORY]: El proveedor [${normalizedProviderIdentifier}] no ha sido provisionado.`;

            OmnisyncSentinel.report({
              errorCode: 'OS-INTEG-604',
              severity: 'CRITICAL',
              apparatus: apparatusName,
              operation: 'resolve_provider',
              message: 'integrations.ai_engine.errors.unsupported_provider',
              context: { normalizedProviderIdentifier, neuralModelTier },
              isRecoverable: false,
            });

            throw new Error(executionError);
          }
        }
      }
    );
  }
}
