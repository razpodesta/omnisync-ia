/** apps/admin-dashboard/src/app/[locale]/knowledge/schemas/knowledge-ingestion.schema.ts */

import { z } from 'zod';
import { KnowledgeOrganizationCategorySchema } from '@omnisync/core-contracts';

/**
 * @name KnowledgeIngestionSchema
 * @description Contrato maestro para la validación de ADN técnico corporativo V5.5.
 * Orquesta la captura de intención instruccional y parámetros de densidad.
 */
export const KnowledgeIngestionSchema = z.object({
  documentTitle: z.string().min(5).max(100).toUpperCase().trim(),
  documentRawContent: z.string().min(100, {
    message: 'knowledge.errors.insufficient_density'
  }),
  documentCategory: KnowledgeOrganizationCategorySchema,
  
  /** 
   * @section Metadatos de Visión 5.5 
   * Permite al backend omitir el triaje si la UI ya calculó la densidad.
   */
  analysisDirectives: z.object({
    instructionalIntent: z.enum(['PROCEDURAL', 'INFORMATIVE', 'REGULATORY', 'SPECIFICATION']),
    technicalDensity: z.number().min(0).max(1),
    detectedLanguage: z.enum(['es', 'en', 'pt']),
  }).optional(),

  metadata: z.object({
    sourceFormat: z.string().default('ADMIN_TERMINAL_V5'),
    forensicChecksum: z.string().optional(),
    projectedTokenCost: z.number().optional(),
  }),
}).readonly();

/** @type IKnowledgeIngestion */
export type IKnowledgeIngestion = z.infer<typeof KnowledgeIngestionSchema>;