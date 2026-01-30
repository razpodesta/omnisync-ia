/** apps/orchestrator-api/src/app/apparatus/sovereignty-resolver.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
/**
 * @section Sincronización de Persistencia
 * RESOLUCIÓN TS2307: Se actualiza el alias al nombre nominal soberano.
 */
import { OmnisyncDatabase } from '@omnisync/core-persistence';
import {
  ITenantConfiguration,
  TenantConfigurationSchema,
  TenantId,
  OmnisyncContracts,
} from '@omnisync/core-contracts';

/**
 * @name SovereigntyResolverApparatus
 * @description Aparato de gobernanza encargado de la resolución de identidades corporativas.
 * Actúa como el guardián de acceso al ADN del suscriptor, validando la integridad 
 * de la configuración y el estado operativo del nodo solicitado.
 *
 * @protocol OEDP-Level: Elite (Identity-Governance V3.0)
 */
export class SovereigntyResolverApparatus {
  /**
   * @method resolveTenantSovereignty
   * @description Localiza, valida y entrega la configuración completa de una organización.
   * Ejecuta una validación estricta (SSOT) sobre el registro recuperado de la base de datos.
   *
   * @param {TenantId} tenantOrganizationIdentifier - Identificador nominal del nodo.
   * @returns {Promise<ITenantConfiguration>} Configuración validada y sellada.
   * @throws {Error} Si el nodo es inexistente, está inactivo o su ADN es inconsistente.
   */
  public static async resolveTenantSovereignty(
    tenantOrganizationIdentifier: TenantId,
  ): Promise<ITenantConfiguration> {
    const apparatusName = 'SovereigntyResolverApparatus';
    const operationName = 'resolveTenantSovereignty';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        try {
          /**
           * @section 1. Consulta a Persistencia Relacional
           * Handshake con Supabase Cloud mediante el motor nivelado.
           */
          const rawConfigurationRecord =
            await OmnisyncDatabase.databaseEngine.tenant.findUnique({
              where: { id: tenantOrganizationIdentifier },
            });

          /**
           * @section 2. Verificación de Existencia Física
           * Si el registro es nulo, el Sentinel reporta una tentativa de acceso no autorizada.
           */
          if (!rawConfigurationRecord) {
            const anomalyMessage = `OS-DOM-404: El nodo organizacional [${tenantOrganizationIdentifier}] no existe en la infraestructura.`;

            await OmnisyncSentinel.report({
              errorCode: 'OS-DOM-404',
              severity: 'HIGH',
              apparatus: apparatusName,
              operation: operationName,
              message: 'core.sovereignty.error.node_not_found',
              context: { requestedTenantId: tenantOrganizationIdentifier },
              isRecoverable: false,
            });

            throw new Error(anomalyMessage);
          }

          /**
           * @section 3. Validación de ADN Estructural (SSOT)
           * Transformamos el registro bruto en una instancia inmutable validada por Zod.
           */
          const validatedConfiguration = OmnisyncContracts.validate(
            TenantConfigurationSchema,
            rawConfigurationRecord,
            `${apparatusName}:DatabaseRecord`
          );

          /**
           * @section 4. Auditoría de Estado Operativo
           * Bloqueamos la ejecución si el nodo no está en fase 'ACTIVE'.
           */
          if (validatedConfiguration.status !== 'ACTIVE') {
            OmnisyncTelemetry.verbose(
              apparatusName,
              'operational_block',
              `Acceso denegado: Nodo [${tenantOrganizationIdentifier}] se encuentra en estado ${validatedConfiguration.status}.`
            );
            throw new Error(`OS-DOM-403: El servicio para esta organización está en ${validatedConfiguration.status}.`);
          }

          return validatedConfiguration;
        } catch (criticalResolverError: unknown) {
          /**
           * @section Gestión de Fallos de Infraestructura
           * Filtramos errores de dominio para reportar solo brechas de red o conectividad SQL.
           */
          if (
            criticalResolverError instanceof Error &&
            !criticalResolverError.message.includes('OS-DOM')
          ) {
            await OmnisyncSentinel.report({
              errorCode: 'OS-CORE-503',
              severity: 'CRITICAL',
              apparatus: apparatusName,
              operation: 'database_handshake',
              message: 'core.sovereignty.error.resolution_failed',
              context: { errorTrace: String(criticalResolverError) },
              isRecoverable: true,
            });
          }
          throw criticalResolverError;
        }
      },
      { tenantId: tenantOrganizationIdentifier }
    );
  }
}