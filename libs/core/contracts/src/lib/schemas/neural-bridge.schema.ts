/** libs/core/contracts/src/lib/schemas/neural-bridge.schema.ts */

import { z } from 'zod';

/**
 * @name NeuralBridgeConfigurationSchema
 * @description Esquema de validación para la infraestructura de comunicación.
 * Asegura que los parámetros de conexión con el Neural Hub sean íntegros.
 */
export const NeuralBridgeConfigurationSchema = z
  .object({
    /** URL absoluta del backend en Render/Cloud */
    baseUrl: z
      .string()
      .url({ message: 'OS-CORE-503: La URL del Hub no es válida.' }),
    /** Tiempo de gracia para respuestas lentas del AI Engine */
    timeoutInMilliseconds: z.number().default(15000),
  })
  .readonly();

/** @type INeuralBridgeConfiguration */
export type INeuralBridgeConfiguration = z.infer<
  typeof NeuralBridgeConfigurationSchema
>;
