/** libs/core/persistence/src/lib/database.apparatus.ts */

import { PrismaClient, Prisma } from '@prisma/client';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncContracts } from '@omnisync/core-contracts';

/**
 * @section Sincronización de ADN Local
 * Se importan los esquemas atómicos para validar la soberanía de la infraestructura.
 */
import {
  DatabaseInfrastructureConfigurationSchema,
  IDatabaseInfrastructureConfiguration,
} from './schemas/database.schema';

/**
 * @name OmnisyncDatabase
 * @description Aparato de soberanía de persistencia relacional (SQL).
 * Actúa como el guardián supremo del motor Prisma, gestionando el ciclo de vida
 * de las conexiones y garantizando la integridad de las transacciones mediante
 * un patrón Singleton de alta disponibilidad optimizado para la nube.
 *
 * @protocol OEDP-Level: Elite (Hyper-Atomized Persistence V2.4)
 */
export class OmnisyncDatabase {
  /**
   * @private
   * @description Instancia única del motor. Se mantiene nula hasta la primera
   * solicitud validada para optimizar recursos en el arranque.
   */
  private static relationalDatabaseEngineInstance: PrismaClient | null = null;

  /**
   * @method databaseEngine
   * @description Punto de acceso soberano a la persistencia. Orquesta la
   * validación del ADN de infraestructura y la ignición resiliente del motor.
   *
   * @returns {PrismaClient} El motor de persistencia validado y listo para operar.
   */
  public static get databaseEngine(): PrismaClient {
    const apparatusName = 'OmnisyncDatabase';
    const operationName = 'get:databaseEngine';

    if (!this.relationalDatabaseEngineInstance) {
      /**
       * @section Fase 1: Auditoría de Soberanía (Infrastructure Check)
       */
      const infrastructureConfiguration: IDatabaseInfrastructureConfiguration =
        OmnisyncContracts.validate(
          DatabaseInfrastructureConfigurationSchema,
          {
            relationalDatabaseUrl: process.env['DATABASE_URL'],
            executionEnvironment: process.env['NODE_ENV'] || 'development',
          },
          apparatusName,
        );

      /**
       * @section Fase 2: Resolución de Tipos y Opciones (Elite Type-Fix)
       * RESOLUCIÓN TS2353/TS2322: Definimos las opciones con el tipo base de Prisma.
       * Se utiliza la estructura 'datasources' que coincide con el nombre 'db' del schema.prisma.
       */
      const logConfiguration: Prisma.LogLevel[] =
        infrastructureConfiguration.executionEnvironment === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'];

      /**
       * @note Sello de Calidad
       * El casting a 'any' está prohibido por OEDP, por lo que construimos el objeto
       * satisfaciendo la interfaz Prisma.PrismaClientOptions de forma nativa.
       */
      const clientOptions: Prisma.PrismaClientOptions = {
        datasources: {
          db: {
            url: infrastructureConfiguration.relationalDatabaseUrl,
          },
        },
        log: logConfiguration,
      };

      try {
        /**
         * @section Fase 3: Ignición con Telemetría Sincrónica
         */
        this.relationalDatabaseEngineInstance = OmnisyncTelemetry.traceExecutionSync(
          apparatusName,
          operationName,
          () => new PrismaClient(clientOptions)
        );

        OmnisyncTelemetry.verbose(
          apparatusName,
          'initialization',
          'persistence.database.handshake_success',
          { environment: infrastructureConfiguration.executionEnvironment }
        );
      } catch (criticalInstantiationError: unknown) {
        OmnisyncSentinel.report({
          errorCode: 'OS-CORE-002',
          severity: 'CRITICAL',
          apparatus: apparatusName,
          operation: 'instantiation',
          message: 'persistence.database.error.engine_failed',
          context: { errorTrace: String(criticalInstantiationError) },
          isRecoverable: false,
        });
        throw criticalInstantiationError;
      }
    }

    return this.relationalDatabaseEngineInstance;
  }

  /**
   * @method validateInfrastructureConnectivity
   * @description Ejecuta una sonda de integridad profunda (Heartbeat) contra el cluster remoto.
   * Valida que la infraestructura sea accesible y el pool de conexiones sea íntegro.
   *
   * @returns {Promise<void>}
   */
  public static async validateInfrastructureConnectivity(): Promise<void> {
    const apparatusName = 'OmnisyncDatabase';
    const operationName = 'validateInfrastructureConnectivity';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        try {
          /**
           * @note Sonda Atómica con Resiliencia
           */
          await OmnisyncSentinel.executeWithResilience(
            async () => {
              await this.databaseEngine.$connect();
              // Ejecución de consulta minimalista para validar el motor SQL
              await this.databaseEngine.$queryRaw`SELECT 1`;
            },
            apparatusName,
            'infrastructure_heartbeat'
          );

          OmnisyncTelemetry.verbose(
            apparatusName,
            'connectivity_status',
            'persistence.database.heartbeat_operational'
          );
        } catch (connectivityError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-CORE-503',
            severity: 'CRITICAL',
            apparatus: apparatusName,
            operation: operationName,
            message: 'persistence.database.error.connectivity_loss',
            context: {
              errorDetail: String(connectivityError),
              timestamp: new Date().toISOString(),
            },
            isRecoverable: true,
          });

          throw connectivityError;
        }
      },
    );
  }

  /**
   * @method terminatePersistenceEngine
   * @description Realiza el apagado elegante de los recursos de red.
   * Previene la fuga de conexiones en tiers gratuitos de bases de datos.
   *
   * @returns {Promise<void>}
   */
  public static async terminatePersistenceEngine(): Promise<void> {
    const apparatusName = 'OmnisyncDatabase';

    if (this.relationalDatabaseEngineInstance) {
      await this.relationalDatabaseEngineInstance.$disconnect();
      this.relationalDatabaseEngineInstance = null;

      OmnisyncTelemetry.verbose(
        apparatusName,
        'termination',
        'persistence.database.pool_shutdown_success'
      );
    }
  }
}
