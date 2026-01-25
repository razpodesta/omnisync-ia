/** libs/core/contracts/src/lib/schemas/omnichannel.schema.ts */

import { z } from 'zod';
import { UserIdSchema, TenantIdSchema } from './core-contracts.schema';

export const ChannelTypeSchema = z.enum(['WHATSAPP', 'WEB_CHAT', 'VOICE_CALL', 'TELEGRAM']);

/**
 * @description Contrato universal para cualquier mensaje entrante al ecosistema.
 */
export const NeuralIntentSchema = z.object({
  id: z.string().uuid(),
  channel: ChannelTypeSchema,
  externalUserId: z.string(), // Número de WA o SessionID de la Web
  tenantId: TenantIdSchema,
  payload: z.object({
    type: z.enum(['TEXT', 'AUDIO', 'IMAGE', 'LOCATION']),
    content: z.string(), // Texto plano o URL del recurso multimedia
    metadata: z.record(z.string(), z.unknown()).default({}),
  }),
  timestamp: z.string().datetime(),
}).readonly();

export type INeuralIntent = z.infer<typeof NeuralIntentSchema>;