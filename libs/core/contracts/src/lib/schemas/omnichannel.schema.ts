/** libs/core/contracts/src/lib/schemas/omnichannel.schema.ts */

import { z } from 'zod';
import { TenantIdSchema } from './core-contracts.schema';

/**
 * @name ChannelTypeSchema
 * @description Define los vectores de comunicación autorizados para el ingreso
 * de datos al ecosistema neural.
 */
export const ChannelTypeSchema = z.enum([
  'WHATSAPP',
  'WEB_CHAT',
  'VOICE_CALL',
  'TELEGRAM'
]);

/**
 * @name NeuralIntentSchema
 * @description Contrato maestro inmutable para la normalización de mensajes omnicanal.
 * Este esquema garantiza que cualquier interacción externa sea transformada en una
 * estructura de datos predecible y segura antes de alcanzar el Neural Hub.
 *
 * @protocol OEDP-Level: Elite (SSOT)
 */
export const NeuralIntentSchema = z.object({
  /** Identificador único universal de la intención capturada */
  id: z.string().uuid(),

  /** Canal de origen desde el cual se emitió la consulta */
  channel: ChannelTypeSchema,

  /**
   * Identificador de identidad en la plataforma de origen.
   * Representa el punto de contacto (ej: número E.164 o session_id).
   */
  externalUserId: z.string().min(1),

  /** Identificador de soberanía de la organización (Branded Type) */
  tenantId: TenantIdSchema,

  /**
   * @section Carga Útil Cognitiva
   * Define la naturaleza y el contenido de la petición del usuario.
   */
  payload: z.object({
    /** Clasificación del recurso entrante */
    type: z.enum(['TEXT', 'AUDIO', 'IMAGE', 'LOCATION']),

    /** Contenido textual puro o referencia URI al buffer multimedia */
    content: z.string().min(1),

    /** Metadatos del entorno de origen para trazabilidad y telemetría */
    metadata: z.record(z.string(), z.unknown()).default({}),
  }),

  /** Marca de tiempo de sincronización bajo estándar ISO-8601 */
  timestamp: z.string().datetime(),
}).readonly();

/**
 * @type INeuralIntent
 * @description Representación tipada de la intención normalizada.
 */
export type INeuralIntent = z.infer<typeof NeuralIntentSchema>;
