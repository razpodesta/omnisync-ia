/** libs/domain/tenants/src/lib/tenant-manager.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncDatabase } from '@omnisync-ecosystem/persistence';
import {
  ITenantConfiguration,
  TenantConfigurationSchema,
  TenantId,
} from '@omnisync/core-contracts';

/**
 * @name OmnisyncTenantManager
 * @description Aparato de dominio encargado de la gobernanza de identidades corporativas.
 * Orquesta la recuperación, validación y activación del ADN de cada organización (Tenant).
 *
 * @protocol OEDP-Level: Elite (Database-Driven & SSOT-Compliant)
 */
export class OmnisyncTenantManager {
  /**
   * @method getSovereignConfiguration
   * @description Recupera el ADN técnico de una organización mediante su identificador único.
   *
   * @param {TenantId} tenantOrganizationIdentifier - El ID nominal (Branded Type).
   * @returns {Promise<ITenantConfiguration>} Configuración validada y lista para la acción.
   */
  public static async getSovereignConfiguration(
    tenantOrganizationIdentifier: TenantId,
  ): Promise<ITenantConfiguration> {
    return await OmnisyncTelemetry.traceExecution(
      'OmnisyncTenantManager',
      'getSovereignConfiguration',
      async () => {
        try {
          /**
           * @section Acceso a Persistencia
           * Se utiliza el motor nivelado OmnisyncDatabase para consultar Supabase.
           */
          const rawConfigurationRecord =
            await OmnisyncDatabase.databaseEngine.tenant.findUnique({
              where: { id: tenantOrganizationIdentifier },
            });

          if (!rawConfigurationRecord) {
            throw new Error('domain.tenants.errors.not_found');
          }

          /**
           * @section Validación de ADN (SSOT)
           * Asegura que el registro de la DB cumpla con las leyes del monorepo.
           */
          return TenantConfigurationSchema.parse(rawConfigurationRecord);
        } catch (criticalError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-DOM-404',
            severity: 'HIGH',
            apparatus: 'OmnisyncTenantManager',
            operation: 'resolve_by_id',
            message: 'domain.tenants.errors.resolution_failure',
            context: {
              tenantId: tenantOrganizationIdentifier,
              error: String(criticalError),
            },
            isRecoverable: true,
          });
          throw criticalError;
        }
      },
    );
  }

  /**
   * @method resolveConfigurationByUrlSlug
   * @description Localiza un nodo mediante su identificador semántico (Slug).
   * Esencial para la personalización de la interfaz administrativa y Web Chat.
   */
  public static async resolveConfigurationByUrlSlug(
    urlIdentifierSlug: string,
  ): Promise<ITenantConfiguration> {
    return await OmnisyncTelemetry.traceExecution(
      'OmnisyncTenantManager',
      'resolveConfigurationByUrlSlug',
      async () => {
        const rawConfigurationRecord =
          await OmnisyncDatabase.databaseEngine.tenant.findFirst({
            where: { urlSlug: urlIdentifierSlug.toLowerCase().trim() },
          });

        if (!rawConfigurationRecord) {
          throw new Error('domain.tenants.errors.slug_not_found');
        }

        return TenantConfigurationSchema.parse(rawConfigurationRecord);
      },
    );
  }

  /**
   * @method validateTenantOperationalStatus
   * @description Verifica si una organización tiene permitido el consumo de recursos de IA.
   */
  public static async validateTenantOperationalStatus(
    tenantId: TenantId,
  ): Promise<boolean> {
    const configuration = await this.getSovereignConfiguration(tenantId);

    const isNodeActive = configuration.status === 'ACTIVE';

    if (!isNodeActive) {
      OmnisyncTelemetry.verbose(
        'OmnisyncTenantManager',
        'status_check',
        'domain.tenants.errors.inactive',
        { tenantId },
      );
    }

    return isNodeActive;
  }
}
