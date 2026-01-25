/** libs/core/contracts/src/lib/schemas/flow-orchestration.schema.ts */

import { z } from 'zod';
import { NeuralIntentSchema } from './omnichannel.schema';
import { AIResponseSchema } from './core-contracts.schema';
import { ERPActionResponseSchema } from './erp-integration.schema';

/**
 * @description Resultado consolidado del proceso neural.
 */
export const NeuralFlowResultSchema = z.object({
  intentId: z.string().uuid(),
  tenantId: z.string(),
  aiResponse: AIResponseSchema,
  erpAction: ERPActionResponseSchema.optional(),
  finalMessage: z.string(),
  executionTime: z.number(),
}).readonly();

export type INeuralFlowResult = z.infer<typeof NeuralFlowResultSchema>;