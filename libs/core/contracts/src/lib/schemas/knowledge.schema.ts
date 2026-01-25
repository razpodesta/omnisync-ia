/** libs/core/contracts/src/lib/schemas/knowledge.schema.ts */
import { z } from 'zod';
import { TenantIdSchema } from './core-contracts.schema';

export const KnowledgeCategorySchema = z.enum(['TECHNICAL', 'COMMERCIAL', 'ADMINISTRATIVE', 'LEGAL']);

/**
 * @description Estructura enriquecida para un documento de conocimiento.
 */
export const KnowledgeDocumentSchema = z.object({
  id: z.string().uuid(),
  tenantId: TenantIdSchema,
  title: z.string().min(5),
  category: KnowledgeCategorySchema,
  tags: z.array(z.string()).default([]),
  rawContent: z.string().min(100), // El texto limpio extraído
  metadata: z.object({
    author: z.string().optional(),
    version: z.string().default('1.0.0'),
    relevanceWeight: z.number().min(0).max(1).default(1.0),
  }),
  processedAt: z.string().datetime(),
}).readonly();

export type IKnowledgeDocument = z.infer<typeof KnowledgeDocumentSchema>;