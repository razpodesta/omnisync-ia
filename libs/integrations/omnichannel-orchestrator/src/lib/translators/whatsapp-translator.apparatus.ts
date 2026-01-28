/** libs/integrations/omnichannel-orchestrator/src/lib/translators/whatsapp-translator.apparatus.ts */

import { INeuralIntent, TenantId, OmnisyncContracts } from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { IWhatsAppRawEvent, WhatsAppRawEventSchema } from '../schemas/channel-raw-events.schema';
import { IdentityNormalizerApparatus } from '../identity-normalizer.apparatus';
import { ContentSanitizerApparatus } from '../content-sanitizer.apparatus';
import { WhatsAppTranslationResultSchema, IWhatsAppTranslationResult } from '../schemas/whatsapp-translator.schema';

/**
 * @name WhatsAppTranslatorApparatus
 * @description Especialista de élite en la normalización de protocolos de mensajería móvil.
 * Transforma eventos brutos de Gateways (Evolution/Meta) en ADN Neural Omnisync.
 * Implementa clasificación multimodal avanzada y proporciona soberanía de contrato 
 * para validación en frontera (Zero-Trust).
 * 
 * @protocol OEDP-Level: Elite (Contract-Driven & Multimodal)
 */
export class WhatsAppTranslatorApparatus {

  /** 
   * @property rawEventSchema
   * @description Expone el esquema de validación de red para que el Orquestador Maestro
   * verifique la integridad del payload antes de invocar la traducción.
   */
  public static readonly rawEventSchema = WhatsAppRawEventSchema;

  /**
   * @method translate
   * @description Orquesta la transformación del evento aplicando soberanía de identidad,
   * saneamiento de contenido y validación de contrato SSOT.
   * 
   * @param {IWhatsAppRawEvent} rawEvent - Evento capturado y validado por el orquestador.
   * @param {TenantId} tenantId - Identificador nominal de la organización.
   * @returns {IWhatsAppTranslationResult} Resultado validado por el esquema de traducción.
   */
  public static translate(
    rawEvent: IWhatsAppRawEvent, 
    tenantId: TenantId
  ): IWhatsAppTranslationResult {
    const apparatusName = 'WhatsAppTranslatorApparatus';

    return OmnisyncTelemetry.traceExecutionSync(apparatusName, 'translate', () => {
      
      // 1. Fase de Identidad: Sincronización con el Normalizador de Próxima Generación
      const identity = IdentityNormalizerApparatus.executeWhatsAppNormalization(rawEvent.from);
      
      // 2. Fase de Contenido: Saneamiento de blindaje Unicode (Linter-Proof)
      const cleanContent = ContentSanitizerApparatus.executeSovereignSanitization(rawEvent.body);

      // 3. Fase de Clasificación: Resolución de naturaleza multimodal (AUDIO, IMAGE, etc.)
      const messageType = this.resolveMultimodalType(cleanContent);

      /**
       * @section Fase de Enriquecimiento (Heurísticos)
       * Detectamos el pulso de urgencia inicial para priorizar en el orquestador forense.
       */
      const isUrgent = this.detectUrgencyPulse(cleanContent);

      /**
       * @section Consolidación de ADN (Type Safe Enforcement)
       */
      const translationPayload: Partial<INeuralIntent> = {
        channel: 'WHATSAPP',
        externalUserId: identity.identifier,
        tenantId: tenantId, 
        payload: {
          type: messageType,
          content: cleanContent,
          metadata: {
            pushName: rawEvent.pushName ?? 'Anonymous User',
            accountType: identity.accountType,
            sovereignTenantId: tenantId,
            platform: 'WHATSAPP_META_V20_PROTOCOL',
            urgencyDetected: isUrgent,
            translatedAt: new Date().toISOString()
          }
        }
      };

      /**
       * @section Sello de Integridad del Resultado
       * Validamos que la salida cumpla estrictamente con el contrato de traducción.
       */
      return OmnisyncContracts.validate(
        WhatsAppTranslationResultSchema, 
        translationPayload, 
        apparatusName
      );
    });
  }

  /**
   * @method resolveMultimodalType
   * @private
   * @description Motor de detección de firmas para clasificación de recursos.
   */
  private static resolveMultimodalType(content: string): IWhatsAppTranslationResult['payload']['type'] {
    // Firmas técnicas de Gateways (Fase 1: Patrones de String)
    const signatures: Record<string, IWhatsAppTranslationResult['payload']['type']> = {
      'media:audio': 'AUDIO',
      'media:image': 'IMAGE',
      'media:video': 'VIDEO',
      'media:document': 'DOCUMENT',
      'base64:audio': 'AUDIO',
      'btn_choice:': 'INTERACTIVE'
    };

    for (const [signature, type] of Object.entries(signatures)) {
      if (content.includes(signature)) return type;
    }

    return 'TEXT';
  }

  /**
   * @method detectUrgencyPulse
   * @private
   * @description Heurístico de primer nivel para detectar prioridades operativas.
   */
  private static detectUrgencyPulse(content: string): boolean {
    const urgencyKeywords = ['urgente', 'ahora', 'auxilio', 'fallo', 'error', 'emergency'];
    const lowerContent = content.toLowerCase();
    return urgencyKeywords.some(keyword => lowerContent.includes(keyword));
  }
}