/** libs/integrations/erp-odoo/src/lib/odoo-adapter.apparatus.ts */

import {
  IEnterpriseResourcePlanningAdapter,
  IERPTicket,
  IEnterpriseResourcePlanningActionResponse,
  EnterpriseResourcePlanningActionResponseSchema,
} from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OdooDriverApparatus } from './odoo-driver.apparatus';
import { OdooModelMapper } from './mappers/odoo-model.mapper';
import { IOdooConnectionConfiguration } from './schemas/odoo-integration.schema';

/**
 * @name OdooAdapterApparatus
 * @description Adaptador de infraestructura de élite para la orquestación operativa en Odoo ERP.
 * Implementa el contrato universal de ERP asegurando que toda respuesta sea validada
 * contra el esquema de acción soberano antes de su retorno al Neural Hub.
 *
 * @protocol OEDP-Level: Elite (Contract-Enforced & Zero-Any)
 */
export class OdooAdapterApparatus implements IEnterpriseResourcePlanningAdapter {
  /** Identificador técnico para el ecosistema ERP Engine */
  public readonly providerName: string = 'ODOO_ENTERPRISE_CLOUD_V2';

  /**
   * @constructor
   * @param {IOdooConnectionConfiguration} technicalConfiguration - ADN de conexión validado.
   */
  constructor(
    private readonly technicalConfiguration: IOdooConnectionConfiguration
  ) {}

  /**
   * @method createOperationTicket
   * @description Registra una incidencia en Odoo vinculándola automáticamente al Partner.
   * Valida la salida mediante el esquema SSOT para erradicar inconsistencias.
   *
   * @param {IERPTicket} operationalData - Datos del ticket bajo contrato Omnisync.
   * @returns {Promise<IEnterpriseResourcePlanningActionResponse>} Resultado validado de la acción.
   */
  public async createOperationTicket(
    operationalData: IERPTicket
  ): Promise<IEnterpriseResourcePlanningActionResponse> {
    return await OmnisyncTelemetry.traceExecution(
      'OdooAdapterApparatus',
      'createOperationTicket',
      async () => {
        const executionStartTime = performance.now();

        try {
          // 1. Resolución de Identidad (Soberanía del Cliente)
          const partnerIdentifier = await this.resolvePartnerIdentifier(operationalData.userId);

          // 2. Mapeo a Estructura Nativa de Odoo
          const odooPayload = OdooModelMapper.mapToOdooTicketPayload(operationalData, partnerIdentifier);

          // 3. Ejecución RPC mediante el Driver de Élite
          const createdTicketIdentifier = await OdooDriverApparatus.executeRemoteProcedureCall<number>(
            this.technicalConfiguration,
            'helpdesk.ticket',
            'create',
            [odooPayload]
          );

          /**
           * @section Validación de Salida Soberana
           * Utilizamos el esquema importado para garantizar que la respuesta cumpla
           * con las expectativas del Orquestador Neural.
           */
          return EnterpriseResourcePlanningActionResponseSchema.parse({
            success: true,
            externalIdentifier: String(createdTicketIdentifier),
            syncStatus: 'SYNCED',
            messageKey: 'integrations.odoo.operation.ticket_created',
            latencyInMilliseconds: performance.now() - executionStartTime
          });

        } catch (criticalError: unknown) {
          /**
           * @section Gestión de Fallos Operativos
           * En caso de error, el Sentinel ya ha sido notificado por el Driver,
           * aquí retornamos una respuesta de fallo controlada.
           */
          return EnterpriseResourcePlanningActionResponseSchema.parse({
            success: false,
            syncStatus: 'FAILED_RETRYING',
            messageKey: 'integrations.odoo.errors.ticket_sync_error',
            latencyInMilliseconds: performance.now() - executionStartTime
          });
        }
      }
    );
  }

  /**
   * @method validateCustomerExistence
   * @description Verifica la presencia del cliente en el ERP.
   * Útil para hilos de conversación personalizados.
   */
  public async validateCustomerExistence(phoneNumber: string): Promise<{
    readonly exists: boolean;
    readonly externalIdentifier?: string;
  }> {
    return await OmnisyncTelemetry.traceExecution(
      'OdooAdapterApparatus',
      'validateCustomerExistence',
      async () => {
        const partnerIdentifier = await this.resolvePartnerIdentifier(phoneNumber);

        return {
          exists: partnerIdentifier !== null,
          externalIdentifier: partnerIdentifier ? String(partnerIdentifier) : undefined
        };
      }
    );
  }

  /**
   * @method resolvePartnerIdentifier
   * @private
   * @description Localiza de forma unívoca a un Partner en Odoo.
   */
  private async resolvePartnerIdentifier(phoneNumber: string): Promise<number | null> {
    const searchDomain = [['phone', 'ilike', phoneNumber]];

    const results = await OdooDriverApparatus.executeRemoteProcedureCall<number[]>(
      this.technicalConfiguration,
      'res.partner',
      'search',
      [searchDomain]
    );

    return (results && results.length > 0) ? results[0] : null;
  }
}
