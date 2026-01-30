/** libs/domain/tenants/src/lib/tenant-manager.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncDatabase } from '@omnisync/core-persistence';
import {
  ITenantConfiguration,
  TenantConfigurationSchema,
  TenantId,
  OmnisyncContracts,
} from '@omnisync/core-contracts';

/** 
 * @section Sincronización de ADN Local
 * RESOLUCIÓN LINT: Inyección de Zod local para validación de fronteras.
 */
import { TenantResolutionContextSchema } from './schemas/tenant-manager.schema';

/**
 * @name OmnisyncTenantManager
 * @description Nodo maestro de gobernanza corporativa. Orquesta el ciclo de vida 
 * de la identidad organizacional, actuando como el guardián del ADN técnico 
 * del suscriptor. Implementa la "Aduana de Identidad" para asegurar que solo 
 * nodos íntegros y activos participen en la inferencia neural.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Identity-Governance V3.2)
 * @vision Ultra-Holística: Multi-tenant-Isolation & Zero-Any
 */
export class OmnisyncTenantManager {
  /**
   * @method getSovereignConfiguration
   * @description Localiza y valida la configuración completa de un Tenant por su ID nominal.
   * Implementa una validación biyectiva (SSOT) sobre el registro de SQL.
   *
   * @param {TenantId} tenantId - Identificador nominal (Branded Type).
   * @returns {Promise<Readonly<ITenantConfiguration>>} Configuración sellada e inmutable.
   */
  public static async getSovereignConfiguration(
    tenantId: TenantId,
  ): Promise<Readonly<ITenantConfiguration>> {
    const apparatusName = 'OmnisyncTenantManager';
    const operationName = 'getSovereignConfiguration';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        try {
          /**
           * @section Acceso a Persistencia Relacional
           * Handshake con Supabase Cloud bajo el patrón Singleton de OmnisyncDatabase.
           */
          const rawConfiguration = await OmnisyncDatabase.databaseEngine.tenant.findUnique({
            where: { id: tenantId },
          });

          if (!rawConfiguration) {
            throw new Error('domain.tenants.errors.not_found');
          }

          /**
           * @section Sello de Integridad SSOT
           * Validamos que el ADN recuperado de la DB coincida con el contrato global.
           */
          return OmnisyncContracts.validate(
            TenantConfigurationSchema,
            rawConfiguration,
            `${apparatusName}:DatabaseAudit`
          );
        } catch (criticalError: unknown) {
          /**
           * @note Resiliencia y Reporte
           * El Sentinel intercepta el fallo para auditoría de seguridad.
           */
          await OmnisyncSentinel.report({
            errorCode: 'OS-DOM-404',
            severity: 'HIGH',
            apparatus: apparatusName,
            operation: operationName,
            message: 'domain.tenants.errors.resolution_failure',
            context: { tenantId, errorTrace: String(criticalError) },
            isRecoverable: true,
          });
          throw criticalError;
        }
      },
      { tenantId }
    );
  }

  /**
   * @method resolveConfigurationByUrlSlug
   * @description Localiza un nodo mediante su identificador semántico (Slug). 
   * Valida el formato del slug localmente antes de disparar la consulta SQL.
   *
   * @param {string} urlSlug - Identificador amigable (ej: 'metashark-tech').
   * @returns {Promise<Readonly<ITenantConfiguration>>}
   */
  public static async resolveConfigurationByUrlSlug(
    urlSlug: string,
  ): Promise<Readonly<ITenantConfiguration>> {
    const apparatusName = 'OmnisyncTenantManager';
    const operationName = 'resolveConfigurationByUrlSlug';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        /**
         * @section Validación de Aduana (LINT Fix)
         * Utilizamos el esquema local para sanitizar la entrada.
         */
        const validatedContext = OmnisyncContracts.validate(
          TenantResolutionContextSchema,
          { urlSlug },
          `${apparatusName}:SlugValidation`
        );

        const rawConfiguration = await OmnisyncDatabase.databaseEngine.tenant.findFirst({
          where: { urlSlug: validatedContext.urlSlug },
        });

        if (!rawConfiguration) {
          throw new Error('domain.tenants.errors.slug_not_found');
        }

        return OmnisyncContracts.validate(
          TenantConfigurationSchema,
          rawConfiguration,
          `${apparatusName}:SlugHandshake`
        );
      },
      { slug: urlSlug }
    );
  }

  /**
   * @method validateTenantOperationalStatus
   * @description Sensor de seguridad de grado militar. Bloquea el consumo de tokens 
   * si el nodo está en mantenimiento o suspendido.
   */
  public static async validateTenantOperationalStatus(
    tenantId: TenantId,
  ): Promise<boolean> {
    const apparatusName = 'OmnisyncTenantManager';

    try {
      /**
       * @note Optimización de Pulso
       * Realizamos una resolución rápida para validar el estado operativo.
       */
      const config = await this.getSovereignConfiguration(tenantId);
      const isHealthy = config.status === 'ACTIVE';

      if (!isHealthy) {
        OmnisyncTelemetry.verbose(
          apparatusName,
          'operational_block',
          `Consumo neural bloqueado para [${tenantId}]. Fase actual: ${config.status}.`
        );
      }

      return isHealthy;
    } catch (error: unknown) {
      OmnisyncTelemetry.verbose(apparatusName, 'status_audit_error', String(error));
      return false;
    }
  }
}