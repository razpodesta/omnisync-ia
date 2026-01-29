/** libs/integrations/omnichannel-orchestrator/src/lib/schemas/whatsapp-translator.schema.ts */

import { z } from 'zod';
import { TenantIdSchema } from '@omnisync/core-contracts';
import { UrgencyLevelSchema } from './omnichannel-translator.schema';

export const WhatsAppTranslationResultSchema = z
  .object({
    channel: z.literal('WHATSAPP'),
    externalUserId: z.string().min(5),
    payload: z.object({
      type: z.enum([
        'TEXT',
        'AUDIO',
        'IMAGE',
        'VIDEO',
        'DOCUMENT',
        'INTERACTIVE',
        'LOCATION',
      ]),
      content: z.string().min(1),
      metadata: z
        .object({
          pushName: z.string(),
          accountType: z.enum([
            'INDIVIDUAL',
            'GROUP',
            'SYSTEM',
            'BOT',
            'UNKNOWN',
          ]),
          sovereignTenantId: TenantIdSchema,
          platform: z.string(),
          urgencyLevel: UrgencyLevelSchema.optional(), // SINCRONIZADO
          urgencyScore: z.number().optional(),
          isUrgent: z.boolean().optional(),
          matchedKeywords: z.array(z.string()).optional(),
          translatedAt: z.string().datetime(),
        })
        .catchall(z.unknown()),
    }),
  })
  .readonly();

export type IWhatsAppTranslationResult = z.infer<
  typeof WhatsAppTranslationResultSchema
>;
