/** libs/core/persistence/src/lib/database.apparatus.ts */

import { PrismaClient } from '@prisma/client';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';

/**
 * @name OmnisyncDatabase
 * @description Aparato de élite para la gestión de persistencia SQL.
 * Implementa el patrón Singleton para optimizar el pool de conexiones en la nube.
 */
export class OmnisyncDatabase {
  private static instance: PrismaClient;

  /**
   * @method db
   * @description Retorna la instancia activa de Prisma.
   */
  public static get db(): PrismaClient {
    if (!this.instance) {
      this.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    }
    return this.instance;
  }

  /**
   * @method testConnection
   * @description Verifica que el Tier de la nube esté respondiendo.
   */
  public static async validateRuntime(): Promise<void> {
    return await OmnisyncTelemetry.traceExecution(
      'OmnisyncDatabase',
      'validateRuntime',
      async () => {
        try {
          await this.db.$connect();
          OmnisyncTelemetry.verbose('OmnisyncDatabase', 'connect', 'Conexión exitosa con PostgreSQL Cloud');
        } catch (error: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-CORE-002',
            severity: 'CRITICAL',
            apparatus: 'OmnisyncDatabase',
            operation: 'validateRuntime',
            message: 'Fallo de conexión con la base de datos SQL en la nube',
            context: { error: String(error) }
          });
          throw error;
        }
      }
    );
  }
}