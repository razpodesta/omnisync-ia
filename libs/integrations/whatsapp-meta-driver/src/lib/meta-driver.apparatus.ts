/** libs/integrations/whatsapp-meta-driver/src/lib/meta-driver.apparatus.ts */

import {
  IWhatsAppDriver,
  INeuralIntent,
  TenantId,
} from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';

// Importación de Piezas LEGO Atómicas Niveladas
import { MetaMessagingApparatus } from './apparatus/meta-messaging.apparatus';
import { MetaPresenceApparatus } from './apparatus/meta-presence.apparatus';
import { MetaWebhookParserApparatus } from './apparatus/meta-webhook-parser.apparatus';
import { MetaVoiceSignalApparatus } from './apparatus/meta-voice-signal.apparatus';
import { IMetaWebhookPayload } from './schemas/meta-contracts.schema';

/**
 * @name MetaDriverApparatus
 * @description Orquestador maestro para la infraestructura oficial de Meta.
 * Sanado: Firma de métodos alineada con el contrato base y eliminación de errores de linter.
 *
 * @protocol OEDP-Level: Elite (Full Contract Alignment)
 */
export class MetaDriverApparatus implements IWhatsAppDriver {
  /**
   * @section Soberanía de Marca
   * Corrección ESLint: prefer-as-const
   */
  public readonly providerName = 'META_OFFICIAL' as const;

  /**
   * @constructor
   * @param {string} facebookPhoneNumberIdentifier - ID técnico del número en Meta.
   * @param {string} permanentAccessToken - Credencial soberana de sistema.
   */
  constructor(
    private readonly facebookPhoneNumberIdentifier: string,
    private readonly permanentAccessToken: string
  ) {}

  /**
   * @method sendMessage
   * @description Orquesta el envío de texto reactivo con indicadores de presencia.
   */
  public async sendMessage(
    recipientPhoneNumber: string,
    textualContent: string
  ): Promise<{ readonly messageId: string }> {
    const apparatusName = 'MetaDriverApparatus';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      'sendMessage',
      async () => {
        // 1. Pulso de Presencia (Typing Indicators)
        await MetaPresenceApparatus.emitTypingIndicator(
          this.facebookPhoneNumberIdentifier,
          this.permanentAccessToken,
          { recipientPhoneNumber, action: 'composing' }
        );

        // 2. Despacho mediante el aparato de mensajería nivelado
        const transmissionResult = await MetaMessagingApparatus.dispatchSovereignMessage(
          this.facebookPhoneNumberIdentifier,
          this.permanentAccessToken,
          {
            recipientPhoneNumber,
            messageType: 'text',
            content: textualContent
          }
        );

        // 3. Finalización de Presencia
        await MetaPresenceApparatus.emitTypingIndicator(
          this.facebookPhoneNumberIdentifier,
          this.permanentAccessToken,
          { recipientPhoneNumber, action: 'paused' }
        );

        return { messageId: transmissionResult.messageIdentifier };
      }
    );
  }

  /**
   * @method sendVoiceNote
   * @description Envía una respuesta mediante audio de voz.
   */
  public async sendVoiceNote(recipientPhoneNumber: string, mediaId: string): Promise<void> {
    await MetaMessagingApparatus.dispatchSovereignMessage(
      this.facebookPhoneNumberIdentifier,
      this.permanentAccessToken,
      {
        recipientPhoneNumber,
        messageType: 'audio',
        content: mediaId
      }
    );
  }

  /**
   * @method orchestrateVoiceCallSignal
   * @description Gestión avanzada de señalización telefónica VOIP.
   */
  public async orchestrateVoiceCallSignal(
    recipientPhoneNumber: string,
    callAction: 'START_CALL' | 'END_CALL' | 'TRANSFER' | 'REJECT'
  ): Promise<void> {
    await MetaVoiceSignalApparatus.dispatchVoiceSignal(
      this.facebookPhoneNumberIdentifier,
      this.permanentAccessToken,
      {
        callIdentifier: crypto.randomUUID(),
        recipientPhoneNumber,
        signalAction: callAction
      }
    );
  }

  /**
   * @method parseIncomingWebhook
   * @description Normaliza el evento crudo de Meta a una Intención Neural.
   * NIVELACIÓN: Firma alineada con IWhatsAppDriver (2 argumentos, retorno Array).
   */
  public parseIncomingWebhook(
    rawPayload: unknown,
    tenantOrganizationIdentifier: TenantId
  ): INeuralIntent[] {
    return MetaWebhookParserApparatus.parseToNeuralIntents(
        rawPayload as IMetaWebhookPayload,
        tenantOrganizationIdentifier
    );
  }

  /**
   * @method sendTemplate
   * @description Despacha plantillas HSM (Highly Structured Messages).
   */
  public async sendTemplate(
    recipientPhoneNumber: string,
    templateName: string,
    _languageCode: string // Nivelación ESLint: unused-vars
  ): Promise<void> {
    return await OmnisyncTelemetry.traceExecution('MetaDriver', 'sendTemplate', async () => {
        try {
            await MetaMessagingApparatus.dispatchSovereignMessage(
                this.facebookPhoneNumberIdentifier,
                this.permanentAccessToken,
                {
                    recipientPhoneNumber,
                    messageType: 'template',
                    content: templateName
                }
            );
        } catch (templateError: unknown) {
            await OmnisyncSentinel.report({
                errorCode: 'OS-INTEG-604',
                severity: 'HIGH',
                apparatus: 'MetaDriver',
                operation: 'sendTemplate',
                message: 'integrations.meta.template_failed',
                context: { templateName, error: String(templateError) }
            });
        }
    });
  }
}
