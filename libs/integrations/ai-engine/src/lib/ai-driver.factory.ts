/** libs/integrations/ai-engine/src/lib/ai-driver.factory.ts */

import { IArtificialIntelligenceDriver } from '@omnisync/core-contracts';
import { GoogleGeminiDriver } from '@omnisync/ai-google';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';

/**
 * @type AISovereignModelAlias
 * @description Define los alias de modelos autorizados por la arquitectura.
 */
export type AISovereignModelAlias = 'PRO' | 'FLASH' | 'DEEP_THINK';

/**
 * @name ArtificialIntelligenceDriverFactory
 * @description Fábrica de alta disponibilidad para la resolución de drivers de IA.
 * Orquesta la creación de piezas LEGO cognitivas según la configuración del Tenant.
 *
 * @protocol OEDP-Level: Elite (Scope-Safe & Resilient)
 */
export class ArtificialIntelligenceDriverFactory {

  /**
   * @method getSovereignDriver
   * @description Produce una instancia de driver validada e inyectada con su alias de modelo.
   *
   * @param {string} providerIdentifier - Identificador del proveedor (ej: 'GOOGLE_GEMINI').
   * @param {AISovereignModelAlias} modelAlias - Nivel de razonamiento del modelo (Default: FLASH).
   * @returns {IArtificialIntelligenceDriver} El driver técnico listo para operar.
   */
  public static getSovereignDriver(
    providerIdentifier: string,
    modelAlias: AISovereignModelAlias = 'FLASH'
  ): IArtificialIntelligenceDriver {
    const normalizedIdentifier = providerIdentifier.toUpperCase();

    switch (normalizedIdentifier) {
      case 'GOOGLE_GEMINI': {
        /**
         * @section Resolución de Google
         * Se invoca el constructor nivelado que acepta el modelAlias de 2026.
         */
        return new GoogleGeminiDriver(modelAlias);
      }

      default: {
        /**
         * @section Gestión de Fallos de Fábrica
         * Al usar un bloque de ámbito {}, erradicamos el error 'no-case-declarations'.
         */
        const detailedErrorMessage = `[OS-AI-FACTORY]: El proveedor [${normalizedIdentifier}] no existe en el catálogo de infraestructura.`;

        OmnisyncSentinel.report({
          errorCode: 'OS-INTEG-604',
          severity: 'CRITICAL',
          apparatus: 'ArtificialIntelligenceDriverFactory',
          operation: 'getSovereignDriver',
          message: 'integrations.ai_engine.errors.unsupported_provider',
          context: { receivedIdentifier: normalizedIdentifier, requestedAlias: modelAlias }
        });

        throw new Error(detailedErrorMessage);
      }
    }
  }
}
