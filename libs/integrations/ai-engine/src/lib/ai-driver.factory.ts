/** libs/integrations/ai-engine/src/lib/ai-driver.factory.ts */

import { IArtificialIntelligenceDriver } from '@omnisync/core-contracts';
import { GoogleGeminiDriver } from '@omnisync/ai-google';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @section Sincronización de ADN Local
 * Resolución de esquemas de validación interna para la capa de integración.
 */
import {
  AIProviderResolutionSchema,
  IAIProviderResolution,
} from './schemas/ai-inference.schema';

/**
 * @type NeuralModelTier
 * @description Define la taxonomía de potencia y especialización de los modelos.
 * Sincronizado para soportar razonamiento profundo (Thinking) y vectorización.
 */
export type NeuralModelTier = 'PRO' | 'FLASH' | 'DEEP_THINK' | 'EMBEDDING';

/**
 * @name ArtificialIntelligenceDriverFactory
 * @description Fábrica de infraestructura de alta disponibilidad encargada de la 
 * resolución y ciclo de vida de los drivers de IA. Implementa un patrón 
 * Singleton Memoizado para optimizar el consumo de memoria y garantizar 
 * el agnosticismo total del Neural Hub.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Provider-Sovereignty V3.2)
 * @vision Ultra-Holística: Model-Agnostic & Zero-Latency-Resolution
 */
export class ArtificialIntelligenceDriverFactory {
  /**
   * @private
   * @description Registro inmutable de instancias activas. Previene la 
   * duplicidad de handshakes con los SDKs de proveedores.
   */
  private static readonly sovereignDriverRegistry = new Map<
    string,
    IArtificialIntelligenceDriver
  >();

  /**
   * @method getSovereignDriver
   * @description Localiza y activa el driver de IA requerido. 
   * Ejecuta una auditoría de integridad sobre la petición antes de la instanciación.
   *
   * @param {string} providerIdentifier - ID nominal del proveedor (ej: 'GOOGLE_GEMINI').
   * @param {NeuralModelTier} neuralModelTier - Nivel de potencia solicitado (Default: FLASH).
   * @returns {IArtificialIntelligenceDriver} Driver validado y listo para inferencia.
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
         * @section Fase 1: Validación de Soberanía de Entrada (SSOT)
         * Aseguramos que el identificador y el tier cumplan con el contrato de la capa.
         */
        const validatedResolution: IAIProviderResolution =
          AIProviderResolutionSchema.parse({
            providerIdentifier: providerIdentifier.toUpperCase(),
            modelTier: neuralModelTier,
          });

        const cacheLookupKey = `${validatedResolution.providerIdentifier}:${neuralModelTier}`;

        // Optimización por Recuperación de Memoria
        const existingDriver = this.sovereignDriverRegistry.get(cacheLookupKey);
        if (existingDriver) {
          OmnisyncTelemetry.verbose(
            apparatusName,
            'memoization_hit',
            `Reutilizando infraestructura para: ${cacheLookupKey}`,
          );
          return existingDriver;
        }

        /**
         * @section Fase 2: Activación de Driver Físico
         * Delegamos la creación a un nodo de decisión interno para mantener SRP.
         */
        const newlyActivatedDriver = this.instantiateInternalDriver(
          validatedResolution.providerIdentifier,
          neuralModelTier,
        );

        // Registro en la Bóveda de Soberanía
        this.sovereignDriverRegistry.set(cacheLookupKey, newlyActivatedDriver);

        return newlyActivatedDriver;
      },
      { provider: providerIdentifier, tier: neuralModelTier }
    );
  }

  /**
   * @method instantiateInternalDriver
   * @private
   * @description Nodo de decisión para el aprovisionamiento de drivers.
   */
  private static instantiateInternalDriver(
    provider: string,
    tier: NeuralModelTier,
  ): IArtificialIntelligenceDriver {
    const apparatusName = 'ArtificialIntelligenceDriverFactory:Aprovisionador';

    switch (provider) {
      case 'GOOGLE_GEMINI':
        /**
         * @note Integración con Gemini 2026
         * El driver de Google maneja internamente la lógica de sus propios modelos.
         */
        return new GoogleGeminiDriver(
          tier as 'PRO' | 'FLASH' | 'DEEP_THINK' | 'EMBEDDING',
        );

      default: {
        const failureMessage = `[OS-AI-ENGINE]: El proveedor [${provider}] no tiene un adaptador autorizado.`;

        /**
         * @section Gestión de Anomalía Crítica
         * Si el proveedor no es reconocido, el Sentinel bloquea la ejecución.
         */
        OmnisyncSentinel.report({
          errorCode: 'OS-INTEG-604',
          severity: 'CRITICAL',
          apparatus: apparatusName,
          operation: 'instantiate_driver',
          message: failureMessage,
          context: { providerIdentifier: provider, requestedTier: tier },
          isRecoverable: false,
        });

        throw new Error(failureMessage);
      }
    }
  }

  /**
   * @method flushSovereignCache
   * @description Limpia el registro de drivers. Vital para la rotación de 
   * secretos en caliente sin reiniciar el microservicio.
   */
  public static flushSovereignCache(): void {
    this.sovereignDriverRegistry.clear();
    OmnisyncTelemetry.verbose(
      'ArtificialIntelligenceDriverFactory',
      'cache_purged',
      'El registro de drivers ha sido vaciado por orden de seguridad.'
    );
  }
}