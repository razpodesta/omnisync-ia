/** libs/integrations/omnichannel-orchestrator/src/lib/identity-normalizer.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import {
  INormalizedIdentity,
  NormalizedIdentitySchema,
} from './schemas/identity-normalizer.schema';

/**
 * @name IdentityNormalizerApparatus
 * @description Aparato de élite encargado de la purificación de identidades.
 * Actúa como un filtro de soberanía que extrae el identificador real (Core ID)
 * de los protocolos propietarios de cada canal (Meta, Telegram, Browser).
 *
 * @protocol OEDP-Level: Elite (Strategy-Based Normalization)
 */
export class IdentityNormalizerApparatus {
  /**
   * @private
   * Patrones de red inmutables para WhatsApp
   */
  private static readonly WHATSAPP_SUFFIXES = {
    USER: '@s.whatsapp.net',
    GROUP: '@g.us',
    BROADCAST: 'status@broadcast',
  } as const;

  /**
   * @method executeWhatsAppNormalization
   * @description Especialista en la limpieza de JIDs de WhatsApp a formato E.164.
   *
   * @param {string} rawWhatsAppIdentifier - Identificador crudo (ej: 12345@s.whatsapp.net).
   * @returns {INormalizedIdentity} Identidad validada y categorizada.
   */
  public static executeWhatsAppNormalization(
    rawWhatsAppIdentifier: string,
  ): INormalizedIdentity {
    const apparatusName = 'IdentityNormalizerApparatus';

    return OmnisyncTelemetry.traceExecutionSync(
      apparatusName,
      'normalizeWhatsApp',
      () => {
        const isGroupIdentifier = rawWhatsAppIdentifier.includes(
          this.WHATSAPP_SUFFIXES.GROUP,
        );
        const isSystemBroadcast = rawWhatsAppIdentifier.includes(
          this.WHATSAPP_SUFFIXES.BROADCAST,
        );

        // Limpieza quirúrgica de sufijos y caracteres no numéricos
        const cleanIdentifier = rawWhatsAppIdentifier
          .replace(this.WHATSAPP_SUFFIXES.USER, '')
          .replace(this.WHATSAPP_SUFFIXES.GROUP, '')
          .replace(/\D/g, '');

        return NormalizedIdentitySchema.parse({
          identifier: cleanIdentifier,
          accountType: isGroupIdentifier
            ? 'GROUP'
            : isSystemBroadcast
              ? 'SYSTEM'
              : 'INDIVIDUAL',
          sourceChannel: 'WHATSAPP',
          isPotentiallyValidPhone:
            cleanIdentifier.length >= 8 && cleanIdentifier.length <= 15,
          networkMetadata: {
            originalJid: rawWhatsAppIdentifier,
            hasSuffix: rawWhatsAppIdentifier.includes('@'),
          },
        });
      },
    );
  }

  /**
   * @method executeGenericNormalization
   * @description Normaliza identidades de canales basados en UUID o Sockets (Web Chat).
   */
  public static executeGenericNormalization(
    rawIdentifier: string,
    channel: 'WEB_CHAT' | 'TELEGRAM',
  ): INormalizedIdentity {
    const apparatusName = 'IdentityNormalizerApparatus';

    return OmnisyncTelemetry.traceExecutionSync(
      apparatusName,
      `normalizeGeneric:${channel}`,
      () => {
        const cleanIdentifier = rawIdentifier.trim().toLowerCase();

        return NormalizedIdentitySchema.parse({
          identifier: cleanIdentifier,
          accountType: 'INDIVIDUAL',
          sourceChannel: channel,
          isPotentiallyValidPhone: false, // IDs de socket no son teléfonos
          networkMetadata: { normalizedAt: new Date().toISOString() },
        });
      },
    );
  }
}
