/** libs/core/persistence/src/index.ts */

/**
 * @section Capa de Persistencia Relacional (SQL)
 * Manejo de la base de datos central en Supabase/Neon mediante Prisma.
 */
export * from './lib/database.apparatus';

/**
 * @section Capa de Memoria Volátil (Cache/Session)
 * Gestión de hilos de conversación y estados rápidos en Upstash Redis.
 */
export * from './lib/memory.apparatus';