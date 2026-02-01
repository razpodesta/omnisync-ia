/** 
 * libs/core/contracts/src/lib/schemas/voice-engine.schema.ts 
 * @protocol OEDP-Level: Elite (Next-Gen Voice-DNA Contract V4.9)
 * @vision Ultra-Holística: Prosody-Aware-Synthesis & Multi-Provider-Sharding
 * @author Raz Podestá <Creator>
 */

import { z } from 'zod';

/**
 * @name VoiceIdentifier
 * @description Identificador nominal de la huella vocal (Vocal Print).
 */
export const VoiceIdSchema = z.string().min(5).brand<'VoiceId'>();
export type VoiceId = z.infer<typeof VoiceIdSchema>;

/**
 * @name VoiceProviderSchema
 * @description Taxonomía de motores de síntesis autorizados.
 * Clasificados por su especialidad operativa en la Fase 4.9.
 */
export const VoiceProviderSchema = z.enum([
  'ELEVENLABS_ELITE', // Máxima fidelidad emocional (V3 Engine)
  'CARTESIA_SONIC',    // Latencia ultra-baja <100ms (Real-time calls)
  'PLAYHT_PARROT',    // Clonación Zero-Shot de alta precisión
  'OPEN_SOURCE_MELO'  // Soberanía de datos privada (Local Inference)
]);

/**
 * @name VoiceEmotionTierSchema
 * @description Define la escala de intensidad emocional inyectada en la voz.
 * Permite que la IA "actúe" la respuesta según el triaje de urgencia.
 */
export const VoiceEmotionTierSchema = z.enum([
  'NEUTRAL',
  'EMPATHETIC', // Soporte técnico y contención
  'AUTHORITATIVE', // Alertas de seguridad o finanzas
  'ENTHUSIASTIC', // Marketing y ventas
  'CALM',         // Meditación o estados de espera
  'CONCERNED'     // Detección de frustración en el cliente
]);

/**
 * @name AudioAcusticProfileSchema
 * @description Parámetros de ingeniería de audio para la salida física.
 * Soporta desde telefonía legacy hasta audio de alta resolución.
 */
export const AudioAcusticProfileSchema = z.object({
  format: z.enum(['MP3', 'OPUS', 'PCM', 'WAV']).default('OPUS'),
  sampleRate: z.number().int().min(8000).max(48000).default(24000),
  bitrate: z.number().int().min(16).max(128).default(64),
  /** Flag para optimizar el buffer para dispositivos móviles (WhatsApp) */
  optimizeForMobile: z.boolean().default(true),
}).readonly();

/**
 * @name ProsodyGovernanceSchema
 * @description Control milimétrico de la cadencia y el tono vocal.
 * Implementa la lógica de "Voiceover" de próxima generación.
 */
const ProsodyGovernanceSchema = z.object({
  stability: z.number().min(0).max(1).default(0.5),
  similarityBoost: z.number().min(0).max(1).default(0.75),
  styleExaggeration: z.number().min(0).max(1).default(0.3),
  speakingRate: z.number().min(0.5).max(2.0).default(1.0),
  pitchShift: z.number().min(-20).max(20).default(0), // Medido en semitonos
}).readonly();

/**
 * @name VoiceSynthesisRequestSchema
 * @description Contrato maestro para la solicitud de síntesis vocal.
 * LEGO: Este objeto es autocontenido y agnóstico al modelo de IA que generó el texto.
 */
export const VoiceSynthesisRequestSchema = z.object({
  /** Texto purificado para la locución */
  text: z.string().min(1),
  /** Identificador de la voz asignada al Tenant/Agente */
  voiceId: VoiceIdSchema,
  /** Proveedor que procesará la señal (Criterio de latencia vs calidad) */
  provider: VoiceProviderSchema,
  /** Emoción dominante resuelta por el Cognitive-Governance */
  emotion: VoiceEmotionTierSchema.default('NEUTRAL'),
  /** Configuración de audio y prosodia */
  acustics: AudioAcusticProfileSchema,
  prosody: ProsodyGovernanceSchema,

  /** Metadatos de Trazabilidad Forense */
  metadata: z.object({
    intentId: z.string().uuid(),
    tenantId: z.string(),
    modelOrigin: z.string(), // ej: 'gemini-2.0-thinking'
    requestTimestamp: z.string().datetime(),
  }).readonly(),
}).readonly();

/**
 * @name VoiceInferenceResultSchema
 * @description Contrato de salida inmutable tras la generación del audio.
 */
export const VoiceInferenceResultSchema = z.object({
  /** Buffer de audio en Base64 para transporte omnicanal */
  audioBuffer: z.string(),
  /** Duración exacta en segundos para sincronización de UI/WA */
  durationSeconds: z.number().nonnegative(),
  /** Firma de integridad del audio generado */
  audioChecksum: z.string(),
  /** Latencia total del motor de síntesis */
  synthesisLatencyMs: z.number(),
  /** Costo real de la operación (vía core-auditor) */
  billingUnits: z.number().nonnegative(),
}).readonly();

export type IVoiceId = z.infer<typeof VoiceIdSchema>;
export type IVoiceProvider = z.infer<typeof VoiceProviderSchema>;
export type IVoiceEmotionTier = z.infer<typeof VoiceEmotionTierSchema>;
export type IVoiceSynthesisRequest = z.infer<typeof VoiceSynthesisRequestSchema>;
export type IVoiceInferenceResult = z.infer<typeof VoiceInferenceResultSchema>;