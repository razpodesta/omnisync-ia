/** apps/admin-dashboard/src/app/[locale]/knowledge/schemas/knowledge-ingestion.schema.ts */

import { z } from 'zod';
import { KnowledgeOrganizationCategorySchema } from '@omnisync/core-contracts';

/**
 * @name KnowledgeIngestionSchema
 * @description Contrato maestro para la validación de ADN técnico corporativo.
 * Asegura que el contenido posea la densidad mínima requerida para la fragmentación vectorial.
 */
export const KnowledgeIngestionSchema = z.object({
  documentTitle: z.string().min(5).max(100).toUpperCase().trim(),
  documentRawContent: z.string().min(100, {
    message: 'knowledge.errors.insufficient_density'
  }),
  documentCategory: KnowledgeOrganizationCategorySchema,
  metadata: z.object({
    sourceFormat: z.string().default('TEXT_MANUAL'),
    ingestedFrom: z.string().default('ADMIN_DASHBOARD_V2'),
  }).optional(),
}).readonly();

/** @type IKnowledgeIngestion */
export type IKnowledgeIngestion = z.infer<typeof KnowledgeIngestionSchema>;
