/** libs/integrations/erp-adapter-mock/src/lib/mock-adapter.apparatus.ts */

import { IERPAdapter } from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @name MockERPAdapter
 * @description Adaptador de simulación para desarrollo y pruebas de integridad.
 */
export class MockERPAdapter implements IERPAdapter {
  public readonly providerName = 'MOCK_ERP_SYSTEM';

  public async createTicket(data: any): Promise<{ externalId: string; status: string }> {
    OmnisyncTelemetry.verbose('MockERPAdapter', 'createTicket', 'Simulating ERP Action');
    return { externalId: `MOCK-TICKET-${Date.now()}`, status: 'OPEN' };
  }

  public async validateCustomer(phone: string): Promise<{ exists: boolean; externalId?: string }> {
    return { exists: true, externalId: 'MOCK-CUST-001' };
  }
}