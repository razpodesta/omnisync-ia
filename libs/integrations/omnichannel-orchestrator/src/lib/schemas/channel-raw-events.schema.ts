/** libs/integrations/omnichannel-orchestrator/src/lib/schemas/channel-raw-events.schema.ts */

import { z } from 'zod';

/**
 * @name WhatsAppRawEventSchema
 * @description Valida la estructura cruda proveniente de Evolution API / Meta.
 */
export const WhatsAppRawEventSchema = z.object({
  from: z.string().min(8).regex(/^\d+$/, 'Formato de origen inválido'),
  body: z.string().min(1),
  pushName: z.string().optional(),
}).readonly();

export type IWhatsAppRawEvent = z.infer<typeof WhatsAppRawEventSchema>;

/**
 * @name WebChatRawEventSchema
 * @description Valida la estructura cruda proveniente de los Sockets del Widget.
 */
export const WebChatRawEventSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1),
  browserContext: z.record(z.string(), z.unknown()).optional(),
}).readonly();

export type IWebChatRawEvent = z.infer<typeof WebChatRawEventSchema>;
