/** libs/core/persistence/src/lib/database.apparatus.ts */

import { PrismaClient } from '@prisma/client';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';

/**
 * @name OmnisyncDatabase
 * @description Aparato de soberanía de persistencia relacional (SQL).
 * Actúa como el guardián del motor Prisma 7, gestionando el ciclo de vida
 * de las conexiones y garantizando la integridad de las transacciones
 * mediante un patrón Singleton de alto rendimiento.
 *
 * @protocol OEDP-Level: Elite
 */
export class OmnisyncDatabase {
  /**
   * @private
   * @description Instancia única del motor para evitar fugas de memoria en Serverless.
   */
  private static persistenceEngineInstance: PrismaClient | null = null;

  /**
   * @method databaseEngine
   * @description Recupera o instancia el motor de base de datos.
   * Implementa validación de secretos de entorno y configuración de logs verbosos.
   *
   * @returns {PrismaClient} El motor de persistencia activo.
   * @throws {Error} Si la cadena de conexión no está presente en el ecosistema.
   */
  public static get databaseEngine(): PrismaClient {
    if (!this.persistenceEngineInstance) {
      const databaseConnectionUrl = process.env['DATABASE_URL'];

      if (!databaseConnectionUrl) {
        const environmentFailure = new Error('OS-CORE-002: La variable [DATABASE_URL] es nula o inexistente.');

        OmnisyncSentinel.report({
          errorCode: 'OS-CORE-002',
          severity: 'CRITICAL',
          apparatus: 'OmnisyncDatabase',
          operation: 'instantiation',
          message: environmentFailure.message,
          context: {
            runtime: 'Node.js',
            architecture: 'Serverless-Ready'
          },
          isRecoverable: false
        });

        throw environmentFailure;
      }

      /**
       * @section Inicialización del Motor Prisma
       * Configurado para inyectar logs de telemetría solo en fase de ingeniería.
       */
      this.persistenceEngineInstance = new PrismaClient({
        datasources: {
          db: {
            url: databaseConnectionUrl,
          },
        },
        log: process.env['NODE_ENV'] === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
      });

      OmnisyncTelemetry.verbose(
        'OmnisyncDatabase',
        'initialization',
        'Motor Prisma 7 sincronizado con el cluster remoto.'
      );
    }

    return this.persistenceEngineInstance;
  }

  /**
   * @method validateInfrastructureConnectivity
   * @description Ejecuta una sonda de integridad contra el cluster de Supabase/PostgreSQL.
   * Esencial durante el bootstrap del orquestador.
   */
  public static async validateInfrastructureConnectivity(): Promise<void> {
    return await OmnisyncTelemetry.traceExecution(
      'OmnisyncDatabase',
      'validateInfrastructureConnectivity',
      async () => {
        try {
          await this.databaseEngine.$connect();
          OmnisyncTelemetry.verbose(
            'OmnisyncDatabase',
            'handshake',
            'Conectividad bidireccional establecida con éxito.'
          );
        } catch (criticalError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-CORE-503',
            severity: 'CRITICAL',
            apparatus: 'OmnisyncDatabase',
            operation: 'connectivity_probe',
            message: 'Incapacidad de establecer handshake con el cluster SQL.',
            context: { errorDetail: String(criticalError) },
            isRecoverable: true
          });
          throw criticalError;
        }
      }
    );
  }

  /**
   * @method terminatePersistenceEngine
   * @description Realiza un cierre atómico y elegante del pool de conexiones.
   * Invocado durante el SIGTERM de los pods en Render.
   */
  public static async terminatePersistenceEngine(): Promise<void> {
    if (this.persistenceEngineInstance) {
      await this.persistenceEngineInstance.$disconnect();
      this.persistenceEngineInstance = null;
      OmnisyncTelemetry.verbose(
        'OmnisyncDatabase',
        'termination',
        'Pool de conexiones liberado para preservar recursos Cloud.'
      );
    }
  }
}
