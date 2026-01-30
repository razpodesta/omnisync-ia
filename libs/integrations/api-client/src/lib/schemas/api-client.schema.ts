/** libs/integrations/api-client/src/lib/schemas/api-client.schema.ts */

import { z } from 'zod';

/**
 * @name NeuralEndpointSchema
 * @description Taxonomía de rutas autorizadas en el Neural Hub.
 */
export const NeuralEndpointSchema = z.enum([
  '/v1/neural/chat',
  '/v1/neural/ingest',
  '/v1/health/pulse'
]);

/**
 * @name ApiRequestConfigurationSchema
 * @description Valida los parámetros de una transacción antes de la ignición de red.
 */
export const ApiRequestConfigurationSchema = z.object({
  endpoint: NeuralEndpointSchema,
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('POST'),
  payload: z.unknown().optional(),
  timeoutOverride: z.number().optional(),
}).readonly();

export type IApiRequestConfiguration = z.infer<typeof ApiRequestConfigurationSchema>;
export type INeuralEndpoint = z.infer<typeof NeuralEndpointSchema>;