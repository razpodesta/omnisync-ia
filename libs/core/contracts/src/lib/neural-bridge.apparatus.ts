/** libs/core/contracts/src/lib/neural-bridge.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { TenantId } from './schemas/core-contracts.schema';
import {
  NeuralBridgeConfigurationSchema,
  INeuralBridgeConfiguration
} from './schemas/neural-bridge.schema';

/**
 * @name NeuralBridge
 * @description Aparato de comunicación holística de alta disponibilidad.
 * Orquesta las transmisiones de datos entre los consumidores (Dashboard/Widget)
 * y el Neural Hub aplicando blindaje de resiliencia y validación SSOT.
 *
 * @protocol OEDP-Level: Elite (Full Lifecycle Management)
 */
export class NeuralBridge {
  private static bridgeConfiguration: INeuralBridgeConfiguration;

  /**
   * @method request
   * @description Ejecuta una transmisión de datos hacia el orquestador neural.
   * Implementa cancelación por timeout y reintentos automáticos vía Sentinel.
   *
   * @template TResponse - Estructura esperada de la respuesta.
   * @param {string} resourceEndpoint - Ruta del servicio (ej: '/v1/neural/chat').
   * @param {TenantId} tenantOrganizationIdentifier - Identificador nominal del nodo.
   * @param {unknown} neuralTransmissionPayload - Cuerpo de la petición.
   * @param {'POST' | 'GET' | 'PUT'} protocolMethod - Método de red (Default: POST).
   */
  public static async request<TResponse>(
    resourceEndpoint: string,
    tenantOrganizationIdentifier: TenantId,
    neuralTransmissionPayload: unknown,
    protocolMethod: 'POST' | 'GET' | 'PUT' = 'POST'
  ): Promise<TResponse> {
    this.initializeSovereignConfiguration();

    return await OmnisyncTelemetry.traceExecution(
      'NeuralBridge',
      `request:${resourceEndpoint}`,
      async () => {
        const transmissionController = new AbortController();
        const timeoutReference = setTimeout(
          () => transmissionController.abort(),
          this.bridgeConfiguration.timeoutInMilliseconds
        );

        try {
          return await OmnisyncSentinel.executeWithResilience(
            async () => {
              const absoluteUrl = `${this.bridgeConfiguration.baseUrl}${resourceEndpoint}`;

              const networkResponse = await fetch(absoluteUrl, {
                method: protocolMethod,
                signal: transmissionController.signal,
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'x-omnisync-tenant': tenantOrganizationIdentifier,
                },
                body: protocolMethod !== 'GET' ? JSON.stringify(neuralTransmissionPayload) : undefined,
              });

              if (!networkResponse.ok) {
                throw new Error(`bridge.status.${networkResponse.status}`);
              }

              return await networkResponse.json() as TResponse;
            },
            'NeuralBridge',
            `fetch:${resourceEndpoint}`
          );
        } catch (criticalError: unknown) {
          await this.handleTransmissionFailure(
            resourceEndpoint,
            tenantOrganizationIdentifier,
            criticalError
          );
          throw criticalError;
        } finally {
          clearTimeout(timeoutReference);
        }
      }
    );
  }

  /**
   * @method initializeSovereignConfiguration
   * @private
   * @description Hidrata la configuración técnica validando contra el esquema SSOT.
   */
  private static initializeSovereignConfiguration(): void {
    if (this.bridgeConfiguration) return;

    this.bridgeConfiguration = NeuralBridgeConfigurationSchema.parse({
      baseUrl: process.env['NEXT_PUBLIC_API_URL'] || 'https://api.omnisync-ai.com',
      timeoutInMilliseconds: 15000
    });
  }

  /**
   * @method handleTransmissionFailure
   * @private
   */
  private static async handleTransmissionFailure(
    endpoint: string,
    tenantId: string,
    error: unknown
  ): Promise<void> {
    const isTimeout = error instanceof Error && error.name === 'AbortError';

    await OmnisyncSentinel.report({
      errorCode: 'OS-CORE-503',
      severity: 'HIGH',
      apparatus: 'NeuralBridge',
      operation: 'execute_request',
      message: isTimeout ? 'core.bridge.error.timeout' : 'core.bridge.error.connectivity_loss',
      context: {
        resourceEndpoint: endpoint,
        tenantIdentifier: tenantId,
        originalError: String(error)
      },
      isRecoverable: true
    });
  }
}
