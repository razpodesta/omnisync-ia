/** libs/integrations/omnichannel-orchestrator/src/lib/translators/web-chat-translator.apparatus.ts */

import {
  INeuralIntent,
  TenantId,
  OmnisyncContracts,
} from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { WebChatRawEventSchema } from '../schemas/channel-raw-events.schema';
import { ContentSanitizerApparatus } from '../content-sanitizer.apparatus';
import { IdentityNormalizerApparatus } from '../identity-normalizer.apparatus';
import { UrgencyAnalystApparatus } from '../urgency-analyst.apparatus';
import {
  WebChatTranslationResultSchema,
  IWebChatTranslationResult,
} from '../schemas/web-chat-translator.schema';
import { IOmnichannelTranslator } from '../schemas/omnichannel-translator.schema';

/**
 * @name WebChatTranslatorApparatus
 * @description Especialista de élite en la normalización de interacciones del Widget Web.
 * Implementa la interfaz IOmnichannelTranslator mediante métodos de instancia para
 * permitir el despacho polimórfico y el triaje dinámico en el Gateway Maestro.
 *
 * @protocol OEDP-Level: Elite (Polymorphic Web-Triage)
 */
export class WebChatTranslatorApparatus implements IOmnichannelTranslator {
  /**
   * @section Soberanía de ADN
   * Resolución TS2420: Declarado como propiedad de instancia para cumplir con la interfaz.
   */
  public readonly rawEventSchema = WebChatRawEventSchema;

  /**
   * @method translate
   * @description Orquesta la validación, normalización y análisis de urgencia del tráfico web.
   * RESOLUCIÓN TS2420: Implementado como método de instancia.
   *
   * @param {unknown} rawTransmissionPayload - El payload bruto proveniente del Socket.
   * @param {TenantId} tenantId - Identificador de soberanía de la organización.
   * @param {string[]} localizedUrgencyKeys - Palabras clave inyectadas desde i18n por el orquestador.
   * @returns {IWebChatTranslationResult} Resultado validado por el esquema de traducción unificado.
   */
  public translate(
    rawTransmissionPayload: unknown,
    tenantId: TenantId,
    localizedUrgencyKeys: string[] = [],
  ): IWebChatTranslationResult {
    const apparatusName = 'WebChatTranslatorApparatus';

    return OmnisyncTelemetry.traceExecutionSync(
      apparatusName,
      'translate',
      () => {
        /**
         * @section 1. Validación de Entrada (ADN de Red)
         */
        const rawEvent = OmnisyncContracts.validate(
          this.rawEventSchema,
          rawTransmissionPayload,
          `${apparatusName}:IncomingNetworkPayload`,
        );

        // 2. Normalización de Identidad (Soberanía de Sesión Browser)
        const identity =
          IdentityNormalizerApparatus.executeGenericNormalization(
            rawEvent.sessionId,
            'WEB_CHAT',
          );

        // 3. Saneamiento de Contenido (Blindaje Unicode-Native)
        const cleanContent =
          ContentSanitizerApparatus.executeSovereignSanitization(
            rawEvent.message,
          );

        /**
         * @section 4. Fase de Triaje Lingüístico
         * Detectamos el pulso emocional y de urgencia del usuario web.
         */
        const urgencyReport = UrgencyAnalystApparatus.analyzeTextUrgency(
          cleanContent,
          localizedUrgencyKeys,
        );

        /**
         * @section 5. Consolidación de ADN Maestro (Type Safe Enforcement)
         * RESOLUCIÓN ESLINT: Se utiliza 'IWebChatTranslationResult' para el retorno.
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
              /**
               * @note Inyección de Métrica de Criticidad
               */
              urgencyLevel: urgencyReport.level,
              urgencyScore: urgencyReport.score,
              isUrgent: urgencyReport.isUrgent,
              matchedKeywords: urgencyReport.matchedKeywords,
              translatedAt: new Date().toISOString(),
            },
          },
        };

        /**
         * @section 6. Sello de Integridad de Salida (SSOT)
         */
        return OmnisyncContracts.validate(
          WebChatTranslationResultSchema,
          translationPayload,
          apparatusName,
        ) as IWebChatTranslationResult;
      },
    );
  }
}
