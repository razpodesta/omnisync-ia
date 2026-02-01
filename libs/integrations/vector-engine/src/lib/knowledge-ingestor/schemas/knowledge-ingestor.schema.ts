/** libs/integrations/vector-engine/src/lib/knowledge-ingestor/schemas/knowledge-ingestor.schema.ts */

import { z } from 'zod';
import { TenantIdSchema } from '@omnisync/core-contracts';

export const KnowledgeIngestionPhaseSchema = z.enum([
  'INITIAL_VALIDATION',
  'COGNITIVE_TRIAGE',
  'SEMANTIC_FRAGMENTATION',
  'VECTOR_GENERATION',
  'RELATIONAL_SYNC',
  'CLOUD_PERSISTENCE',
  'COMPLETED'
]);

/**
 * @name KnowledgeIngestionProgressSchema
 * @description Sella el rastro biyectivo de la ingesta para la UI reactiva.
 */
export const KnowledgeIngestionProgressSchema = z.object({
  ingestionIdentifier: z.string().uuid(),
  currentPhase: KnowledgeIngestionPhaseSchema,
  completionPercentage: z.number().min(0).max(100),
  statusMessageKey: z.string(),
  /** Visión Ojos de Mosca: Auditoría Financiera y Técnica */
  metrics: z.object({
    accumulatedLatencyMs: z.number(),
    calculatedTokenCostUsd: z.number(),
    chunksGenerated: z.number().int(),
    batchIntegritySeal: z.string().min(64),
  }).optional(),
  timestamp: z.string().datetime(),
}).readonly();

export type IKnowledgeIngestionProgress = z.infer<typeof KnowledgeIngestionProgressSchema>;