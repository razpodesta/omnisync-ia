/** libs/integrations/whatsapp-evolution-driver/src/lib/schemas/whatsapp-evolution-driver.schema.ts */

import { z } from 'zod';

/**
 * @name EvolutionWebhookPayloadSchema
 * @description Valida la estructura cruda de Evolution API v2.
 * Erradica el uso de 'any' en el pipeline de mensajería.
 */
export const EvolutionWebhookPayloadSchema = z.object({
  event: z.string(),
  instance: z.string(),
  data: z.object({
    key: z.object({
      remoteJid: z.string().includes('@s.whatsapp.net'),
      fromMe: z.boolean(),
      id: z.string(),
    }),
    pushName: z.string().optional(),
    message: z.object({
      conversation: z.string().optional(),
      extendedTextMessage: z.object({
        text: z.string().optional()
      }).optional()
    }).optional(),
    messageType: z.string().optional(),
  }).optional(),
}).readonly();

/**
 * @name EvolutionDriverConfigSchema
 * @description Valida el ADN de conexión para el driver.
 */
export const EvolutionDriverConfigSchema = z.object({
  instanceUrl: z.string().url(),
  apiKey: z.string().min(10),
  instanceName: z.string().min(2),
}).readonly();

export type IEvolutionWebhookPayload = z.infer<typeof EvolutionWebhookPayloadSchema>;
export type IEvolutionDriverConfig = z.infer<typeof EvolutionDriverConfigSchema>;