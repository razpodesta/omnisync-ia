/** apps/orchestrator-api/src/app/schemas/neural-prompt.schema.ts */

import { z } from 'zod';

/**
 * @name NeuralDialogueMessageSchema
 * @description Valida la estructura de un mensaje individual dentro del hilo de conversación.
 */
export const NeuralDialogueMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
}).readonly();

export type INeuralDialogueMessage = z.infer<typeof NeuralDialogueMessageSchema>;

/**
 * @name NeuralPromptContextSchema
 * @description Contrato para los datos requeridos en la construcción del prompt.
 */
export const NeuralPromptContextSchema = z.object({
  systemDirective: z.string().min(50),
  userCurrentQuery: z.string().min(1),
  maximumHistoryLimit: z.number().int().positive().default(8),
}).readonly();
