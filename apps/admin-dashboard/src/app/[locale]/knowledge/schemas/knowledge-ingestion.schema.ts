/** apps/admin-dashboard/src/app/[locale]/knowledge/schemas/knowledge-ingestion.schema.ts */

import { z } from 'zod';

/**
 * @name KnowledgeIngestionSchema
 * @description Valida el contenido técnico antes de ser transmitido al Neural Hub.
 */
export const KnowledgeIngestionSchema = z
  .object({
    documentTitle: z
      .string()
      .min(5, { message: 'El título debe ser más descriptivo (min 5).' })
      .trim(),
    documentRawContent: z
      .string()
      .min(100, {
        message: 'El contenido es insuficiente para fragmentación semántica.',
      })
      .trim(),
    documentCategory: z.enum([
      'TECHNICAL',
      'COMMERCIAL',
      'ADMINISTRATIVE',
      'LEGAL',
    ]),
  })
  .readonly();

export type IKnowledgeIngestion = z.infer<typeof KnowledgeIngestionSchema>;
