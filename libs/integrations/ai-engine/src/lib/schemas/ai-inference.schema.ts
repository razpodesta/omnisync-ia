/** libs/integrations/ai-engine/src/lib/schemas/ai-inference.schema.ts */

import { z } from 'zod';

/**
 * @name AIProviderResolutionSchema
 * @description Valida los parámetros de entrada para la resolución de drivers de IA.
 * Previene el paso de identificadores corruptos antes de alcanzar la fábrica.
 */
export const AIProviderResolutionSchema = z
  .object({
    /** Identificador nominal del proveedor (ej: 'GOOGLE_GEMINI') */
    providerIdentifier: z.string().min(3).toUpperCase(),
    /** Nivel de razonamiento del modelo */
    modelTier: z.enum(['PRO', 'FLASH', 'DEEP_THINK']).default('FLASH'),
  })
  .readonly();

export type IAIProviderResolution = z.infer<typeof AIProviderResolutionSchema>;
