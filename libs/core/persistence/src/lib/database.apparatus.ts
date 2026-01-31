/** libs/core/persistence/src/lib/database.apparatus.ts */

import { PrismaClient } from '@prisma/client';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncContracts, TenantId } from '@omnisync/core-contracts';

import {
  DatabaseInfrastructureConfigurationSchema,
  IDatabaseInfrastructureConfiguration
} from './schemas/database.schema';
import { PrismaEngineBuilder } from './builders/prisma-engine.builder';

/**
 * @name OmnisyncDatabase
 * @description Aparato maestro de soberanía de persistencia relacional (SQL). 
 * Gestiona el ciclo de vida del motor Prisma bajo un patrón Singleton Resiliente. 
 * Implementa el protocolo de "Aislamiento de Capas Cruzadas" mediante la inyección 
 * de variables de sesión RLS (Row Level Security) para entornos Supabase/PostgreSQL.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Persistence-Sovereignty V3.2)
 * @vision Ultra-Holística: Zero-Trust-Isolation & High-Availability
 */
export class OmnisyncDatabase {
  /**
   * @private
   * Instancia única del motor preservada para optimizar el pool de conexiones 
   * en infraestructuras Cloud-Native.
   */
  private static relationalDatabaseEngineInstance: PrismaClient | null = null;

  /**
   * @method databaseEngine
   * @description Punto de acceso único a la persistencia. Orquesta la ignición 
   * mediante el Builder atomizado y valida el ADN de configuración.
   * 
   * @returns {PrismaClient} Motor Prisma validado y activo.
   */
  public static get databaseEngine(): PrismaClient {
    const apparatusName = 'OmnisyncDatabase';
    const operationName = 'get:databaseEngine';

    if (!this.relationalDatabaseEngineInstance) {
      /**
       * @section 1. Auditoría de Infraestructura (SSOT)
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
         * @section 2. Ignición mediante Especialista
         */
        this.relationalDatabaseEngineInstance = OmnisyncTelemetry.traceExecutionSync(
          apparatusName,
          operationName,
          () => PrismaEngineBuilder.buildSovereignClient(infrastructureConfiguration)
        );

        OmnisyncTelemetry.verbose(
          apparatusName,
          'ignition_success',
          'persistence.database.status.handshake_success',
          { environment: infrastructureConfiguration.executionEnvironment }
        );
      } catch (criticalInitializationError: unknown) {
        /**
         * @note Gestión de Desastres
         * El Sentinel captura el fallo de ignición (ej. DNS SQL inalcanzable).
         */
        OmnisyncSentinel.report({
          errorCode: 'OS-CORE-002',
          severity: 'CRITICAL',
          apparatus: apparatusName,
          operation: 'engine_ignition',
          message: 'persistence.database.errors.engine_failed',
          context: { errorTrace: String(criticalInitializationError) },
          isRecoverable: false,
        });
        throw criticalInitializationError;
      }
    }

    return this.relationalDatabaseEngineInstance;
  }

  /**
   * @method executeSovereignTask
   * @description Ejecuta una lógica de datos bajo el blindaje de Row Level Security. 
   * Inyecta el identificador del Tenant en la sesión local de PostgreSQL antes 
   * de procesar la tarea, garantizando aislamiento total a nivel de motor.
   *
   * @template T - Tipo de dato de retorno.
   * @param {TenantId} tenantId - Identificador nominal de soberanía.
   * @param {(client: PrismaClient) => Promise<T>} task - Función que consume el cliente.
   * @returns {Promise<T>} Resultado de la tarea auditada.
   */
  public static async executeSovereignTask<T>(
    tenantId: TenantId,
    task: (client: PrismaClient) => Promise<T>
  ): Promise<T> {
    const apparatusName = 'OmnisyncDatabase';
    const operationName = 'executeSovereignTask';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        /**
         * @section Protocolo RLS (PostgreSQL Standard)
         * El comando SET LOCAL debe ejecutarse dentro de una transacción ($transaction)
         * para asegurar que el ID de inquilino se mantenga ligado al socket de red actual.
         */
        return await this.databaseEngine.$transaction(async (sovereignClient) => {
          // 1. Inyección de Soberanía en la sesión SQL
          await sovereignClient.$executeRawUnsafe(
            `SET LOCAL app.current_tenant = '${tenantId}';`
          );

          OmnisyncTelemetry.verbose(
            apparatusName,
            'rls_enforced',
            `Escudo RLS activado para Tenant: ${tenantId}`
          );

          // 2. Ejecución de la lógica de negocio blindada
          return await task(sovereignClient as PrismaClient);
        });
      },
      { tenantId }
    );
  }

  /**
   * @method validateInfrastructureConnectivity
   * @description Ejecuta una sonda de integridad profunda (Heartbeat).
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
              await this.databaseEngine.$connect();
              await this.databaseEngine.$queryRaw`SELECT 1`;
            },
            apparatusName,
            'infrastructure_heartbeat'
          );

          OmnisyncTelemetry.verbose(
            apparatusName,
            'connectivity_audit',
            'persistence.database.status.heartbeat_operational'
          );
        } catch (connectivityError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-CORE-503',
            severity: 'CRITICAL',
            apparatus: apparatusName,
            operation: operationName,
            message: 'persistence.database.errors.connectivity_loss',
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
   * @description Cierre elegante del pool de conexiones.
   */
  public static async terminatePersistenceEngine(): Promise<void> {
    const apparatusName = 'OmnisyncDatabase';

    if (this.relationalDatabaseEngineInstance) {
      await this.relationalDatabaseEngineInstance.$disconnect();
      this.relationalDatabaseEngineInstance = null;

      OmnisyncTelemetry.verbose(
        apparatusName,
        'termination',
        'persistence.database.status.pool_shutdown'
      );
    }
  }
}