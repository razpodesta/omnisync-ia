/** libs/core/contracts/src/lib/schemas/knowledge.schema.ts */

import { z } from 'zod';
import { TenantIdSchema } from './core-contracts.schema';

export const KnowledgeChunkSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(10),
  sourceName: z.string().min(1),
  sourceUrl: z.string().url().optional(),
  pageNumber: z.number().int().positive().optional(),
  tenantId: TenantIdSchema,
  metadata: z.record(z.string(), z.unknown()).default({}),
}).readonly();

export type IKnowledgeChunk = z.infer<typeof KnowledgeChunkSchema>;

export const SemanticSearchResultSchema = z.object({
  chunks: z.array(KnowledgeChunkSchema),
  relevanceScore: z.number().min(0).max(1),
  latencyInMilliseconds: z.number(),
}).readonly();

export type ISemanticSearchResult = z.infer<typeof SemanticSearchResultSchema>;