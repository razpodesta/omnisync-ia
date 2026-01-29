/** libs/integrations/vector-qdrant-driver/src/lib/schemas/qdrant-driver.schema.ts */

import { z } from 'zod';

/**
 * @name QdrantConnectionConfigurationSchema
 * @description Valida la integridad de las credenciales y endpoints del cluster Qdrant.
 */
export const QdrantConnectionConfigurationSchema = z
  .object({
    /** URL absoluta del cluster (Cloud o Auto-hospedado) */
    endpoint: z.string().url({ message: 'URL de cluster Qdrant inválida.' }),
    /** Llave de seguridad para autorización en el Header api-key */
    apiKey: z
      .string()
      .min(10, { message: 'Qdrant API Key insuficiente o inexistente.' }),
  })
  .readonly();

export type IQdrantConnectionConfiguration = z.infer<
  typeof QdrantConnectionConfigurationSchema
>;

/**
 * @name QdrantInternalPointSchema
 * @description Contrato para la validación de la respuesta cruda del motor Rust de Qdrant.
 */
export const QdrantInternalPointSchema = z
  .object({
    id: z.string().uuid(),
    score: z.number(),
    payload: z.record(z.string(), z.unknown()),
  })
  .readonly();

export type IQdrantInternalPoint = z.infer<typeof QdrantInternalPointSchema>;
