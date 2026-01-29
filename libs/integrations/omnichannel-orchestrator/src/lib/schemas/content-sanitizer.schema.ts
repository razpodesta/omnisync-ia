/** libs/integrations/omnichannel-orchestrator/src/lib/schemas/content-sanitizer.schema.ts */

import { z } from 'zod';

/**
 * @name ContentSanitizationConfigurationSchema
 * @description Define los límites de seguridad para el saneamiento de texto neural.
 */
export const ContentSanitizationConfigurationSchema = z
  .object({
    /** Límite máximo de caracteres para proteger el presupuesto de tokens */
    maximumCharacterLength: z.number().int().positive().default(4000),
    /** Interruptor para erradicar caracteres de control invisibles */
    stripControlCharacters: z.boolean().default(true),
    /** Bloqueo de ataques de inyección mediante Bidi Overrides */
    blockBidirectionalPatterns: z.boolean().default(true),
  })
  .readonly();

export type IContentSanitizationConfiguration = z.infer<
  typeof ContentSanitizationConfigurationSchema
>;
