/** libs/integrations/omnichannel-orchestrator/src/lib/schemas/omnichannel-translator.schema.ts */

import { z } from 'zod';
import {
  ChannelTypeSchema,
  TenantIdSchema,
  TenantId,
} from '@omnisync/core-contracts';

/**
 * @name UrgencyLevelSchema
 * @description Taxonomía oficial de criticidad para el triaje neural del ecosistema.
 * Define los estados inmutables de prioridad para la atención del usuario.
 */
export const UrgencyLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

/**
 * @name OmnichannelTranslationResultSchema
 * @description Contrato maestro de salida para los aparatos de traducción (Lego Translators).
 * Define la estructura inmutable y estandarizada que debe retornar cualquier traductor
 * para garantizar la coherencia en el flujo neural multimodal.
 *
 * @protocol OEDP-Level: Elite (SSOT Master DNA)
 */
export const OmnichannelTranslationResultSchema = z
  .object({
    /** Canal de origen validado (WhatsApp, Web Chat, etc.) */
    channel: ChannelTypeSchema,

    /** Identificador nominal del usuario en la plataforma origen (ej: E.164 o UUID) */
    externalUserId: z.string().min(1),

    /**
     * @section Carga Útil Cognitiva
     * Contiene el recurso normalizado para el procesamiento de la IA.
     */
    payload: z.object({
      /** Clasificación multimodal del recurso */
      type: z.enum([
        'TEXT',
        'AUDIO',
        'IMAGE',
        'VIDEO',
        'DOCUMENT',
        'INTERACTIVE',
        'LOCATION',
      ]),

      /** Contenido purificado, referencia URI o identificador de buffer */
      content: z.string().min(1),

      /**
       * @section Metadatos de Soberanía y Triaje
       * Información técnica enriquecida para auditoría forense y ruteo de sub-agentes.
       */
      metadata: z
        .object({
          /** Identificador de la organización propietaria para aislamiento RLS */
          sovereignTenantId: TenantIdSchema,

          /** Marca de tiempo de la normalización del mensaje */
          translatedAt: z.string().datetime(),

          /** Nivel de urgencia detectado por el analista lingüístico */
          urgencyLevel: UrgencyLevelSchema.optional(),

          /** Puntuación matemática de criticidad (0 a 100) */
          urgencyScore: z.number().min(0).max(100).optional(),

          /** Flag de atención prioritaria inmediata */
          isUrgent: z.boolean().optional(),
        })
        .catchall(z.unknown()), // Permite metadatos específicos por canal (ej: pushName)
    }),
  })
  .readonly();

/**
 * @type IOmnichannelTranslationResult
 * @description Representación tipada e inmutable del resultado de traducción.
 */
export type IOmnichannelTranslationResult = z.infer<
  typeof OmnichannelTranslationResultSchema
>;

/**
 * @interface IOmnichannelTranslator
 * @description Interfaz de contrato para los Aparatos Traductores.
 * Garantiza que cualquier implementación (WhatsApp, Telegram) sea intercambiable.
 *
 * @protocol OEDP-Level: Elite (Interface Sovereignty)
 */
export interface IOmnichannelTranslator {
  /** Esquema de validación del evento de red bruto (Aduana de Datos) */
  readonly rawEventSchema: z.ZodType<unknown>;

  /**
   * @method translate
   * @description Transforma el tráfico de red en una intención neural estandarizada.
   *
   * @param {unknown} rawPayload - Datos brutos del proveedor.
   * @param {TenantId} tenantId - Sello de soberanía del suscriptor.
   * @param {string[]} localizedUrgencyKeys - Diccionario para el triaje lingüístico.
   */
  translate(
    rawPayload: unknown,
    tenantId: TenantId,
    localizedUrgencyKeys: string[],
  ): IOmnichannelTranslationResult;
}
