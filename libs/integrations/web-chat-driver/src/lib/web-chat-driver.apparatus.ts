/** libs/integrations/web-chat-driver/src/lib/web-chat-driver.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import {
  INeuralIntent,
  NeuralIntentSchema,
  TenantId,
  OmnisyncContracts,
} from '@omnisync/core-contracts';

/** 
 * @section Sincronización de ADN Local 
 * RESOLUCIÓN LINT: Inyección de Zod para validación de entrada técnica.
 */
import { WebChatSocketEventSchema, IWebChatSocketEvent } from './schemas/web-chat-driver.schema';

/**
 * @name WebChatDriver
 * @description Aparato mediador de alta disponibilidad encargado de la normalización 
 * de tráfico WebSocket. Actúa como el intérprete entre el Widget Web y el 
 * Neural Hub, transformando eventos asíncronos en Intenciones Neurales inmutables.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Secure-WebSocket-Gateway V3.2)
 * @vision Ultra-Holística: Zero-Any & Forensic-Mapping
 */
export class WebChatDriver {
  /**
   * @method transformEventToIntent
   * @description Transforma un pulso de red web en un contrato neural operativo. 
   * Ejecuta una validación de doble capa: local (ADN de red) y global (ADN neural).
   *
   * @param {string} socketClientId - Identificador único de la conexión física.
   * @param {unknown} rawPayload - Carga útil recibida por el socket.
   * @param {string} tenantId - Identificador nominal de la organización suscriptora.
   * @returns {Promise<INeuralIntent>} Intención validada y lista para orquestación.
   */
  public static async transformEventToIntent(
    socketClientId: string,
    rawPayload: unknown,
    tenantId: string,
  ): Promise<INeuralIntent> {
    const apparatusName = 'WebChatDriver';
    const operationName = 'transformEventToIntent';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        try {
          /**
           * @section Fase 1: Aduana de Entrada (Red)
           * Erradicamos el uso de 'as' mediante validación estricta del esquema local.
           */
          const validatedEvent: IWebChatSocketEvent = OmnisyncContracts.validate(
            WebChatSocketEventSchema,
            rawPayload,
            `${apparatusName}:NetworkHandshake`
          );

          /**
           * @section Fase 2: Mapeo y Normalización
           * Construimos el ADN de la intención inyectando soberanía de identidad y versión.
           */
          const neuralIntentPayload: unknown = {
            id: crypto.randomUUID(),
            channel: 'WEB_CHAT',
            externalUserId: socketClientId,
            /**
             * NIVELACIÓN: Aplicamos la soberanía de marca mediante el Branded Type TenantId.
             */
            tenantId: tenantId as TenantId,
            payload: {
              type: 'TEXT',
              content: validatedEvent.message,
              metadata: {
                userAgent: validatedEvent.browserInfo,
                socketIdentifier: socketClientId,
                frameworkVersion: 'OEDP-V3.2-ELITE',
                clientContext: validatedEvent.context ?? {}
              },
            },
            timestamp: new Date().toISOString(),
          };

          /**
           * @section Fase 3: Sello de Integridad SSOT
           * Validamos que el resultado final cumpla con el estándar omnicanal del sistema.
           */
          return OmnisyncContracts.validate(
            NeuralIntentSchema,
            neuralIntentPayload,
            apparatusName
          );

        } catch (criticalMappingError: unknown) {
          /**
           * @note Gestión de Resiliencia Forense
           * El Sentinel captura el fallo pero permite identificar si el 
           * cliente web está enviando datos fuera de norma.
           */
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-701',
            severity: 'MEDIUM',
            apparatus: apparatusName,
            operation: operationName,
            message: 'tools.web_chat.normalization_failed',
            context: {
              socketId: socketClientId,
              tenantIdentifier: tenantId,
              errorDetail: String(criticalMappingError),
            },
            isRecoverable: true,
          });
          
          throw criticalMappingError;
        }
      },
      { socketId: socketClientId, tenant: tenantId }
    );
  }
}