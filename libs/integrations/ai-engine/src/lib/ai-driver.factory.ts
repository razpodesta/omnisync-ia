/** libs/integrations/ai-engine/src/lib/ai-driver.factory.ts */

import { IArtificialIntelligenceDriver } from '@omnisync/core-contracts';
import { GoogleGeminiDriver } from '@omnisync/ai-google';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @section Sincronización de ADN Local
 * Importamos el esquema de resolución para validar la soberanía de la petición.
 */
import {
  AIProviderResolutionSchema,
  IAIProviderResolution,
} from './schemas/ai-inference.schema';

/**
 * @type NeuralModelTier
 * @description Define los niveles de razonamiento y especialización del modelo.
 * NIVELACIÓN 2026: Inclusión de tiers para procesos de fondo y razonamiento profundo.
 */
export type NeuralModelTier = 'PRO' | 'FLASH' | 'DEEP_THINK' | 'EMBEDDING';

/**
 * @name ArtificialIntelligenceDriverFactory
 * @description Fábrica de infraestructura de alta disponibilidad para la resolución de drivers de IA.
 * Actúa como el ruteador soberano del sistema, gestionando el ciclo de vida de los conectores
 * y garantizando el agnosticismo de los orquestadores superiores.
 *
 * @protocol OEDP-Level: Elite (Atomic & Memoized)
 */
export class ArtificialIntelligenceDriverFactory {
  /**
   * @private
   * @description Almacén inmutable de instancias para evitar la fragmentación de memoria.
   */
  private static readonly sovereignDriverCache = new Map<
    string,
    IArtificialIntelligenceDriver
  >();

  /**
   * @method getSovereignDriver
   * @description Localiza, valida e instancia el driver de inteligencia artificial requerido.
   * Aplica un patrón Singleton por combinación de Proveedor/Tier.
   *
   * @param {string} providerIdentifier - Identificador nominal (ej: 'GOOGLE_GEMINI').
   * @param {NeuralModelTier} neuralModelTier - Nivel de potencia del modelo (Default: FLASH).
   * @returns {IArtificialIntelligenceDriver} El driver listo para la ejecución de inferencia.
   */
  public static getSovereignDriver(
    providerIdentifier: string,
    neuralModelTier: NeuralModelTier = 'FLASH',
  ): IArtificialIntelligenceDriver {
    const apparatusName = 'ArtificialIntelligenceDriverFactory';
    const operationName = 'getSovereignDriver';

    return OmnisyncTelemetry.traceExecutionSync(
      apparatusName,
      operationName,
      () => {
        /**
         * @section Fase 1: Validación de Soberanía de Entrada
         * Aseguramos que la petición cumpla con el contrato SSOT de la capa de integración.
         */
        const validationResult: IAIProviderResolution =
          AIProviderResolutionSchema.parse({
            providerIdentifier,
            modelTier: neuralModelTier,
          });

        const normalizedProvider = validationResult.providerIdentifier;
        const cacheKey = `${normalizedProvider}:${neuralModelTier}`;

        // Verificación en caché para optimización de performance
        const cachedDriver = this.sovereignDriverCache.get(cacheKey);
        if (cachedDriver) {
          OmnisyncTelemetry.verbose(
            apparatusName,
            'cache_hit',
            `Reutilizando instancia: ${cacheKey}`,
          );
          return cachedDriver;
        }

        /**
         * @section Fase 2: Resolución y Activación de Driver
         * Despacho polimórfico basado en el identificador de infraestructura.
         */
        const resolvedDriver = this.resolveInternalDriver(
          normalizedProvider,
          neuralModelTier,
        );

        // Registro en caché soberana
        this.sovereignDriverCache.set(cacheKey, resolvedDriver);

        return resolvedDriver;
      },
    );
  }

  /**
   * @method resolveInternalDriver
   * @private
   * @description Nodo de decisión para la instanciación de drivers físicos.
   */
  private static resolveInternalDriver(
    provider: string,
    tier: NeuralModelTier,
  ): IArtificialIntelligenceDriver {
    const apparatusName = 'ArtificialIntelligenceDriverFactory';

    switch (provider) {
      case 'GOOGLE_GEMINI':
        /**
         * @note Integración con Gemini 2026
         * Se delega la configuración específica al driver de la capa Google Gemini.
         */
        return new GoogleGeminiDriver(
          tier as 'PRO' | 'FLASH' | 'DEEP_THINK' | 'EMBEDDING',
        );

      default: {
        const resolutionErrorMessage = `[OS-AI-FACTORY]: El proveedor [${provider}] no posee un adaptador activo en la infraestructura.`;

        OmnisyncSentinel.report({
          errorCode: 'OS-INTEG-604',
          severity: 'CRITICAL',
          apparatus: apparatusName,
          operation: 'resolve_internal_driver',
          message: resolutionErrorMessage,
          context: { provider, requestedTier: tier },
          isRecoverable: false,
        });

        throw new Error(resolutionErrorMessage);
      }
    }
  }

  /**
   * @method flushCache
   * @description Libera todas las instancias de drivers. Útil para rotación de API Keys
   * o reinicio caliente del sistema de orquestación.
   */
  public static flushCache(): void {
    this.sovereignDriverCache.clear();
    OmnisyncTelemetry.verbose(
      'ArtificialIntelligenceDriverFactory',
      'cache_flush',
      'Sovereign Driver Cache has been purged.',
    );
  }
}
