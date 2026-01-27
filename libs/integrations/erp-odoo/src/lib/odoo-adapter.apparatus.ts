/** libs/integrations/erp-odoo/src/lib/odoo-adapter.apparatus.ts */

import {
  IEnterpriseResourcePlanningAdapter,
  IEnterpriseResourcePlanningActionResponse,
  EnterpriseResourcePlanningActionResponseSchema,
  TenantId
} from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OdooDriverApparatus } from './odoo-driver.apparatus';
import { OdooModelMapper } from './mappers/odoo-model.mapper';
import { IOdooConnectionConfiguration } from './schemas/odoo-integration.schema';

/**
 * @name OdooAdapterApparatus
 * @description Adaptador de élite para la orquestación operativa en Odoo ERP.
 * Implementa el contrato universal de ERP asegurando soberanía y resiliencia.
 *
 * @protocol OEDP-Level: Elite (Plug-and-Play Adapter)
 */
export class OdooAdapterApparatus implements IEnterpriseResourcePlanningAdapter {
  public readonly providerName: string = 'ODOO_ONLINE_V17';

  constructor(
    private readonly technicalConfiguration: IOdooConnectionConfiguration
  ) {}

  /**
   * @method createOperationTicket
   * @description Registra una incidencia en Odoo vinculándola automáticamente al Partner.
   */
  public async createOperationTicket(operationalData: any): Promise<{
    readonly externalIdentifier: string;
    readonly operationalStatus: string;
  }> {
    return await OmnisyncTelemetry.traceExecution(
      'OdooAdapterApparatus',
      'createOperationTicket',
      async () => {
        // 1. Identificación del Partner (Soberanía del Cliente)
        const partnerIdentifier = await this.resolvePartnerIdentifier(operationalData.externalUserId);

        // 2. Mapeo a Estructura Nativa
        const odooTicketPayload = OdooModelMapper.mapToOdooTicket(operationalData, partnerIdentifier);

        // 3. Ejecución RPC mediante el Driver de Élite
        const createdTicketId = await OdooDriverApparatus.executeRemoteProcedureCall<number>(
          this.technicalConfiguration,
          'helpdesk.ticket',
          'create',
          [{
            name: odooTicketPayload.subject,
            description: odooTicketPayload.description,
            partner_id: odooTicketPayload.partnerIdentifier,
            priority: odooTicketPayload.priority
          }]
        );

        return {
          externalIdentifier: String(createdTicketId),
          operationalStatus: 'OPEN_SYNCHRONIZED'
        };
      }
    );
  }

  /**
   * @method validateCustomerExistence
   * @description Verifica si un cliente posee un registro en Odoo para personalizar la IA.
   */
  public async validateCustomerExistence(phoneNumber: string): Promise<{
    readonly exists: boolean;
    readonly externalIdentifier?: string;
  }> {
    return await OmnisyncTelemetry.traceExecution(
      'OdooAdapterApparatus',
      'validateCustomerExistence',
      async () => {
        const partnerId = await this.resolvePartnerIdentifier(phoneNumber);

        return {
          exists: partnerId !== null,
          externalIdentifier: partnerId ? String(partnerId) : undefined
        };
      }
    );
  }

  /**
   * @method resolvePartnerIdentifier
   * @private
   * @description Localiza el ID de Odoo buscando por teléfono o móvil.
   */
  private async resolvePartnerIdentifier(phoneNumber: string): Promise<number | null> {
    const searchDomain = [
      '|',
      ['phone', 'ilike', phoneNumber],
      ['mobile', 'ilike', phoneNumber]
    ];

    const results = await OdooDriverApparatus.executeRemoteProcedureCall<number[]>(
      this.technicalConfiguration,
      'res.partner',
      'search',
      [searchDomain]
    );

    return results.length > 0 ? results[0] : null;
  }
}
