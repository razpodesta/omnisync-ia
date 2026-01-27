/** libs/domain/tenants/src/lib/identity-resolver.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import {
  ICustomerProfile,
  CustomerProfileSchema,
  ICRMAdapter,
  TenantId
} from '@omnisync/core-contracts';

/**
 * @name IdentityResolver
 * @description Aparato de dominio encargado de la resolución de identidades.
 * Actúa como un puente agnóstico que consulta el CRM asignado al Tenant para
 * identificar al usuario final y normalizar su perfil de cliente.
 */
export class IdentityResolver {
  /**
   * @method resolveIdentityFromPhoneNumber
   * @description Orquesta la búsqueda del cliente aplicando validación de contrato post-recuperación.
   *
   * @param {TenantId} tenantOrganizationIdentifier Identificador único de la organización.
   * @param {string} userPhoneNumber Número de teléfono en formato E.164.
   * @param {ICRMAdapter} crmSystemAdapter Adaptador técnico del CRM (Inyectado).
   * @returns {Promise<Readonly<ICustomerProfile> | null>} Perfil validado o null si es un cliente nuevo.
   */
  public static async resolveIdentityFromPhoneNumber(
    tenantOrganizationIdentifier: TenantId,
    userPhoneNumber: string,
    crmSystemAdapter: ICRMAdapter
  ): Promise<Readonly<ICustomerProfile> | null> {
    return await OmnisyncTelemetry.traceExecution(
      'IdentityResolver',
      'resolveIdentityFromPhoneNumber',
      async () => {
        try {
          /**
           * 1. Consulta vía Adaptador
           * El adaptador se encarga de la comunicación técnica (API/SQL).
           */
          const rawCustomerRecord = await crmSystemAdapter.getCustomerByPhone(userPhoneNumber);

          if (!rawCustomerRecord) {
            OmnisyncTelemetry.verbose(
              'IdentityResolver',
              'resolve',
              `Cliente no localizado en ${crmSystemAdapter.providerName}. Continuando flujo como invitado.`
            );
            return null;
          }

          /**
           * 2. Validación de Contrato SSOT
           * Asegura que los datos del CRM no contaminen el sistema con estructuras inesperadas.
           */
          return CustomerProfileSchema.parse(rawCustomerRecord);

        } catch (criticalError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-DOM-501',
            severity: 'MEDIUM',
            apparatus: 'IdentityResolver',
            operation: 'resolve',
            message: 'Error de integridad o conectividad con el sistema CRM',
            context: {
              tenantId: tenantOrganizationIdentifier,
              phone: userPhoneNumber,
              error: String(criticalError)
            }
          });
          return null;
        }
      }
    );
  }
}
