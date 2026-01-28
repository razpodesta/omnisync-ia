/** libs/integrations/whatsapp-meta-driver/src/lib/apparatus/meta-presence.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { IMetaPresenceAction, MetaPresenceActionSchema } from '../schemas/meta-contracts.schema';

/**
 * @name MetaPresenceApparatus
 * @description Aparato especializado en la señalización de estado en tiempo real.
 * Orquesta los eventos de 'composing' (escribiendo) y 'read' (visto) para
 * maximizar la percepción de fluidez en la interfaz del usuario final.
 *
 * @protocol OEDP-Level: Elite (UI/UX Real-time)
 */
export class MetaPresenceApparatus {

  /**
   * @method emitTypingIndicator
   * @description Activa o desactiva los indicadores de escritura en la app de WhatsApp.
   */
  public static async emitTypingIndicator(
    facebookBusinessId: string,
    accessToken: string,
    presenceAction: IMetaPresenceAction
  ): Promise<void> {
    const apparatusName = 'MetaPresenceApparatus';
    const operationName = 'emitTypingIndicator';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        // Validación de ADN de entrada
        const validatedPresence = MetaPresenceActionSchema.parse(presenceAction);

        try {
          const metaApiUrl = `https://graph.facebook.com/v20.0/${facebookBusinessId}/messages`;

          await fetch(metaApiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: validatedPresence.recipientPhoneNumber,
              /**
               * @note Protocolo de Presencia Meta 2026
               * 'composing' activa la animación de escritura.
               */
              sender_action: validatedPresence.action
            })
          });

          OmnisyncTelemetry.verbose(apparatusName, 'signal_sent', `Status ${validatedPresence.action} enviado a ${validatedPresence.recipientPhoneNumber}`);

        } catch (signalError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-404',
            severity: 'LOW',
            apparatus: apparatusName,
            operation: operationName,
            message: 'integrations.meta.presence_failed',
            context: { error: String(signalError) }
          });
        }
      }
    );
  }
}
