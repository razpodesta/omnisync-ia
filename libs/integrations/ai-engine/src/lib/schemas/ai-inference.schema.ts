/** libs/integrations/ai-engine/src/lib/schemas/ai-inference.schema.ts */

import { z } from 'zod';
import { AIResolutionStatusSchema } from '@omnisync/core-contracts';

/**
 * @name NeuralInferenceResponseSchema
 * @description Contrato maestro para la salida del razonamiento neural V5.5.
 * Orquesta la visión 360 del ROI, la integridad biyectiva y el ADN prosódico.
 */
export const NeuralInferenceResponseSchema = z.object({
  conversationId: z.string().uuid(),
  suggestion: z.string().min(1),
  status: AIResolutionStatusSchema,
  confidenceScore: z.number().min(0).max(1),
  
  /** @section Sello Biyectivo V5.5: Vínculo con la hebra de conciencia */
  integritySeal: z.object({
    promptFingerprint: z.string().min(10),
    directiveVersion: z.string(),
    variantIdentifier: z.enum(['A', 'B']),
  }),

  /** Visión Ojos de Mosca: Auditoría Financiera */
  usageMetrics: z.object({
    totalTokens: z.number().nonnegative(),
    estimatedCostUsd: z.number().nonnegative(),
    latencyMs: z.number().nonnegative(),
  }),

  /** ADN Vocal: Preparación multimodal */
  vocalContext: z.object({
    isVocalizable: z.boolean(),
    suggestedEmotion: z.string(),
  }).optional(),
}).readonly();

/**
 * @name AIProviderResolutionSchema
 * @description Valida la solicitud de infraestructura de motor.
 */
export const AIProviderResolutionSchema = z.object({
  providerIdentifier: z.string().toUpperCase(),
  modelTier: z.enum(['PRO', 'FLASH', 'DEEP_THINK', 'EMBEDDING']),
}).readonly();

export type INeuralInferenceResponse = z.infer<typeof NeuralInferenceResponseSchema>;
export type IAIProviderResolution = z.infer<typeof AIProviderResolutionSchema>;