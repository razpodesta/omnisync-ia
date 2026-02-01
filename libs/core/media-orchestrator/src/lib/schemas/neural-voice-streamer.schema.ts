/** libs/core/media-orchestrator/src/lib/schemas/neural-voice-streamer.schema.ts */

import { z } from 'zod';

/**
 * @name NeuralVoiceSignalSchema
 * @description Contrato maestro para el transporte de señales acústicas. 
 * Define el ADN físico que los drivers de salida (Meta/Socket) deben inyectar.
 */
export const NeuralVoiceSignalSchema = z.object({
  signalIdentifier: z.string().uuid(),
  /** Firma criptográfica del buffer para validación de integridad */
  fingerprint: z.string(),
  /** Datos binarios en Base64 optimizados para transporte JSON */
  payload: z.string(),
  /** Metadatos de codificación técnica */
  specs: z.object({
    mimeType: z.enum(['audio/ogg; codecs=opus', 'audio/mpeg', 'audio/wav', 'audio/webm']),
    bitrate: z.number(),
    durationSeconds: z.number(),
  }),
  /** Trazabilidad del flujo neural */
  origin: z.object({
    intentId: z.string().uuid(),
    provider: z.string(),
    engineVersion: z.string(),
  }),
  timestamp: z.string().datetime(),
}).readonly();

/** @type INeuralVoiceSignal */
export type INeuralVoiceSignal = z.infer<typeof NeuralVoiceSignalSchema>;