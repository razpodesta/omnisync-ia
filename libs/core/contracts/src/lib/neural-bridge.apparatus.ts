/** libs/core/contracts/src/lib/neural-bridge.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncContracts } from './contracts.apparatus';
import { TenantId } from './schemas/core-contracts.schema';
import {
  NeuralBridgeConfigurationSchema,
  INeuralBridgeConfiguration,
} from './schemas/neural-bridge.schema';

/**
 * @name NeuralBridge
 * @description Aparato de comunicación holística de alta disponibilidad.
 * Orquesta las transmisiones de datos entre los nodos de interfaz (Dashboard/Widget)
 * y el Neural Hub. Implementa blindaje de resiliencia mediante el Sentinel y 
 * validación de integridad SSOT en cada petición.
 *
 * @protocol OEDP-Level: Elite (Resilient-Cloud-Bridge V3.0)
 */
export class NeuralBridge {
  /**
   * @private
   * Almacén inmutable de configuración de red hidratado en la ignición.
   */
  private static sovereignBridgeConfiguration: INeuralBridgeConfiguration | null = null;

  /**
   * @method request
   * @description Ejecuta una transmisión de datos hacia la infraestructura neural.
   * Implementa el patrón 'Sovereign Dispatch' con reintentos automáticos y timeout.
   *
   * @template TResponse - Interfaz esperada del ADN de respuesta.
   * @param {string} resourceEndpoint - Ruta técnica del servicio (ej: '/v1/neural/chat').
   * @param {TenantId} tenantOrganizationIdentifier - Sello de soberanía del suscriptor.
   * @param {unknown} payloadData - Carga útil de la petición.
   * @param {'POST' | 'GET' | 'PUT' | 'PATCH'} method - Verbo HTTP de red.
   * @returns {Promise<TResponse>} Respuesta validada y tipada.
   */
  public static async request<TResponse>(
    resourceEndpoint: string,
    tenantOrganizationIdentifier: TenantId,
    payloadData: unknown,
    method: 'POST' | 'GET' | 'PUT' | 'PATCH' = 'POST',
  ): Promise<TResponse> {
    const bridgeConfig = this.initializeSovereignConfiguration();
    const apparatusName = 'NeuralBridge';
    const operationName = `request:${method}:${resourceEndpoint}`;

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        /**
         * @section Control de Ciclo de Vida de Petición
         * Orquestamos la señal de aborto para proteger el presupuesto de tiempo.
         */
        const transmissionController = new AbortController();
        const timeoutReference = setTimeout(
          () => transmissionController.abort(),
          bridgeConfig.timeoutInMilliseconds,
        );

        try {
          /**
           * @section Ejecución con Blindaje de Resiliencia
           * El Sentinel aplica backoff exponencial si el Hub está en 'Cold Start'.
           */
          return await OmnisyncSentinel.executeWithResilience(
            async () => {
              const absoluteUrl = `${bridgeConfig.baseUrl}${resourceEndpoint}`;

              const networkResponse = await fetch(absoluteUrl, {
                method: method,
                signal: transmissionController.signal,
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'x-omnisync-tenant': tenantOrganizationIdentifier,
                  'x-omnisync-framework-version': 'OEDP-V3.0',
                },
                body: method !== 'GET' ? JSON.stringify(payloadData) : undefined,
              });

              if (!networkResponse.ok) {
                throw new Error(`bridge.status_error.${networkResponse.status}`);
              }

              return (await networkResponse.json()) as TResponse;
            },
            apparatusName,
            `network_fetch:${resourceEndpoint}`,
          );
        } catch (criticalTransmissionError: unknown) {
          await this.reportTransmissionAnomaly(
            resourceEndpoint,
            tenantOrganizationIdentifier,
            criticalTransmissionError,
          );
          throw criticalTransmissionError;
        } finally {
          clearTimeout(timeoutReference);
        }
      },
      { tenantId: tenantOrganizationIdentifier, method }
    );
  }

  /**
   * @method initializeSovereignConfiguration
   * @private
   * @description Hidrata y valida la configuración técnica desde las variables de entorno.
   * Utiliza OmnisyncContracts para asegurar que el ADN de red sea íntegro.
   */
  private static initializeSovereignConfiguration(): INeuralBridgeConfiguration {
    if (this.sovereignBridgeConfiguration) {
      return this.sovereignBridgeConfiguration;
    }

    const rawBaseUrl = process.env['NEXT_PUBLIC_API_URL'] || 'https://omnisync-orchestrator.onrender.com';
    const sanitizedUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

    const rawConfig: unknown = {
      baseUrl: sanitizedUrl,
      timeoutInMilliseconds: 15000,
    };

    /**
     * @section Validación de Infraestructura
     * Aseguramos que la URL del puente sea válida antes de cualquier despacho.
     */
    this.sovereignBridgeConfiguration = OmnisyncContracts.validate(
      NeuralBridgeConfigurationSchema,
      rawConfig,
      'NeuralBridge:Ignition'
    );

    OmnisyncTelemetry.verbose(
      'NeuralBridge', 
      'ignition_success', 
      `Infraestructura vinculada: ${sanitizedUrl}`
    );

    return this.sovereignBridgeConfiguration;
  }

  /**
   * @method reportTransmissionAnomaly
   * @private
   */
  private static async reportTransmissionAnomaly(
    endpoint: string,
    tenantId: string,
    errorInstance: unknown,
  ): Promise<void> {
    const isTimeout = errorInstance instanceof Error && errorInstance.name === 'AbortError';

    await OmnisyncSentinel.report({
      errorCode: 'OS-CORE-503',
      severity: 'HIGH',
      apparatus: 'NeuralBridge',
      operation: 'dispatch_request',
      message: isTimeout
        ? 'core.bridge.error.timeout'
        : 'core.bridge.error.connectivity_loss',
      context: {
        resourceEndpoint: endpoint,
        tenantIdentifier: tenantId,
        originalError: String(errorInstance),
      },
      isRecoverable: true,
    });
  }
}