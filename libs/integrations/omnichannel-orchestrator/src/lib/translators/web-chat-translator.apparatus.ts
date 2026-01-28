/** libs/integrations/omnichannel-orchestrator/src/lib/translators/web-chat-translator.apparatus.ts */

import { INeuralIntent, TenantId, OmnisyncContracts } from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { IWebChatRawEvent, WebChatRawEventSchema } from '../schemas/channel-raw-events.schema';
import { ContentSanitizerApparatus } from '../content-sanitizer.apparatus';
import { IdentityNormalizerApparatus } from '../identity-normalizer.apparatus';
import { WebChatTranslationResultSchema, IWebChatTranslationResult } from '../schemas/web-chat-translator.schema';

/**
 * @name WebChatTranslatorApparatus
 * @description Especialista en la normalización de interacciones provenientes del Widget Web.
 * Transforma eventos de Socket en ADN Neural Omnisync, aplicando blindaje de contenido
 * y validación de contrato SSOT.
 * 
 * @protocol OEDP-Level: Elite (Contract-Driven Translation)
 */
export class WebChatTranslatorApparatus {

  /** 
   * @property rawEventSchema
   * @description Expone el contrato de entrada para que el Orquestador valide 
   * el payload de red antes de procesarlo. (Estrategia Zero-Trust).
   */
  public static readonly rawEventSchema = WebChatRawEventSchema;

  /**
   * @method translate
   * @description Orquesta la transformación del evento web a una intención neural.
   * 
   * @param {IWebChatRawEvent} rawEvent - Evento capturado y ya validado por el orquestador.
   * @param {TenantId} tenantId - Identificador de soberanía de la organización.
   * @returns {IWebChatTranslationResult} Resultado validado por el esquema de traducción.
   */
  public static translate(
    rawEvent: IWebChatRawEvent,
    tenantId: TenantId
  ): IWebChatTranslationResult {
    const apparatusName = 'WebChatTranslatorApparatus';

    return OmnisyncTelemetry.traceExecutionSync(apparatusName, 'translate', () => {
      
      // 1. Normalización de Identidad (UUID Session)
      const identity = IdentityNormalizerApparatus.executeGenericNormalization(rawEvent.sessionId, 'WEB_CHAT');

      // 2. Saneamiento de Contenido (Unicode-Native)
      const cleanContent = ContentSanitizerApparatus.executeSovereignSanitization(rawEvent.message);

      /**
       * @section Consolidación de ADN (Type Safe Enforcement)
       */
      const translationPayload: Partial<INeuralIntent> = {
        channel: 'WEB_CHAT',
        externalUserId: identity.identifier,
        tenantId: tenantId,
        payload: {
          type: 'TEXT',
          content: cleanContent,
          metadata: {
            browserContext: rawEvent.browserContext ?? {},
            sovereignTenantId: tenantId,
            origin: 'WEB_WIDGET_INTERFACE',
            translatedAt: new Date().toISOString()
          }
        }
      };

      // Validación final de soberanía del resultado
      return OmnisyncContracts.validate(
        WebChatTranslationResultSchema,
        translationPayload,
        apparatusName
      );
    });
  }
}