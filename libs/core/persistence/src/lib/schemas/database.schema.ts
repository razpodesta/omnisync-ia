/** libs/core/persistence/src/lib/schemas/database.schema.ts */

import { z } from 'zod';

/**
 * @name RelationalDatabaseEnvironmentSchema
 * @description Define la taxonomía de entornos autorizados para la persistencia SQL.
 */
export const RelationalDatabaseEnvironmentSchema = z.enum(['development', 'production', 'test']);

/**
 * @name DatabaseInfrastructureConfigurationSchema
 * @description Contrato de integridad para los secretos y parámetros de red del cluster SQL.
 */
export const DatabaseInfrastructureConfigurationSchema = z.object({
  /** URL absoluta de conexión (postgresql://user:pass@host:port/db) */
  relationalDatabaseUrl: z.string().url({ message: 'persistence.database.error.invalid_url' }),
  /** Nodo de ejecución para lógica de logging y performance */
  executionEnvironment: RelationalDatabaseEnvironmentSchema,
}).readonly();

/**
 * @name PrismaEngineLogConfigurationSchema
 * @description Valida los niveles de verbosidad permitidos por el motor Prisma.
 */
export const PrismaEngineLogConfigurationSchema = z.array(
  z.enum(['query', 'info', 'warn', 'error'])
).readonly();

export type IDatabaseInfrastructureConfiguration = z.infer<typeof DatabaseInfrastructureConfigurationSchema>;
export type IPrismaEngineLogConfiguration = z.infer<typeof PrismaEngineLogConfigurationSchema>;
