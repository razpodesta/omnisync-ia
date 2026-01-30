/** libs/integrations/erp-adapter-mock/src/lib/mock-adapter.apparatus.ts */

import {
  IEnterpriseResourcePlanningAdapter,
  IEnterpriseResourcePlanningActionResponse,
  EnterpriseResourcePlanningActionResponseSchema,
  OmnisyncContracts,
} from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/** 
 * @section Sincronización de ADN Local 
 * RESOLUCIÓN LINT: Inyección de Zod local para validación de comportamiento.
 */
import { 
  MockAdapterConfigurationSchema, 
  MockTicketInputSchema,
  IMockAdapterConfiguration 
} from './schemas/mock-adapter.schema';

/**
 * @name MockEnterpriseResourcePlanningAdapter
 * @description Adaptador de infraestructura especializado en la emulación de 
 * ecosistemas ERP (SAP/Odoo). Proporciona un entorno de pruebas controlado 
 * con latencia sintética y validación de contratos SSOT.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Simulation-Sovereignty V3.2)
 * @vision Ultra-Holística: Zero-Dependency-Testing & Parameterized-Mock
 */
export class MockEnterpriseResourcePlanningAdapter implements IEnterpriseResourcePlanningAdapter {
  public readonly providerName = 'MOCK_ENTERPRISE_SYSTEM_V3' as const;
  private readonly internalConfiguration: IMockAdapterConfiguration;

  /**
   * @constructor
   * @description Hidrata la configuración de la simulación bajo contrato SSOT.
   */
  constructor(customConfiguration: Partial<IMockAdapterConfiguration> = {}) {
    this.internalConfiguration = OmnisyncContracts.validate(
      MockAdapterConfigurationSchema,
      customConfiguration,
      'MockERPAdapter:Ignition'
    );
  }

  /**
   * @method createOperationTicket
   * @description Simula la creación atómica de una incidencia. 
   * Valida la carga útil entrante antes de procesar la respuesta.
   *
   * @param {unknown} operationalPayload - Datos crudos del despacho.
   */
  public async createOperationTicket(
    operationalPayload: unknown,
  ): Promise<IEnterpriseResourcePlanningActionResponse> {
    const apparatusName = 'MockERPAdapter';
    const operationName = 'createOperationTicket';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        // 1. Fase de Validación de Entrada (Justifica la dependencia Zod)
        const validatedInput = OmnisyncContracts.validate(
          MockTicketInputSchema,
          operationalPayload,
          `${apparatusName}:InputAudit`
        );

        // 2. Inyección de Latencia Programada
        await this.injectNetworkLatency();

        const responsePayload: IEnterpriseResourcePlanningActionResponse = {
          success: true,
          externalIdentifier: `${this.internalConfiguration.ticketIdPrefix}${crypto.randomUUID().substring(0, 8).toUpperCase()}`,
          syncStatus: 'SYNCED',
          messageKey: 'integrations.erp_mock.operation.ticket_provisioned',
          latencyInMilliseconds: this.internalConfiguration.simulatedLatencyMs,
          operationalMetadata: { 
            simulated: true, 
            author: 'Raz Podestá',
            engine: 'OEDP-V3.2-MOCK',
            capturedUserId: validatedInput.userId
          },
        };

        /**
         * @section Sello de Integridad Final
         */
        return OmnisyncContracts.validate(
          EnterpriseResourcePlanningActionResponseSchema,
          responsePayload,
          apparatusName
        );
      },
    );
  }

  /**
   * @method validateCustomerExistence
   * @description Simula la verificación de soberanía de identidad.
   */
  public async validateCustomerExistence(
    customerPhoneNumber: string,
  ): Promise<IEnterpriseResourcePlanningActionResponse> {
    const apparatusName = 'MockERPAdapter';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      'validateCustomerExistence',
      async () => {
        await this.injectNetworkLatency();

        const isKnown = customerPhoneNumber.includes(
          this.internalConfiguration.identitySuccessPattern
        );

        const response: IEnterpriseResourcePlanningActionResponse = {
          success: isKnown,
          externalIdentifier: isKnown ? 'MOCK-PARTNER-CORE-001' : undefined,
          syncStatus: 'SYNCED',
          messageKey: isKnown
            ? 'integrations.erp_mock.identity.verified'
            : 'integrations.erp_mock.identity.not_found',
          latencyInMilliseconds: this.internalConfiguration.simulatedLatencyMs,
          operationalMetadata: { searchPattern: 'fuzzy_mock_match' }
        };

        return OmnisyncContracts.validate(
          EnterpriseResourcePlanningActionResponseSchema,
          response,
          apparatusName
        );
      },
    );
  }

  /**
   * @method injectNetworkLatency
   * @private
   */
  private async injectNetworkLatency(): Promise<void> {
    return new Promise((resolve) =>
      setTimeout(
        resolve,
        this.internalConfiguration.simulatedLatencyMs,
      ),
    );
  }
}