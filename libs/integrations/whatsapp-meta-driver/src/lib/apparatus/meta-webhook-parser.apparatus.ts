/** libs/integrations/whatsapp-meta-driver/src/lib/apparatus/meta-webhook-parser.apparatus.ts */

import {
  INeuralIntent,
  NeuralIntentSchema,
  TenantId,
  OmnisyncContracts,
} from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import {
  MetaWebhookPayloadSchema,
  IMetaWebhookPayload,
  IMetaWebhookMessage,
} from '../schemas/meta-contracts.schema';

/**
 * @name MetaWebhookParserApparatus
 * @description El cerebro traductor oficial de Meta Cloud API.
 * Orquesta la transformación de eventos crudos y amorfos de WhatsApp en Intenciones
 * Neurales inmutables y validadas bajo contrato SSOT.
 *
 * @protocol OEDP-Level: Elite (Zero Any Strategy)
 */
export class MetaWebhookParserApparatus {
  /**
   * @method parseToNeuralIntents
   * @description Procesa un payload de Webhook y extrae todas las intenciones válidas.
   * Filtra automáticamente eventos de sistema (acks de lectura, entrega) para optimizar el Hub.
   *
   * @param {unknown} incomingWebhookPayload - Datos brutos recibidos por el endpoint de Meta.
   * @param {TenantId} tenantOrganizationIdentifier - Identificador nominal del nodo suscriptor.
   * @returns {INeuralIntent[]} Colección de intenciones neurales listas para orquestación.
   */
  public static parseToNeuralIntents(
    incomingWebhookPayload: unknown,
    tenantOrganizationIdentifier: TenantId,
  ): INeuralIntent[] {
    const apparatusName = 'MetaWebhookParserApparatus';

    return OmnisyncTelemetry.traceExecutionSync(
      apparatusName,
      'parseToNeuralIntents',
      () => {
        try {
          /**
           * @section Validación de ADN de Entrada
           * Erradicamos el 'any' mediante validación estricta contra el esquema expandido.
           */
          const validatedWebhook: IMetaWebhookPayload =
            OmnisyncContracts.validate(
              MetaWebhookPayloadSchema,
              incomingWebhookPayload,
              apparatusName,
            );

          const extractedNeuralIntents: INeuralIntent[] = [];

          /**
           * @section Tubería de Extracción de Mensajes
           * Navegación determinista en la estructura profunda de Meta.
           */
          for (const entry of validatedWebhook.entry) {
            for (const change of entry.changes) {
              const messages = change.value.messages;

              if (!messages || messages.length === 0) continue;

              for (const message of messages) {
                const intent = this.mapMetaMessageToNeuralIntent(
                  message,
                  tenantOrganizationIdentifier,
                  change.value.contacts?.[0]?.profile?.name ?? 'Anonymous User',
                );

                if (intent) extractedNeuralIntents.push(intent);
              }
            }
          }

          return extractedNeuralIntents;
        } catch (criticalParseError: unknown) {
          OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-500',
            severity: 'HIGH',
            apparatus: apparatusName,
            operation: 'parse_payload',
            message: 'integrations.meta.parsing_failed',
            context: { error: String(criticalParseError) },
            isRecoverable: true,
          });
          return [];
        }
      },
    );
  }

  /**
   * @method mapMetaMessageToNeuralIntent
   * @private
   * @description Mapeador de granularidad fina para transformar tipos de mensajes específicos.
   */
  private static mapMetaMessageToNeuralIntent(
    metaMessage: IMetaWebhookMessage,
    tenantId: TenantId,
    senderDisplayName: string,
  ): INeuralIntent | null {
    const messageType = metaMessage.type;

    // Configuración base de metadatos
    const baseMetadata = {
      meta_message_id: metaMessage.id,
      sender_name: senderDisplayName,
      platform: 'WHATSAPP_META_CLOUD',
    };

    /**
     * @section Resolución de Carga Útil Multimodal
     */
    let contentType: 'TEXT' | 'AUDIO' | 'IMAGE' | 'LOCATION' = 'TEXT';
    let contentValue = '';

    switch (messageType) {
      case 'text':
        contentType = 'TEXT';
        contentValue = metaMessage.text?.body ?? '';
        break;

      case 'audio':
        contentType = 'AUDIO';
        contentValue = metaMessage.audio?.id ?? '';
        break;

      case 'interactive':
        /**
         * @note Mensajería Interactiva 2026
         * Capturamos tanto el ID técnico de la selección como el texto visual.
         */
        contentType = 'TEXT';
        contentValue =
          metaMessage.interactive?.button_reply?.title ||
          metaMessage.interactive?.list_reply?.id ||
          'INTERACTIVE_RESPONSE_UNKNOWN';
        break;

      case 'button':
        contentType = 'TEXT';
        contentValue = metaMessage.button?.text || 'BUTTON_CLICKED';
        break;

      default:
        // Mensajes no soportados (ej. stickers o contactos) se descartan del flujo neural
        return null;
    }

    if (!contentValue) return null;

    return NeuralIntentSchema.parse({
      id: crypto.randomUUID(),
      channel: 'WHATSAPP',
      externalUserId: metaMessage.from,
      tenantId: tenantId,
      payload: {
        type: contentType,
        content: contentValue,
        metadata: {
          ...baseMetadata,
          raw_type: messageType,
        },
      },
      timestamp: new Date(Number(metaMessage.timestamp) * 1000).toISOString(),
    });
  }
}
