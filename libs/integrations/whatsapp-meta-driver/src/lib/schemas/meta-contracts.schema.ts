/** libs/integrations/whatsapp-meta-driver/src/lib/schemas/meta-contracts.schema.ts */

import { z } from 'zod';

/**
 * @name MetaMessageStatusSchema
 * @description Estados de entrega y lectura sincronizados con la latencia de Meta Cloud.
 */
export const MetaMessageStatusSchema = z.enum(['delivered', 'read', 'sent', 'failed', 'deleted']);

/**
 * @name MetaPresenceActionSchema
 * @description Orquesta el pulso visual (Typing Indicators) para humanizar la IA.
 */
export const MetaPresenceActionSchema = z.object({
  recipientPhoneNumber: z.string().regex(/^\d{10,15}$/, 'Formato internacional E.164 requerido.'),
  action: z.enum(['composing', 'paused', 'read']),
}).readonly();

/**
 * @name MetaMediaObjectSchema
 * @description ADN de recursos binarios capturados por el sistema.
 */
export const MetaMediaObjectSchema = z.object({
  id: z.string().min(1),
  mimeType: z.string(),
  sha256: z.string().optional(),
  fileSize: z.number().optional(),
}).readonly();

/**
 * @section Mensajería Interactiva (Next-Gen UI)
 * Contratos para botones, listas y componentes de flujo.
 */

export const MetaInteractiveButtonSchema = z.object({
  type: z.literal('reply'),
  reply: z.object({
    id: z.string(),
    title: z.string().max(20),
  }),
}).readonly();

export const MetaInteractiveListSectionSchema = z.object({
  title: z.string().max(20),
  rows: z.array(z.object({
    id: z.string(),
    title: z.string().max(24),
    description: z.string().max(72).optional(),
  })),
}).readonly();

/**
 * @section Señalización VOIP 2026
 * Contratos para la gestión de llamadas de voz integradas al orquestador neural.
 */

export const MetaVoiceCallSignalSchema = z.object({
  callIdentifier: z.string().uuid(),
  recipientPhoneNumber: z.string(),
  signalAction: z.enum(['START_CALL', 'END_CALL', 'TRANSFER', 'REJECT']),
  callMetadata: z.object({
    quality: z.enum(['HD', 'STANDARD']).default('HD'),
    encrypted: z.boolean().default(true),
  }).optional(),
}).readonly();

/**
 * @section Estructura Maestra de Webhook (SSOT)
 * Define el ADN completo del JSON entrante desde Meta para eliminar el uso de 'any'.
 */

export const MetaWebhookMessageSchema = z.object({
  from: z.string(),
  id: z.string(),
  timestamp: z.string(),
  type: z.enum(['text', 'audio', 'image', 'video', 'document', 'interactive', 'button']),
  text: z.object({ body: z.string() }).optional(),
  audio: z.object({ id: z.string(), voice: z.boolean() }).optional(),
  interactive: z.object({
    type: z.string(),
    button_reply: z.object({ id: z.string(), title: z.string() }).optional(),
    list_reply: z.object({ id: z.string(), title: z.string(), description: z.string().optional() }).optional(),
  }).optional(),
  button: z.object({ payload: z.string(), text: z.string() }).optional(),
}).readonly();

export const MetaWebhookPayloadSchema = z.object({
  object: z.literal('whatsapp_business_account'),
  entry: z.array(z.object({
    id: z.string(),
    changes: z.array(z.object({
      value: z.object({
        messaging_product: z.literal('whatsapp'),
        metadata: z.object({ display_phone_number: z.string(), phone_number_id: z.string() }),
        contacts: z.array(z.object({ profile: z.object({ name: z.string() }), wa_id: z.string() })).optional(),
        messages: z.array(MetaWebhookMessageSchema).optional(),
        statuses: z.array(z.object({ id: z.string(), status: MetaMessageStatusSchema, timestamp: z.string() })).optional(),
      }),
      field: z.literal('messages'),
    })),
  })),
}).readonly();

/**
 * @section Tipado Nominal de Élite
 */
export type IMetaPresenceAction = z.infer<typeof MetaPresenceActionSchema>;
export type IMetaMediaObject = z.infer<typeof MetaMediaObjectSchema>;
export type IMetaVoiceCallSignal = z.infer<typeof MetaVoiceCallSignalSchema>;
export type IMetaWebhookPayload = z.infer<typeof MetaWebhookPayloadSchema>;
export type IMetaWebhookMessage = z.infer<typeof MetaWebhookMessageSchema>;
