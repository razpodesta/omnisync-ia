/** libs/integrations/omnichannel-orchestrator/src/lib/persistence/schemas/context-memory.schema.ts */

import { z } from 'zod';

/**
 * @name ContextLayerSchema
 * @description Define la jerarquía de importancia del mensaje para el Pruning.
 */
export const ContextLayerSchema = z.enum(['SYSTEM_DIRECTIVE', 'EPISODIC_MEMORY', 'WORKING_CONTEXT']);

export const ConversationFragmentSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
  layer: ContextLayerSchema.default('WORKING_CONTEXT'),
  sentiment: z.enum(['NEUTRAL', 'POSITIVE', 'NEGATIVE', 'URGENT']).default('NEUTRAL'),
  timestamp: z.string().datetime(),
  tokenWeight: z.number().int().nonnegative(),
  /** Metadatos para el Dashboard de Contextos */
  metadata: z.object({
    isPinned: z.boolean().default(false),
    agentId: z.string().optional(),
    instructionVersion: z.string().optional()
  }).optional()
}).readonly();

export type IConversationFragment = z.infer<typeof ConversationFragmentSchema>;