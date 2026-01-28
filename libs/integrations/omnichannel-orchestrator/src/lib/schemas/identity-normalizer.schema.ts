/** libs/integrations/omnichannel-orchestrator/src/lib/schemas/identity-normalizer.schema.ts */

import { z } from 'zod';

/**
 * @name NormalizedIdentitySchema
 * @description Contrato inmutable que define la pureza de una identidad capturada.
 */
export const NormalizedIdentitySchema = z.object({
  /** Identificador técnico purificado (sin sufijos de red) */
  identifier: z.string().min(1),
  /** Clasificación de la entidad en el ecosistema del canal */
  accountType: z.enum(['INDIVIDUAL', 'GROUP', 'SYSTEM', 'BOT', 'UNKNOWN']),
  /** Canal de origen para el cual se normalizó la identidad */
  sourceChannel: z.enum(['WHATSAPP', 'WEB_CHAT', 'TELEGRAM', 'GENERIC']),
  /** Verificación heurística de formato telefónico E.164 */
  isPotentiallyValidPhone: z.boolean(),
  /** Metadatos adicionales de red (ej: ID de grupo original) */
  networkMetadata: z.record(z.string(), z.unknown()).default({}),
}).readonly();

export type INormalizedIdentity = z.infer<typeof NormalizedIdentitySchema>;