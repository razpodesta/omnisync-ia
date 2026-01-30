/** libs/core/persistence/src/index.ts */

/**
 * @section Exportación de ADN Generado
 * Re-exportamos los tipos de Prisma para que otros aparatos (como el Builder)
 * tengan acceso a las definiciones reales del esquema.
 */
export * from '@prisma/client';

/**
 * @section Aparatos de Persistencia
 */
export * from './lib/database.apparatus';
export * from './lib/memory.apparatus';
export { PrismaEngineBuilder } from './lib/builders/prisma-engine.builder';