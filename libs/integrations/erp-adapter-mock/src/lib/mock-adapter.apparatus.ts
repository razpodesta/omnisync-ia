/** libs/integrations/erp-adapter-mock/src/lib/mock-adapter.apparatus.ts */

import {
  IEnterpriseResourcePlanningAdapter,
  IEnterpriseResourcePlanningActionResponse,
  EnterpriseResourcePlanningActionResponseSchema
} from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @name MockEnterpriseResourcePlanningAdapter
 * @description Adaptador de simulación nivelado al estándar OEDP V2.0.
 * Emula la respuesta de un ERP externo validando la salida contra el contrato SSOT.
 *
 * @protocol OEDP-Level: Elite (Contract-Aligned)
 */
export class MockEnterpriseResourcePlanningAdapter implements IEnterpriseResourcePlanningAdapter {
  /** Identificador nominal para telemetría */
  public readonly providerName = 'MOCK_ENTERPRISE_SYSTEM_V2';

  private static readonly SIMULATED_LATENCY_MS = 320;

  /**
   * @method createOperationTicket
   * @description Simula la creación de un ticket retornando el esquema institucional.
   */
  public async createOperationTicket(
    _operationalPayload: unknown
  ): Promise<IEnterpriseResourcePlanningActionResponse> {
    return await OmnisyncTelemetry.traceExecution(
      'MockEnterpriseResourcePlanningAdapter',
      'createOperationTicket',
      async () => {
        await this.injectNetworkLatency();

        return EnterpriseResourcePlanningActionResponseSchema.parse({
          success: true,
          externalIdentifier: `MOCK-TICKET-${crypto.randomUUID().substring(0, 8)}`,
          syncStatus: 'SYNCED',
          messageKey: 'integrations.erp_mock.ticket_provisioned',
          latencyInMilliseconds: MockEnterpriseResourcePlanningAdapter.SIMULATED_LATENCY_MS,
          operationalMetadata: { simulated: true }
        });
      }
    );
  }

  /**
   * @method validateCustomerExistence
   * @description Simula validación de identidad basada en patrones de prueba.
   */
  public async validateCustomerExistence(
    customerPhoneNumber: string
  ): Promise<IEnterpriseResourcePlanningActionResponse> {
    return await OmnisyncTelemetry.traceExecution(
      'MockEnterpriseResourcePlanningAdapter',
      'validateCustomerExistence',
      async () => {
        await this.injectNetworkLatency();

        const isKnownCustomer = customerPhoneNumber.includes('55');

        return EnterpriseResourcePlanningActionResponseSchema.parse({
          success: isKnownCustomer,
          externalIdentifier: isKnownCustomer ? 'MOCK-USER-001' : undefined,
          syncStatus: 'SYNCED',
          messageKey: isKnownCustomer ? 'integrations.erp_mock.user_found' : 'integrations.erp_mock.user_not_found',
          latencyInMilliseconds: MockEnterpriseResourcePlanningAdapter.SIMULATED_LATENCY_MS
        });
      }
    );
  }

  /**
   * @method injectNetworkLatency
   * @private
   */
  private async injectNetworkLatency(): Promise<void> {
    return new Promise((resolve) =>
      setTimeout(resolve, MockEnterpriseResourcePlanningAdapter.SIMULATED_LATENCY_MS)
    );
  }
}
