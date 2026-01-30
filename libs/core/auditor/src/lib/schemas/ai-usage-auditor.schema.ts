/** libs/core/auditor/src/lib/schemas/ai-usage-auditor.schema.ts */

import { z } from 'zod';
import { TenantIdSchema } from '@omnisync/core-contracts';

/**
 * @name AIUsageAuditRecordSchema
 * @description Contrato maestro para el registro de consumo de IA. 
 * Define la estructura inmutable para la persistencia financiera.
 */
export const AIUsageAuditRecordSchema = z.object({
  id: z.string().uuid(),
  tenantId: TenantIdSchema,
  traceId: z.string().uuid(),
  modelIdentifier: z.string(),
  usageMetrics: z.object({
    inputTokens: z.number().nonnegative(),
    outputTokens: z.number().nonnegative(),
    totalTokens: z.number().nonnegative(),
  }),
  estimatedCostUsd: z.number().nonnegative(),
  timestamp: z.string().datetime(),
}).readonly();

export type IAIUsageAuditRecord = z.infer<typeof AIUsageAuditRecordSchema>;