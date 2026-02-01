/** libs/integrations/omnichannel-orchestrator/src/lib/schemas/voice-call-translator.schema.ts */

import { z } from 'zod';
import { TenantIdSchema, VoiceEmotionTierSchema } from '@omnisync/core-contracts';

/**
 * @name VoiceCallTranslationResultSchema
 * @description Contrato maestro para la normalización de señales acústicas.
 * Orquesta la visión 360 del pulso prosódico y la previsión financiera.
 */
export const VoiceCallTranslationResultSchema = z.object({
  channel: z.literal('VOICE_CALL'),
  externalUserId: z.string().min(5),
  payload: z.object({
    type: z.literal('AUDIO'),
    content: z.string().min(1),
    /** @section Trazabilidad Fase 5.5 */
    transcriptFingerprint: z.string().min(64), 
    metadata: z.object({
      sovereignTenantId: TenantIdSchema,
      detectedEmotion: VoiceEmotionTierSchema,
      vocalConfidence: z.number().min(0).max(1),
      speechDurationSeconds: z.number().nonnegative(),
      /** Visión Ojos de Mosca: DNA Acústico */
      prosodicDNA: z.object({
        averageDecibels: z.number(),
        speechRate: z.number(), // Palabras por segundo
        jitterMs: z.number().default(0),
      }),
      financialForecast: z.object({
        estimatedTokens: z.number().int(),
        inputCostUsd: z.number(),
        densityFactor: z.number().default(3.7),
      }),
      transportSpecs: z.object({
        codec: z.string(),
        sampleRate: z.number(),
        orchestratorVersion: z.string(),
      }),
      translatedAt: z.string().datetime(),
    }),
  }),
}).readonly();

export type IVoiceCallTranslationResult = z.infer<typeof VoiceCallTranslationResultSchema>;