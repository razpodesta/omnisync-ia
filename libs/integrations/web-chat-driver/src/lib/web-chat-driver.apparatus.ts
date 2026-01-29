/** libs/integrations/web-chat-driver/src/lib/web-chat-driver.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import {
  INeuralIntent,
  NeuralIntentSchema,
  TenantId,
} from '@omnisync/core-contracts';

/**
 * @interface IWebChatSocketEvent
 * @description Estructura cruda esperada desde el cliente del Widget Web.
 */
interface IWebChatSocketEvent {
  readonly message: string;
  readonly browserInfo?: string;
}

/**
 * @name WebChatDriver
 * @description Aparato encargado de la mediación entre eventos de WebSockets y
 * el Neural Hub. Traduce la interacción del usuario en la web en Intenciones
 * Neurales estandarizadas bajo contrato SSOT.
 *
 * @protocol OEDP-Level: Elite (Zero Any Implementation)
 */
export class WebChatDriver {
  /**
   * @method transformEventToIntent
   * @description Normaliza y valida el payload recibido desde el socket.
   * Erradica el uso de 'any' mediante tipado fuerte y validación de esquemas.
   *
   * @param {string} socketClientId - Identificador del cliente conectado al socket.
   * @param {unknown} rawPayload - Datos brutos recibidos por la red.
   * @param {string} tenantOrganizationIdentifier - ID del nodo suscriptor.
   * @returns {Promise<INeuralIntent>} Intención validada y lista para orquestación.
   */
  public static async transformEventToIntent(
    socketClientId: string,
    rawPayload: unknown,
    tenantOrganizationIdentifier: string,
  ): Promise<INeuralIntent> {
    return await OmnisyncTelemetry.traceExecution(
      'WebChatDriver',
      'transformEventToIntent',
      async () => {
        try {
          /**
           * @section Normalización de Carga Útil
           * Se realiza un casteo seguro a la interfaz de evento interna.
           */
          const socketEvent = rawPayload as IWebChatSocketEvent;

          const neuralIntentPayload: Partial<INeuralIntent> = {
            id: crypto.randomUUID(),
            channel: 'WEB_CHAT',
            externalUserId: socketClientId,
            /**
             * NIVELACIÓN: Casteo explícito al Branded Type 'TenantId'
             * para cumplir con la soberanía nominal del sistema.
             */
            tenantId: tenantOrganizationIdentifier as TenantId,
            payload: {
              type: 'TEXT',
              content: socketEvent.message ?? '',
              metadata: {
                userAgent: socketEvent.browserInfo ?? 'unknown_browser_agent',
              },
            },
            timestamp: new Date().toISOString(),
          };

          return NeuralIntentSchema.parse(neuralIntentPayload);
        } catch (criticalError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-701',
            severity: 'MEDIUM',
            apparatus: 'WebChatDriver',
            operation: 'transform',
            message:
              'Fallo crítico al mapear evento de socket a Intención Neural.',
            context: {
              socketClientId,
              tenantId: tenantOrganizationIdentifier,
              error: String(criticalError),
            },
            isRecoverable: true,
          });
          throw criticalError;
        }
      },
    );
  }
}
