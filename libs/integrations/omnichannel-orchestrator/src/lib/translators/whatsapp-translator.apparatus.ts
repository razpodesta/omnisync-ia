/** libs/integrations/omnichannel-orchestrator/src/lib/translators/whatsapp-translator.apparatus.ts */

import { TenantId, OmnisyncContracts } from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { WhatsAppRawEventSchema } from '../schemas/channel-raw-events.schema';
import { IdentityNormalizerApparatus } from '../identity-normalizer.apparatus';
import { ContentSanitizerApparatus } from '../content-sanitizer.apparatus';
import { UrgencyAnalystApparatus } from '../urgency-analyst.apparatus';
import {
  WhatsAppTranslationResultSchema,
  IWhatsAppTranslationResult,
} from '../schemas/whatsapp-translator.schema';
import {
  IOmnichannelTranslator,
  IOmnichannelTranslationResult,
  UrgencyLevelSchema,
} from '../schemas/omnichannel-translator.schema';

/**
 * @name WhatsAppTranslatorApparatus
 * @description Especialista de élite en la normalización de protocolos de WhatsApp (Meta/Evolution).
 * Transforma eventos de red amorfos en intenciones neurales inmutables cumpliendo con
 * la soberanía del contrato omnicanal global.
 *
 * @protocol OEDP-Level: Elite (Interface-Compliant & Multimodal)
 */
export class WhatsAppTranslatorApparatus implements IOmnichannelTranslator {
  /**
   * @section Soberanía de ADN
   * Esquema de validación para la captura de tráfico bruto.
   */
  public readonly rawEventSchema = WhatsAppRawEventSchema;

  /**
   * @method translate
   * @description Nodo maestro de transformación. Orquesta la purificación de identidad,
   * saneamiento de contenido y triaje de urgencia para el canal de WhatsApp.
   *
   * @param {unknown} rawPayload - Datos brutos provenientes del webhook de red.
   * @param {TenantId} tenantId - Identificador nominal del nodo suscriptor.
   * @param {string[]} localizedUrgencyKeys - Diccionario para el análisis semántico de urgencia.
   * @returns {IOmnichannelTranslationResult} Resultado validado y compatible con el Orquestador.
   */
  public translate(
    rawPayload: unknown,
    tenantId: TenantId,
    localizedUrgencyKeys: string[] = [],
  ): IOmnichannelTranslationResult {
    const apparatusName = 'WhatsAppTranslatorApparatus';
    const operationName = 'translate';

    return OmnisyncTelemetry.traceExecutionSync(
      apparatusName,
      operationName,
      () => {
        /**
         * @section 1. Validación de ADN de Red
         */
        const networkPayload = OmnisyncContracts.validate(
          this.rawEventSchema,
          rawPayload,
          `${apparatusName}:IncomingWebhook`,
        );

        /**
         * @section 2. Purificación de Identidad (Soberanía E.164)
         */
        const identityProfile =
          IdentityNormalizerApparatus.executeWhatsAppNormalization(
            networkPayload.from,
          );

        /**
         * @section 3. Saneamiento y Triaje
         */
        const sanitizedTextualContent =
          ContentSanitizerApparatus.executeSovereignSanitization(
            networkPayload.body,
          );
        const urgencyAudit = UrgencyAnalystApparatus.analyzeTextUrgency(
          sanitizedTextualContent,
          localizedUrgencyKeys,
        );

        /**
         * @section 4. Resolución de Naturaleza Multimodal
         */
        const detectedResourceType = this.resolveMultimodalResourceType(
          sanitizedTextualContent,
        );

        /**
         * @section 5. Consolidación de ADN (Mapeo de Elite)
         * RESOLUCIÓN TS2416: Se mapea el urgencyLevel explícitamente al esquema de literales.
         */
        const translationPayload: IWhatsAppTranslationResult =
          WhatsAppTranslationResultSchema.parse({
            channel: 'WHATSAPP',
            externalUserId: identityProfile.identifier,
            payload: {
              type: detectedResourceType,
              content: sanitizedTextualContent,
              metadata: {
                pushName: networkPayload.pushName ?? 'Anonymous User',
                accountType: identityProfile.accountType,
                sovereignTenantId: tenantId,
                platform: 'WHATSAPP_META_V20_PROTOCOL',
                isUrgent: urgencyAudit.isUrgent,
                /**
                 * NIVELACIÓN: Cast de seguridad al esquema de urgencia validado.
                 * Erradica el error de asignación de 'string' a 'UrgencyLevel'.
                 */
                urgencyLevel: UrgencyLevelSchema.parse(urgencyAudit.level),
                urgencyScore: urgencyAudit.score,
                matchedKeywords: urgencyAudit.matchedKeywords,
                translatedAt: new Date().toISOString(),
              },
            },
          });

        return translationPayload as IOmnichannelTranslationResult;
      },
    );
  }

  /**
   * @method resolveMultimodalResourceType
   * @private
   * @description Motor de detección de tipos basado en firmas técnicas inyectadas.
   */
  private resolveMultimodalResourceType(
    textualContent: string,
  ): IWhatsAppTranslationResult['payload']['type'] {
    const technicalSignatures: Readonly<
      Record<string, IWhatsAppTranslationResult['payload']['type']>
    > = {
      'media:audio': 'AUDIO',
      'media:image': 'IMAGE',
      'media:video': 'VIDEO',
      'media:document': 'DOCUMENT',
      'base64:audio': 'AUDIO',
      'interactive_choice:': 'INTERACTIVE',
      'geo_location:': 'LOCATION',
    };

    for (const [signature, resourceType] of Object.entries(
      technicalSignatures,
    )) {
      if (textualContent.startsWith(signature)) {
        return resourceType;
      }
    }

    return 'TEXT';
  }
}
