/** libs/integrations/ai-google-driver/src/lib/schemas/gemini-pro-vision.schema.ts */

import { z } from 'zod';

/**
 * @name GeminiProVisionInputSchema
 * @description Valida el ADN de entrada para inferencia multimodal.
 * Implementa el Sello de Integridad de Origen para el lote de imágenes.
 */
export const GeminiProVisionInputSchema = z.object({
  textPrompt: z.string().min(5),
  mediaAssets: z.array(z.object({
    base64Data: z.string().min(100),
    mimeType: z.enum(['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'video/mp4']),
  })).min(1).max(5),
  config: z.object({
    temperature: z.number().min(0).max(1).default(0.4),
    maxOutputTokens: z.number().default(2048),
  }).optional(),
  /** @section Sello Biyectivo V5.5 */
  batchIntegrityFingerprint: z.string().min(64).optional(),
}).readonly();

export const GeminiProVisionOutputSchema = z.object({
  analysis: z.string().min(1),
  detectedAnomalies: z.array(z.string()).default([]),
  confidenceScore: z.number().min(0).max(1),
  usageMetadata: z.object({
    imageCount: z.number(),
    estimatedTokens: z.number(),
    forecastCostUsd: z.number(),
  }),
  /** Referencia biyectiva al lote original */
  originFingerprint: z.string().min(64),
}).readonly();

export type IGeminiProVisionInput = z.infer<typeof GeminiProVisionInputSchema>;
export type IGeminiProVisionOutput = z.infer<typeof GeminiProVisionOutputSchema>;