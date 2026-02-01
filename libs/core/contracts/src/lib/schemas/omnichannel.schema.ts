/** libs/core/contracts/src/lib/schemas/omnichannel.schema.ts */

import { z } from 'zod';
import { TenantIdSchema } from './core-contracts.schema';

/**
 * @name ChannelTypeSchema
 * @description Vectores de comunicación autorizados (V5.5).
 */
export const ChannelTypeSchema = z.enum([
  'WHATSAPP',
  'WEB_CHAT',
  'VOICE_CALL',
  'TELEGRAM',
  'SYSTEM_AUTO', // Intenciones generadas por procesos internos
]);

/**
 * @name MultimodalMetadataSchema
 * @description Estructura el ADN técnico según el tipo de recurso.
 * Implementa la visión "Ojos de Mosca" para cada sensor de entrada.
 */
const MultimodalMetadataSchema = z.object({
  // Eje Acústico
  audioSpecs: z.object({
    durationSeconds: z.number().optional(),
    samplingRate: z.number().optional(),
    vocalEmotion: z.string().optional(), // Detectado por VoiceCallTranslator
  }).optional(),
  
  // Eje Óptico
  visionSpecs: z.object({
    resolution: z.string().optional(),
    opticalFingerprint: z.string().optional(), // SHA-256 del recurso binario
  }).optional(),

  // Eje de Red (Sovereign Fingerprint)
  transport: z.object({
    ipAddress: z.string().ip().optional(),
    userAgent: z.string().optional(),
    platform: z.string().optional(),
    regionCode: z.string().length(2).toUpperCase().default('XX'), // ISO-3166
  }),
}).readonly();

/**
 * @name NeuralIntentSchema
 * @description Contrato maestro inmutable para la normalización omnicanal.
 * Sincronizado V5.5: Soporte para Sellos Biyectivos y ROI Predictivo.
 *
 * @protocol OEDP-Level: Elite (Sovereign-Master-DNA V5.5)
 */
export const NeuralIntentSchema = z
  .object({
    /** Identificador único universal del pulso neural */
    id: z.string().uuid(),

    /** Canal de origen validado */
    channel: ChannelTypeSchema,

    /** Identificador de identidad física (Teléfono o SessionUUID) */
    externalUserId: z.string().min(1),

    /** Sello de soberanía organizacional */
    tenantId: TenantIdSchema,

    /**
     * @section Carga Útil Cognitiva
     */
    payload: z.object({
      type: z.enum([
        'TEXT',
        'AUDIO',
        'IMAGE',
        'VIDEO',
        'DOCUMENT',
        'LOCATION',
        'INTERACTIVE',
      ]),

      /** Contenido purificado o URI de recurso */
      content: z.string().min(1),

      /** @section Visión Ojos de Mosca: Metadatos Estructurados */
      metadata: MultimodalMetadataSchema,

      /** Previsión de costo de entrada basada en densidad /3.7 */
      forecastCostUsd: z.number().nonnegative().default(0),
    }),

    /** 
     * @section Sello Biyectivo V5.5 
     * Firma SHA-256 que vincula id + tenant + content.
     * Impide ataques de inyección de intenciones entre capas.
     */
    dnaChecksum: z.string().min(64),

    /** Marca de tiempo ISO-8601 */
    timestamp: z.string().datetime(),
  })
  .readonly();

/** @type INeuralIntent */
export type INeuralIntent = z.infer<typeof NeuralIntentSchema>;
export type IChannelType = z.infer<typeof ChannelTypeSchema>;