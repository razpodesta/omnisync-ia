/** libs/integrations/vector-engine/src/lib/knowledge-ingestor/schemas/knowledge-classifier.schema.ts */

import { z } from 'zod';
import { KnowledgeOrganizationCategorySchema } from '@omnisync/core-contracts';

/**
 * @name KnowledgeClassificationResponseSchema
 * @description Contrato maestro evolucionado para la taxonomía neural V5.5.
 * Introduce métricas de densidad técnica e intención para guiar el Smart Chunking.
 */
export const KnowledgeClassificationResponseSchema = z.object({
  /** Clasificación primaria del dominio */
  category: KnowledgeOrganizationCategorySchema,
  
  /** 5 Palabras clave técnicas para el espacio vectorial */
  tags: z.array(z.string().min(2)).length(5),

  /** Propósito del documento (ej: 'PROCEDURAL', 'INFORMATIVE', 'REGULATORY') */
  instructionalIntent: z.enum(['PROCEDURAL', 'INFORMATIVE', 'REGULATORY', 'SPECIFICATION']),

  /** 
   * Puntuación de densidad técnica (0.0 a 1.0).
   * Determina la fragmentación: >0.8 fuerza chunks pequeños (alta precisión).
   */
  technicalDensityScore: z.number().min(0).max(1),

  /** Idioma detectado para paridad i18n */
  detectedLanguage: z.enum(['es', 'en', 'pt', 'other']),

  /** Sello de confianza de la inferencia */
  confidenceScore: z.number().min(0).max(1),
}).readonly();

/** @type IKnowledgeClassificationResponse */
export type IKnowledgeClassificationResponse = z.infer<typeof KnowledgeClassificationResponseSchema>;