/** libs/integrations/vector-engine/src/lib/knowledge-ingestor/schemas/knowledge-ingestor.schema.ts */

import { z } from 'zod';
import { TenantIdSchema } from '@omnisync/core-contracts';

/**
 * @name KnowledgeIngestionPipelineSchema
 * @description Contrato maestro para la ejecución del pipeline de transformación
 * de conocimiento. Asegura que el ADN técnico sea procesable antes de la vectorización.
 */
export const KnowledgeIngestionPipelineSchema = z
  .object({
    rawContent: z.string().min(100, {
      message: 'integrations.vector_engine.errors.content_too_short',
    }),
    documentTitle: z.string().min(5).max(255),
    tenantOrganizationIdentifier: TenantIdSchema,
  })
  .readonly();

export type IKnowledgeIngestionPipeline = z.infer<
  typeof KnowledgeIngestionPipelineSchema
>;
