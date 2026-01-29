/** libs/integrations/whatsapp-meta-driver/src/lib/apparatus/meta-messaging.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncContracts } from '@omnisync/core-contracts';
import {
  MetaOutboundPayloadSchema,
  IMetaOutboundPayload,
} from '../schemas/messaging/meta-messaging.schema';
import { MetaInteractiveApparatus } from './meta-interactive.apparatus';

/**
 * @name MetaMessagingApparatus
 * @description Aparato encargado de la orquestación y transporte de comunicaciones hacia Meta.
 * Centraliza la validación de contratos salientes y la gestión de errores de red.
 *
 * @protocol OEDP-Level: Elite (Full Resilient Dispatcher)
 */
export class MetaMessagingApparatus {
  /**
   * @method dispatchSovereignMessage
   * @description Envía cualquier tipo de mensaje (Texto, Media, Interactivo) con blindaje Sentinel.
   */
  public static async dispatchSovereignMessage(
    facebookPhoneNumberIdentifier: string,
    permanentAccessToken: string,
    outboundPayload: IMetaOutboundPayload,
  ): Promise<{ readonly messageIdentifier: string }> {
    const apparatusName = 'MetaMessagingApparatus';
    const operationName = `dispatch:${outboundPayload.messageType}`;

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        /**
         * @section Validación de Soberanía del Dato
         * Aseguramos que el mensaje cumpla con los límites físicos de Meta (caracteres, botones).
         */
        const validatedPayload = OmnisyncContracts.validate(
          MetaOutboundPayloadSchema,
          outboundPayload,
          apparatusName,
        );

        return await OmnisyncSentinel.executeWithResilience(
          async () => {
            const apiUrl = `https://graph.facebook.com/v20.0/${facebookPhoneNumberIdentifier}/messages`;
            const body = this.assembleFinalMetaBody(validatedPayload);

            const networkResponse = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${permanentAccessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(body),
            });

            if (!networkResponse.ok) {
              const errorBody = await networkResponse.json();
              throw new Error(
                `META_API_FAILURE: ${networkResponse.status} - ${JSON.stringify(errorBody)}`,
              );
            }

            const data = (await networkResponse.json()) as {
              messages: [{ id: string }];
            };
            return { messageIdentifier: data.messages[0].id };
          },
          apparatusName,
          operationName,
        );
      },
    );
  }

  /**
   * @method assembleFinalMetaBody
   * @private
   * @description Ensamblador atómico basado en el tipo de mensaje.
   */
  private static assembleFinalMetaBody(data: IMetaOutboundPayload): unknown {
    const base = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: data.recipientPhoneNumber,
      type: data.messageType,
    };

    switch (data.messageType) {
      case 'text':
        return { ...base, text: { body: data.content, preview_url: true } };

      case 'audio':
        return { ...base, audio: { id: data.content } };

      case 'interactive':
        return {
          ...base,
          interactive: MetaInteractiveApparatus.buildInteractivePayload(data),
        };

      default:
        throw new Error(
          `integrations.meta.unsupported_outbound_type: ${data.messageType}`,
        );
    }
  }
}
