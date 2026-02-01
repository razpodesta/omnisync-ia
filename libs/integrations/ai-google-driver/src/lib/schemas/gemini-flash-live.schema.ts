/** libs/integrations/ai-google-driver/src/lib/schemas/gemini-flash-live.schema.ts */

import { z } from 'zod';

export const GeminiFlashLiveConfigurationSchema = z.object({
  temperature: z.number().min(0).max(2).default(1.0),
  responseMimeType: z.enum(['text/plain', 'application/json']).default('text/plain'),
  voiceStyle: z.enum(['AOEDE', 'CHARON', 'FENRIR', 'KORE', 'PUCK']).default('AOEDE'),
  enableSpeechOutput: z.boolean().default(true),
}).readonly();

/**
 * @name GeminiFlashLiveOutputSchema
 * @description Sella la salida multimodal (Texto + Audio) de la Fase 5.5.
 */
export const GeminiFlashLiveOutputSchema = z.object({
  text: z.string().min(1),
  /** Buffer de audio en Base64 para el VoiceDNAStreamer */
  audioBufferBase64: z.string().optional(), 
  /** @section Sello Biyectivo V5.5 */
  integrityFingerprint: z.object({
    textHash: z.string().min(64),
    audioHash: z.string().min(64).optional(),
  }),
  /** Visión Ojos de Mosca: ROI y Latencia */
  usageMetadata: z.object({
    inputTokens: z.number(),
    outputTokens: z.number(),
    costUsd: z.number(),
    latencyMs: z.number(),
  }),
}).readonly();

export type IGeminiFlashLiveOutput = z.infer<typeof GeminiFlashLiveOutputSchema>;
export type IGeminiFlashLiveConfiguration = z.infer<typeof GeminiFlashLiveConfigurationSchema>;