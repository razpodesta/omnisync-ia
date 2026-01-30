/** libs/core/persistence/src/lib/database.apparatus.ts */

import { PrismaClient } from '@prisma/client';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncContracts } from '@omnisync/core-contracts';

import {
  DatabaseInfrastructureConfigurationSchema,
  IDatabaseInfrastructureConfiguration
} from './schemas/database.schema';
import { PrismaEngineBuilder } from './builders/prisma-engine.builder';

/**
 * @name OmnisyncDatabase
 * @description Aparato de soberanía de persistencia relacional (SQL).
 * Gestiona el ciclo de vida del motor Prisma bajo un patrón Singleton Resiliente.
 * Orquesta la validación de infraestructura y la salud del cluster en la nube.
 *
 * @protocol OEDP-Level: Elite (Persistence Sovereignty V2.6)
 */
export class OmnisyncDatabase {
  /**
   * @private
   * Instancia única del motor preservada en el heap del proceso para evitar
   * el agotamiento de sockets en entornos Serverless/Containerized.
   */
  private static relationalDatabaseEngineInstance: PrismaClient | null = null;

  /**
   * @method databaseEngine
   * @description Punto de acceso único a la persistencia. Orquesta la validación
   * de infraestructura y la ignición del motor mediante el Builder atomizado.
   *
   * @returns {PrismaClient} Motor Prisma validado y activo.
   */
  public static get databaseEngine(): PrismaClient {
    const apparatusName = 'OmnisyncDatabase';
    const operationName = 'get:databaseEngine';

    if (!this.relationalDatabaseEngineInstance) {
      /**
       * @section 1. Auditoría de Soberanía (Infrastructure Verification)
       * Validamos que las variables de entorno existan y cumplan con el contrato SSOT.
       */
      const infrastructureConfiguration: IDatabaseInfrastructureConfiguration =
        OmnisyncContracts.validate(
          DatabaseInfrastructureConfigurationSchema,
          {
            relationalDatabaseUrl: process.env['DATABASE_URL'],
            executionEnvironment: process.env['NODE_ENV'] || 'development',
          },
          apparatusName
        );

      try {
        /**
         * @section 2. Ignición mediante Builder Atomizado
         * Delegamos la construcción física al especialista para mantener SRP.
         */
        this.relationalDatabaseEngineInstance = OmnisyncTelemetry.traceExecutionSync(
          apparatusName,
          operationName,
          () => PrismaEngineBuilder.buildSovereignClient(infrastructureConfiguration)
        );

        OmnisyncTelemetry.verbose(
          apparatusName,
          'initialization',
          'database.status.handshake_success',
          { environment: infrastructureConfiguration.executionEnvironment }
        );
      } catch (criticalInitializationError: unknown) {
        /**
         * @section Protocolo de Desastre
         * El Sentinel captura el fallo de ignición (ej. Credenciales inválidas).
         */
        OmnisyncSentinel.report({
          errorCode: 'OS-CORE-002',
          severity: 'CRITICAL',
          apparatus: apparatusName,
          operation: 'engine_ignition',
          message: 'database.errors.engine_failed',
          context: { errorTrace: String(criticalInitializationError) },
          isRecoverable: false,
        });
        throw criticalInitializationError;
      }
    }

    return this.relationalDatabaseEngineInstance;
  }

  /**
   * @method validateInfrastructureConnectivity
   * @description Ejecuta una sonda de integridad profunda (Heartbeat).
   * Valida la latencia y la disponibilidad del cluster remoto (Supabase/Neon).
   */
  public static async validateInfrastructureConnectivity(): Promise<void> {
    const apparatusName = 'OmnisyncDatabase';
    const operationName = 'validateInfrastructureConnectivity';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        try {
          await OmnisyncSentinel.executeWithResilience(
            async () => {
              /**
               * Handshake físico con la base de datos remota.
               * Se ejecuta una consulta trivial para medir latencia de red.
               */
              await this.databaseEngine.$connect();
              await this.databaseEngine.$queryRaw`SELECT 1`;
            },
            apparatusName,
            'infrastructure_heartbeat'
          );

          OmnisyncTelemetry.verbose(
            apparatusName,
            'connectivity_audit',
            'database.status.heartbeat_operational'
          );
        } catch (connectivityError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-CORE-503',
            severity: 'CRITICAL',
            apparatus: apparatusName,
            operation: operationName,
            message: 'database.errors.connectivity_loss',
            context: { errorDetail: String(connectivityError) },
            isRecoverable: true,
          });
          throw connectivityError;
        }
      }
    );
  }

  /**
   * @method terminatePersistenceEngine
   * @description Cierre elegante del pool de conexiones para evitar fugas de recursos.
   * Crucial para el ciclo de vida de despliegue en Render.
   */
  public static async terminatePersistenceEngine(): Promise<void> {
    const apparatusName = 'OmnisyncDatabase';

    if (this.relationalDatabaseEngineInstance) {
      await this.relationalDatabaseEngineInstance.$disconnect();
      this.relationalDatabaseEngineInstance = null;

      OmnisyncTelemetry.verbose(
        apparatusName,
        'termination',
        'database.status.pool_shutdown'
      );
    }
  }
}