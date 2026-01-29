/** libs/integrations/omnichannel-orchestrator/src/lib/persistence/schemas/context-memory.schema.ts */

import { z } from 'zod';

/**
 * @name ConversationFragmentSchema
 * @description Define un átomo de memoria con metadatos de "humanización".
 */
export const ConversationFragmentSchema = z
  .object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1),
    /**
     * Metadatos de Sentimiento: Permite que la IA sepa si el usuario está
     * frustrado o satisfecho para ajustar el tono (Fase 3).
     */
    sentiment: z
      .enum(['NEUTRAL', 'POSITIVE', 'NEGATIVE', 'URGENT'])
      .default('NEUTRAL'),
    timestamp: z.string().datetime(),
    /** Tokens estimados para control de ventana de contexto */
    tokenWeight: z.number().int().nonnegative().optional(),
  })
  .readonly();

export type IConversationFragment = z.infer<typeof ConversationFragmentSchema>;
