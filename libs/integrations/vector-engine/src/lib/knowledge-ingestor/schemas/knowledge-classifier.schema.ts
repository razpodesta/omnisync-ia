/** libs/integrations/vector-engine/src/lib/knowledge-ingestor/schemas/knowledge-classifier.schema.ts */

import { z } from 'zod';
import { KnowledgeOrganizationCategorySchema } from '@omnisync/core-contracts';

/**
 * @name KnowledgeClassificationResponseSchema
 * @description Contrato inmutable que define la estructura de salida del cerebro
 * de clasificación cognitiva. Garantiza que la taxonomía del conocimiento
 * sea íntegra antes de su fragmentación.
 *
 * @protocol OEDP-Level: Elite (Granular Schema)
 */
export const KnowledgeClassificationResponseSchema = z.object({
  /** Categoría técnica detectada mediante análisis semántico */
  category: KnowledgeOrganizationCategorySchema,

  /** Lista de etiquetas técnicas para optimización de búsqueda RAG */
  tags: z.array(z.string().min(2)).length(5, {
    message: 'El clasificador debe generar exactamente 5 tags para mantener la densidad vectorial.'
  }),

  /** Puntuación de confianza del modelo sobre la clasificación (0.0 a 1.0) */
  confidenceScore: z.number().min(0).max(1),
}).readonly();

/** @type IKnowledgeClassificationResponse */
export type IKnowledgeClassificationResponse = z.infer<typeof KnowledgeClassificationResponseSchema>;
