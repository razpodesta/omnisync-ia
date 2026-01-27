/** libs/core/contracts/src/lib/schemas/whatsapp-integration.schema.ts */

import { z } from 'zod';

/**
 * @name WhatsAppConversationCategorySchema
 * @description Define las categorías de Meta para la tarificación y prioridad de mensajes.
 */
export const WhatsAppConversationCategorySchema = z.enum([
  'UTILITY',
  'MARKETING',
  'AUTHENTICATION',
  'SERVICE'
]);

/**
 * @name WhatsAppMessageStatusSchema
 * @description Estados inmutables siguiendo el webhook de WhatsApp Cloud API.
 */
export const WhatsAppMessageStatusSchema = z.enum([
  'SENT',
  'DELIVERED',
  'READ',
  'FAILED',
  'DELETED'
]);

/**
 * @name IWhatsAppDriver
 * @description Interfaz de contrato que deben implementar ambos drivers (Meta y Evolution).
 */
export interface IWhatsAppDriver {
  readonly providerName: 'META_OFFICIAL' | 'EVOLUTION_COMMUNITY';

  /** Envía un mensaje de texto plano o reactivo */
  sendMessage(to: string, content: string): Promise<{ messageId: string }>;

  /** Envía una plantilla aprobada (Requerido para Meta tras ventana de 24h) */
  sendTemplate(to: string, templateName: string, languageCode: string): Promise<void>;

  /** Normaliza el webhook entrante al formato INeuralIntent */
  parseIncomingWebhook(payload: unknown): unknown;
}
