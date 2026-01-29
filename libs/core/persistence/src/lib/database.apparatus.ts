/** libs/core/persistence/src/lib/database.apparatus.ts */

import { PrismaClient, Prisma } from '@prisma/client';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncContracts } from '@omnisync/core-contracts';

/**
 * @section Sincronización de ADN Local
 * Inyectamos el esquema de infraestructura para validación previa a la ignición.
 */
import {
  DatabaseInfrastructureConfigurationSchema,
  IDatabaseInfrastructureConfiguration,
} from './schemas/database.schema';

/**
 * @name OmnisyncDatabase
 * @description Aparato de soberanía de persistencia relacional (SQL).
 * Actúa como el guardián supremo del motor Prisma, gestionando el pool de
 * conexiones y garantizando la integridad transaccional mediante un patrón 
 * Singleton optimizado para orquestación Cloud-Native.
 *
 * @protocol OEDP-Level: Elite (Persistence Sovereignty V2.5)
 */
export class OmnisyncDatabase {
  /**
   * @private
   * @description Instancia única del motor. Se mantiene nula hasta que la primera 
   * petición valide la soberanía del ADN de infraestructura.
   */
  private static relationalDatabaseEngineInstance: PrismaClient | null = null;

  /**
   * @method databaseEngine
   * @description Punto de acceso único a la persistencia relacional. 
   * Orquesta la validación de infraestructura y la ignición del motor Prisma.
   *
   * @returns {PrismaClient} El motor de persistencia activo y validado.
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
       * @section Fase 2: Resolución de Opciones del Motor
       * RESOLUCIÓN TS2353/TS2322: Se utiliza 'datasourceUrl' de forma explícita.
       * Si el cliente generado por Prisma no está presente, TS inferirá 'never'.
       * Para evitarlo, definimos el objeto de opciones bajo el estándar actual.
       */
      const logConfiguration: Prisma.LogLevel[] =
        infrastructureConfiguration.executionEnvironment === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'];

      try {
        /**
         * @section Fase 3: Ignición con Telemetría Sincrónica
         * RESOLUCIÓN ESLINT: Integramos 'operationName' en la traza para evitar variable huérfana.
         */
        this.relationalDatabaseEngineInstance = OmnisyncTelemetry.traceExecutionSync(
          apparatusName,
          operationName,
          () => {
            /**
             * @note Sello de Ingeniería
             * Inyectamos la URL directamente en el constructor de Prisma 6/7.
             */
            return new PrismaClient({
              datasourceUrl: infrastructureConfiguration.relationalDatabaseUrl,
              log: logConfiguration,
            });
          }
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
   * @description Ejecuta una sonda de integridad profunda (Heartbeat) contra 
   * el cluster remoto de SQL. Valida el pool de conexiones y la latencia.
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
           * @note Sonda Atómica con Resiliencia Sentinel
           */
          await OmnisyncSentinel.executeWithResilience(
            async () => {
              await this.databaseEngine.$connect();
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
   * @description Realiza el cierre atómico y elegante de los recursos de red.
   * Indispensable para prevenir la saturación de conexiones en tiers Cloud.
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