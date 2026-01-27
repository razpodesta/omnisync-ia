/** libs/integrations/erp-adapter-mock/src/lib/mock-adapter.apparatus.ts */

import { IEnterpriseResourcePlanningAdapter } from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @name MockEnterpriseResourcePlanningAdapter
 * @description Adaptador de simulación para pruebas de integración.
 * Emula el comportamiento de un sistema de gestión externo (ERP) inyectando
 * latencia artificial para validar la resiliencia del ecosistema.
 *
 * @protocol OEDP-Level: Elite (Clean DNA)
 */
export class MockEnterpriseResourcePlanningAdapter implements IEnterpriseResourcePlanningAdapter {

  public readonly providerName = 'MOCK_ENTERPRISE_SYSTEM_V1';

  private static readonly SIMULATED_NETWORK_LATENCY = 450;

  /**
   * @method createOperationTicket
   */
  public async createOperationTicket(operationalData: unknown): Promise<{
    readonly externalIdentifier: string;
    readonly operationalStatus: string;
  }> {
    return await OmnisyncTelemetry.traceExecution(
      'MockEnterpriseResourcePlanningAdapter',
      'createOperationTicket',
      async () => {
        await this.simulateNetworkDelay();

        OmnisyncTelemetry.verbose(
          'MockEnterpriseResourcePlanningAdapter',
          'execution',
          'integrations.erp_mock.ticket_provisioning',
          { receivedPayload: operationalData }
        );

        return {
          externalIdentifier: `MOCK-TICKET-${Math.floor(Math.random() * 1000000)}`,
          operationalStatus: 'OPEN_SYNCHRONIZED'
        };
      }
    );
  }

  /**
   * @method validateCustomerExistence
   */
  public async validateCustomerExistence(customerPhoneNumber: string): Promise<{
    readonly exists: boolean;
    readonly externalIdentifier?: string;
  }> {
    return await OmnisyncTelemetry.traceExecution(
      'MockEnterpriseResourcePlanningAdapter',
      'validateCustomerExistence',
      async () => {
        await this.simulateNetworkDelay();

        const isKnownCustomer = customerPhoneNumber.includes('55');

        return {
          exists: isKnownCustomer,
          externalIdentifier: isKnownCustomer ? 'MOCK-CUST-ID-001' : undefined
        };
      }
    );
  }

  private async simulateNetworkDelay(): Promise<void> {
    return new Promise((resolve) =>
      setTimeout(resolve, MockEnterpriseResourcePlanningAdapter.SIMULATED_NETWORK_LATENCY)
    );
  }
}
