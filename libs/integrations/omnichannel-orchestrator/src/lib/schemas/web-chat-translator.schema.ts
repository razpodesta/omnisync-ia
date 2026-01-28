/** libs/integrations/omnichannel-orchestrator/src/lib/schemas/web-chat-translator.schema.ts */

import { z } from 'zod';
import { TenantIdSchema } from '@omnisync/core-contracts';

/**
 * @name WebChatTranslationResultSchema
 * @description Contrato maestro para la salida del traductor de Web Chat.
 * Asegura que los datos del navegador y la sesión sean íntegros.
 */
export const WebChatTranslationResultSchema = z.object({
  channel: z.literal('WEB_CHAT'),
  externalUserId: z.string().uuid(), // En web, la identidad es un UUID de sesión
  payload: z.object({
    type: z.literal('TEXT'), // El widget web actual solo soporta texto
    content: z.string().min(1),
    metadata: z.object({
      sovereignTenantId: TenantIdSchema,
      origin: z.string(),
      browserContext: z.record(z.string(), z.unknown()).default({}),
      translatedAt: z.string().datetime(),
    }),
  }),
}).readonly();

export type IWebChatTranslationResult = z.infer<typeof WebChatTranslationResultSchema>;