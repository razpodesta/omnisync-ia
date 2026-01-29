/** libs/integrations/vector-engine/src/lib/schemas/semantic-relevance.schema.ts */

import { z } from 'zod';
import { KnowledgeSemanticChunkSchema } from '@omnisync/core-contracts';

/**
 * @name KnowledgeRelevanceAssessmentSchema
 * @description Define el resultado de la auditoría de calidad semántica.
 * Proporciona métricas avanzadas sobre la fidelidad del contexto recuperado.
 *
 * @protocol OEDP-Level: Elite (Quality Metrics)
 */
export const KnowledgeRelevanceAssessmentSchema = z
  .object({
    /** Fragmentos que superaron el umbral de soberanía */
    filteredChunks: z.array(KnowledgeSemanticChunkSchema),

    /** Promedio matemático de similitud de coseno */
    averageScore: z.number().min(0).max(1),

    /** Porcentaje de fragmentos válidos frente al total recuperado */
    contextReliabilityPulse: z.number().min(0).max(1),

    /** Flag de alta fidelidad: True si al menos un fragmento es > 0.90 */
    hasHighConfidenceAnchor: z.boolean(),
  })
  .readonly();

/** @type IKnowledgeRelevanceAssessment */
export type IKnowledgeRelevanceAssessment = z.infer<
  typeof KnowledgeRelevanceAssessmentSchema
>;
