/** libs/integrations/omnichannel-orchestrator/src/lib/schemas/whatsapp-translator.schema.ts */

import { z } from 'zod';
import { TenantIdSchema } from '@omnisync/core-contracts';

/**
 * @name WhatsAppTranslationResultSchema
 * @description Contrato inmutable para la salida del traductor de WhatsApp.
 * Asegura que los metadatos y el tipo de carga útil sean íntegros antes del Hub Neural.
 */
export const WhatsAppTranslationResultSchema = z.object({
  channel: z.literal('WHATSAPP'),
  externalUserId: z.string().min(5),
  payload: z.object({
    type: z.enum(['TEXT', 'AUDIO', 'IMAGE', 'VIDEO', 'DOCUMENT', 'INTERACTIVE']),
    content: z.string().min(1),
    metadata: z.object({
      pushName: z.string(),
      accountType: z.enum(['INDIVIDUAL', 'GROUP', 'SYSTEM', 'BOT', 'UNKNOWN']),
      sovereignTenantId: TenantIdSchema,
      platform: z.string(),
      isForwarded: z.boolean().default(false),
      translatedAt: z.string().datetime(),
    }),
  }),
}).readonly();

export type IWhatsAppTranslationResult = z.infer<typeof WhatsAppTranslationResultSchema>;