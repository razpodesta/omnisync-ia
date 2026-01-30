/** libs/ui-kit/web-chat-widget/src/lib/schemas/web-chat-widget.schema.ts */

import { z } from 'zod';
import { TenantIdSchema } from '@omnisync/core-contracts';

/**
 * @name DialogueMessageSchema
 * @description Valida un turno de conversación individual.
 */
export const DialogueMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
}).readonly();

/**
 * @name WebChatConfigurationSchema
 * @description Contrato de configuración para el aparato del widget.
 */
export const WebChatConfigurationSchema = z.object({
  tenantId: TenantIdSchema,
  initialAutoExpand: z.boolean().default(false),
  visualSovereignty: z.enum(['OBSIDIAN', 'MILK']).default('OBSIDIAN'),
}).readonly();

export type IDialogueMessage = z.infer<typeof DialogueMessageSchema>;
export type IWebChatConfiguration = z.infer<typeof WebChatConfigurationSchema>;
