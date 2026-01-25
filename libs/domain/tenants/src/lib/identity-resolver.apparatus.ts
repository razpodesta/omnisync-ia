/** libs/domain/tenants/src/lib/identity-resolver.apparatus.ts */
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { ICustomerProfile, CustomerProfileSchema } from '@omnisync/core-contracts';

/**
 * @name IdentityResolver
 * @description Resuelve la identidad del cliente consultando el CRM configurado del Tenant.
 */
export class IdentityResolver {
  /**
   * @method resolveFromPhone
   * @description Busca un cliente por teléfono y devuelve su perfil normalizado.
   */
  public static async resolveFromPhone(
    tenantId: string,
    phoneNumber: string,
    crmAdapter: any // Se nivelará a ICRMAdapter interface
  ): Promise<ICustomerProfile | null> {
    return await OmnisyncTelemetry.traceExecution(
      'IdentityResolver',
      'resolveFromPhone',
      async () => {
        try {
          // 1. Consulta vía Adaptador (Agnosticismo)
          const rawCustomer = await crmAdapter.getCustomerByPhone(phoneNumber);
          
          if (!rawCustomer) {
            OmnisyncTelemetry.verbose('IdentityResolver', 'resolve', 'Customer not found, continuing as guest');
            return null;
          }

          // 2. Validación de Contrato
          return CustomerProfileSchema.parse(rawCustomer);
        } catch (error) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-DOM-501',
            severity: 'MEDIUM',
            apparatus: 'IdentityResolver',
            operation: 'resolve',
            message: 'Error al consultar base de datos de clientes',
            context: { tenantId, phoneNumber }
          });
          return null; 
        }
      }
    );
  }
}