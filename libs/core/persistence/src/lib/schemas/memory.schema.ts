/** libs/core/persistence/src/lib/schemas/memory.schema.ts */

import { z } from 'zod';

/**
 * @name MemoryInfrastructureConfigurationSchema
 * @description Valida los parámetros de conexión para el cluster Upstash Redis.
 */
export const MemoryInfrastructureConfigurationSchema = z.object({
  upstashRedisRestUniversalResourceLocator: z.string().url({
    message: 'persistence.memory.error.invalid_url'
  }),
  upstashRedisRestAuthorizationToken: z.string().min(10, {
    message: 'persistence.memory.error.invalid_token'
  }),
}).readonly();

/**
 * @name UpstashRestResponseSchema
 * @description Valida la estructura de retorno estándar de la API de Upstash.
 */
export const UpstashRestResponseSchema = z.object({
  result: z.unknown(),
}).readonly();

export type IMemoryInfrastructureConfiguration = z.infer<typeof MemoryInfrastructureConfigurationSchema>;
