/** libs/integrations/whatsapp-meta-driver/src/lib/schemas/messaging/meta-messaging.schema.ts */

import { z } from 'zod';
import {
  MetaInteractiveButtonSchema,
  MetaInteractiveListSectionSchema,
} from '../meta-contracts.schema';

/**
 * @name MetaOutboundPayloadSchema
 * @description Define la estructura universal para mensajes salientes hacia Meta Cloud API.
 * Soporta Texto, Media e Interacción.
 */
export const MetaOutboundPayloadSchema = z
  .object({
    recipientPhoneNumber: z.string().regex(/^\d{10,15}$/),
    messageType: z.enum([
      'text',
      'audio',
      'image',
      'video',
      'document',
      'interactive',
      'template',
    ]),
    content: z.string().min(1), // Puede ser el cuerpo del texto o un ID de media
    interactiveData: z
      .object({
        headerText: z.string().max(60).optional(),
        footerText: z.string().max(60).optional(),
        buttons: z.array(MetaInteractiveButtonSchema).max(3).optional(),
        sections: z.array(MetaInteractiveListSectionSchema).max(10).optional(),
        buttonLabel: z.string().max(20).optional(), // Para menús de lista
      })
      .optional(),
  })
  .readonly();

export type IMetaOutboundPayload = z.infer<typeof MetaOutboundPayloadSchema>;
