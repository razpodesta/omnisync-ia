/** libs/core/persistence/prisma/prisma.config.ts */

import { defineConfig } from 'prisma/config';

/**
 * @name PrismaSovereignConfig
 * @description Aparato de configuración programática para Prisma 7.
 * Actúa como el puente entre las variables de entorno y el motor de migraciones.
 */
export default defineConfig({
  schema: './schema.prisma',
  datasource: {
    /**
     * @note El motor de Prisma 7 utiliza este ruteo para operaciones de CLI.
     * En tiempo de ejecución (Apparatus), seguimos usando la inyección del Builder.
     */
    url: process.env['DATABASE_URL'],
  },
});