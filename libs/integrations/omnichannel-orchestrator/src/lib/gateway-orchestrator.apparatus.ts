/** libs/integrations/omnichannel-orchestrator/src/lib/gateway-orchestrator.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { INeuralIntent, NeuralIntentSchema, TenantId } from '@omnisync/core-contracts';

/**
 * @interface IWhatsAppRawEvent
 * @description Estructura cruda proveniente del Gateway de WhatsApp (Evolution API).
 */
interface IWhatsAppRawEvent {
  readonly from: string;
  readonly body: string;
}

/**
 * @interface IWebChatRawEvent
 * @description Estructura cruda proveniente del Socket del Web Chat Widget.
 */
interface IWebChatRawEvent {
  readonly sessionId: string;
  readonly message: string;
}

/**
 * @name GatewayOrchestrator
 * @description Aparato de élite para la unificación y normalización de canales.
 * Transforma eventos heterogéneos en Intenciones Neurales inmutables y validadas,
 * garantizando que el resto del ecosistema reciba datos íntegros bajo contrato SSOT.
 *
 * @protocol OEDP-Level: Elite (Zero Any Implementation)
 */
export class GatewayOrchestrator {
  /**
   * @method standardizeIntent
   * @description Toma un evento de red de cualquier canal y lo normaliza al estándar Omnisync.
   *
   * @param {unknown} rawEvent - El payload bruto del evento (Validado internamente).
   * @param {'WHATSAPP' | 'WEB_CHAT'} sourceChannel - El vector de comunicación de origen.
   * @param {string} tenantOrganizationIdentifier - ID de soberanía de la organización.
   * @returns {Promise<INeuralIntent>} Intención validada por Zod.
   */
  public static async standardizeIntent(
    rawEvent: unknown,
    sourceChannel: 'WHATSAPP' | 'WEB_CHAT',
    tenantOrganizationIdentifier: string
  ): Promise<INeuralIntent> {
    return await OmnisyncTelemetry.traceExecution(
      'GatewayOrchestrator',
      `standardize:${sourceChannel}`,
      async () => {
        try {
          const { externalUserId, content } = this.extractChannelData(rawEvent, sourceChannel);

          const neuralIntentPayload: Partial<INeuralIntent> = {
            id: crypto.randomUUID(),
            channel: sourceChannel,
            externalUserId,
            tenantId: tenantOrganizationIdentifier as TenantId,
            payload: {
              type: 'TEXT',
              content,
              metadata: {
                platform: sourceChannel,
                ingestedAt: new Date().toISOString()
              }
            },
            timestamp: new Date().toISOString()
          };

          return NeuralIntentSchema.parse(neuralIntentPayload);

        } catch (criticalError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-500',
            severity: 'HIGH',
            apparatus: 'GatewayOrchestrator',
            operation: 'standardization',
            message: 'Error al normalizar la entrada del canal omnicanal.',
            context: { sourceChannel, error: String(criticalError) },
            isRecoverable: true
          });
          throw criticalError;
        }
      }
    );
  }

  /**
   * @method extractChannelData
   * @private
   * @description Nodo atómico encargado del mapeo específico por tipo de canal.
   */
  private static extractChannelData(
    event: unknown,
    source: 'WHATSAPP' | 'WEB_CHAT'
  ): { externalUserId: string; content: string } {
    if (source === 'WHATSAPP') {
      const whatsappEvent = event as IWhatsAppRawEvent;
      return {
        externalUserId: whatsappEvent.from,
        content: whatsappEvent.body
      };
    }

    const webChatEvent = event as IWebChatRawEvent;
    return {
      externalUserId: webChatEvent.sessionId,
      content: webChatEvent.message
    };
  }
}
