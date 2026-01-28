/** apps/orchestrator-api/src/app/apparatus/sovereignty-resolver.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncDatabase } from '@omnisync-ecosystem/persistence';
import {
  ITenantConfiguration,
  TenantConfigurationSchema,
  TenantId
} from '@omnisync/core-contracts';

/**
 * @name SovereigntyResolverApparatus
 * @description Aparato de gobernanza encargado de la resolución de identidades corporativas.
 * Actúa como el guardián de acceso a la configuración del suscriptor, validando
 * la integridad del ADN organizacional y su estado operativo actual.
 *
 * @protocol OEDP-Level: Elite (Identity Governance)
 */
export class SovereigntyResolverApparatus {

  /**
   * @method resolveTenantSovereignty
   * @description Localiza y valida la configuración completa de una organización.
   * Ejecuta una validación de contrato SSOT sobre el registro de base de datos.
   *
   * @param {TenantId} tenantOrganizationIdentifier - Identificador nominal del nodo.
   * @returns {Promise<ITenantConfiguration>} Configuración validada y lista para la acción.
   * @throws {Error} Si el nodo no existe o su ADN es inconsistente.
   */
  public static async resolveTenantSovereignty(
    tenantOrganizationIdentifier: TenantId
  ): Promise<ITenantConfiguration> {
    const apparatusName = 'SovereigntyResolverApparatus';
    const operationName = 'resolveTenantSovereignty';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        try {
          /**
           * @section Consulta a Persistencia Soberana
           * Utilizamos el motor de base de datos relacional para recuperar el ADN.
           */
          const rawConfigurationRecord = await OmnisyncDatabase.databaseEngine.tenant.findUnique({
            where: { id: tenantOrganizationIdentifier }
          });

          /**
           * @section Verificación de Existencia Física
           * Si el registro no existe, el Sentinel reporta una anomalía de acceso
           * ya que una petición llegó con un TenantId no registrado.
           */
          if (!rawConfigurationRecord) {
            const nodeNotFoundError = new Error(`OS-DOM-404: Nodo [${tenantOrganizationIdentifier}] no localizado en la infraestructura.`);

            await OmnisyncSentinel.report({
              errorCode: 'OS-DOM-404',
              severity: 'HIGH',
              apparatus: apparatusName,
              operation: operationName,
              message: 'core.sovereignty.node_not_found',
              context: { tenantId: tenantOrganizationIdentifier },
              isRecoverable: false
            });

            throw nodeNotFoundError;
          }

          /**
           * @section Validación de ADN (SSOT)
           * Transformamos el registro bruto en un objeto tipado e inmutable.
           */
          const validatedConfiguration = TenantConfigurationSchema.parse(rawConfigurationRecord);

          /**
           * @section Auditoría de Estado Operativo
           * Bloqueamos el flujo si el nodo se encuentra suspendido o en mantenimiento.
           */
          if (validatedConfiguration.status !== 'ACTIVE') {
             OmnisyncTelemetry.verbose(apparatusName, 'status_check', `Nodo [${tenantOrganizationIdentifier}] inactivo: ${validatedConfiguration.status}`);
             throw new Error(`OS-DOM-403: El servicio para la organización está temporalmente ${validatedConfiguration.status}.`);
          }

          return validatedConfiguration;

        } catch (criticalResolverError: unknown) {
          // Si es un error de Zod, el Sentinel lo captura mediante el middleware de contratos
          if (criticalResolverError instanceof Error && !criticalResolverError.message.includes('OS-DOM')) {
            await OmnisyncSentinel.report({
              errorCode: 'OS-CORE-503',
              severity: 'CRITICAL',
              apparatus: apparatusName,
              operation: 'database_handshake',
              message: 'core.sovereignty.resolution_failed',
              context: { error: String(criticalResolverError) },
              isRecoverable: true
            });
          }
          throw criticalResolverError;
        }
      }
    );
  }
}
