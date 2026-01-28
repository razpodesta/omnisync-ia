/** libs/core/contracts/src/lib/schemas/whatsapp-integration.schema.ts */

import { z } from 'zod';

/**
 * @section Importación de ADN Soberano
 * Se importan directamente desde los silos para evitar dependencias circulares
 * con el index.ts de la librería core-contracts.
 */
import { TenantId } from './core-contracts.schema';
import { INeuralIntent } from './omnichannel.schema';

/**
 * @name WhatsAppConversationCategorySchema
 * @description Define las categorías de Meta para la tarificación y prioridad.
 */
export const WhatsAppConversationCategorySchema = z.enum([
  'UTILITY',
  'MARKETING',
  'AUTHENTICATION',
  'SERVICE'
]);

/**
 * @name IWhatsAppDriver
 * @description Interfaz de contrato universal para los conectores de WhatsApp.
 * Garantiza que tanto el Driver de Meta como el de Evolution cumplan con la
 * inyección de soberanía y la normalización multimodal.
 *
 * @protocol OEDP-Level: Elite (Circular-Safe Contract)
 */
export interface IWhatsAppDriver {
  /** Nombre técnico del proveedor inyectado */
  readonly providerName: 'META_OFFICIAL' | 'EVOLUTION_COMMUNITY';

  /**
   * @method sendMessage
   * @description Envía un mensaje de texto reactivo validado por el orquestador.
   */
  sendMessage(
    recipientPhoneNumber: string,
    textualContent: string
  ): Promise<{ readonly messageId: string }>;

  /**
   * @method sendTemplate
   * @description Envía plantillas oficiales (HSM) fuera de la ventana de 24h.
   */
  sendTemplate(
    recipientPhoneNumber: string,
    templateNameIdentifier: string,
    languageCode: string
  ): Promise<void>;

  /**
   * @method parseIncomingWebhook
   * @description Normaliza el flujo de red entrante a un lote de Intenciones Neurales.
   * NIVELACIÓN: Sanación de Error TS2307 y alineación multi-argumento.
   *
   * @param {unknown} networkPayload - Datos brutos de la petición HTTP.
   * @param {TenantId} tenantOrganizationIdentifier - Sello de soberanía del nodo.
   */
  parseIncomingWebhook(
    networkPayload: unknown,
    tenantOrganizationIdentifier: TenantId
  ): INeuralIntent[];
}
