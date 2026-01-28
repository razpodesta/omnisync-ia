/** libs/integrations/erp-odoo/src/lib/odoo-adapter.apparatus.ts */

import {
  IEnterpriseResourcePlanningAdapter,
  IERPTicket,
  ERPTicketSchema,
  IEnterpriseResourcePlanningActionResponse,
  EnterpriseResourcePlanningActionResponseSchema,
  OmnisyncContracts,
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
 * @protocol OEDP-Level: Elite (Full Observability)
 */
export class OdooAdapterApparatus implements IEnterpriseResourcePlanningAdapter {
  /** Identificador técnico para el ecosistema ERP Engine */
  public readonly providerName = 'ODOO_ENTERPRISE_CLOUD_V2';

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
   * Notifica al Sentinel ante fallos operativos para auditoría en el Dashboard.
   *
   * @param {unknown} operationalPayload - Carga útil de la operación (Validada internamente).
   * @returns {Promise<IEnterpriseResourcePlanningActionResponse>} Resultado validado de la acción.
   */
  public async createOperationTicket(
    operationalPayload: unknown
  ): Promise<IEnterpriseResourcePlanningActionResponse> {
    const apparatusName = 'OdooAdapterApparatus';
    const operationName = 'createOperationTicket';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        const executionStartTime = performance.now();

        try {
          // 1. Validación de ADN de Entrada
          const validatedTicketData: IERPTicket = OmnisyncContracts.validate(
            ERPTicketSchema,
            operationalPayload,
            apparatusName
          );

          // 2. Resolución de Identidad
          const partnerIdentifier = await this.resolvePartnerIdentifier(validatedTicketData.userId);

          // 3. Mapeo a Gramática Odoo
          const odooPayload = OdooModelMapper.mapToOdooTicketPayload(validatedTicketData, partnerIdentifier);

          // 4. Ejecución de Transacción
          const createdTicketIdentifier = await OdooDriverApparatus.executeRemoteProcedureCall<number>(
            this.technicalConfiguration,
            'helpdesk.ticket',
            'create',
            [odooPayload]
          );

          return EnterpriseResourcePlanningActionResponseSchema.parse({
            success: true,
            externalIdentifier: String(createdTicketIdentifier),
            syncStatus: 'SYNCED',
            messageKey: 'integrations.odoo.operation.ticket_created',
            latencyInMilliseconds: performance.now() - executionStartTime,
            operationalMetadata: { odooModel: 'helpdesk.ticket' }
          });

        } catch (criticalOperationalError: unknown) {
          /**
           * @section Resiliencia y Notificación
           * Inyectamos el uso de OmnisyncSentinel para registrar por qué falló la
           * operación a nivel de Adaptador (ej: fallo de mapeo o Partner no encontrado).
           */
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-604',
            severity: 'HIGH',
            apparatus: apparatusName,
            operation: operationName,
            message: 'integrations.odoo.errors.ticket_sync_error',
            context: { error: String(criticalOperationalError) },
            isRecoverable: true
          });

          return EnterpriseResourcePlanningActionResponseSchema.parse({
            success: false,
            syncStatus: 'FAILED_RETRYING',
            messageKey: 'integrations.odoo.errors.ticket_sync_error',
            latencyInMilliseconds: performance.now() - executionStartTime,
            operationalMetadata: { lastError: String(criticalOperationalError) }
          });
        }
      }
    );
  }

  /**
   * @method validateCustomerExistence
   * @description Verifica la presencia del cliente en el ERP.
   */
  public async validateCustomerExistence(
    customerPhoneNumber: string
  ): Promise<IEnterpriseResourcePlanningActionResponse> {
    const apparatusName = 'OdooAdapterApparatus';
    const operationName = 'validateCustomerExistence';
    const executionStartTime = performance.now();

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        try {
          const partnerIdentifier = await this.resolvePartnerIdentifier(customerPhoneNumber);
          const exists = partnerIdentifier !== null;

          return EnterpriseResourcePlanningActionResponseSchema.parse({
            success: exists,
            externalIdentifier: partnerIdentifier ? String(partnerIdentifier) : undefined,
            syncStatus: 'SYNCED',
            messageKey: exists
              ? 'integrations.odoo.operation.partner_found'
              : 'integrations.odoo.operation.partner_not_found',
            latencyInMilliseconds: performance.now() - executionStartTime,
            operationalMetadata: { searchField: 'phone_ilike' }
          });
        } catch (lookupError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-604',
            severity: 'MEDIUM',
            apparatus: apparatusName,
            operation: operationName,
            message: 'integrations.odoo.errors.partner_lookup_failed',
            context: { phone: customerPhoneNumber, error: String(lookupError) }
          });

          throw lookupError;
        }
      }
    );
  }

  /**
   * @method resolvePartnerIdentifier
   * @private
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
