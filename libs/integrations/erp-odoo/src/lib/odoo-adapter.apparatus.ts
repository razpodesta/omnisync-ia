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
 * Implementa el contrato universal de ERP asegurando la persistencia atómica de tickets
 * y el auto-aprovisionamiento de identidades de clientes (Partners).
 *
 * @protocol OEDP-Level: Elite (Atomic Provisioning & Full-Observability)
 */
export class OdooAdapterApparatus implements IEnterpriseResourcePlanningAdapter {
  /** Identificador técnico para la fábrica de orquestación ERP */
  public readonly providerName = 'ODOO_ENTERPRISE_CLOUD_V3';

  /**
   * @constructor
   * @param {IOdooConnectionConfiguration} technicalConfiguration - ADN de conexión validado del suscriptor.
   */
  constructor(
    private readonly technicalConfiguration: IOdooConnectionConfiguration,
  ) {}

  /**
   * @method createOperationTicket
   * @description Registra una incidencia en Odoo. Implementa un flujo de dos fases:
   * 1. Resolución/Creación de Partner. 2. Creación de Ticket vinculado.
   *
   * @param {unknown} operationalPayload - Carga útil de la operación (Validada por ERPTicketSchema).
   * @returns {Promise<IEnterpriseResourcePlanningActionResponse>} Respuesta validada bajo estándar SSOT.
   */
  public async createOperationTicket(
    operationalPayload: unknown,
  ): Promise<IEnterpriseResourcePlanningActionResponse> {
    const apparatusName = 'OdooAdapterApparatus';
    const operationName = 'createOperationTicket';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        const executionStartTime = performance.now();
        let wasPartnerProvisioned = false;

        try {
          // 1. Validación de Integridad de Entrada
          const validatedTicketData: IERPTicket = OmnisyncContracts.validate(
            ERPTicketSchema,
            operationalPayload,
            apparatusName,
          );

          /**
           * @section 2. Gestión de Identidad Soberana
           * Intentamos localizar al Partner. Si no existe, lo creamos atómicamente.
           */
          let partnerIdentifier = await this.resolvePartnerIdentifier(
            validatedTicketData.userId,
          );

          if (!partnerIdentifier) {
            OmnisyncTelemetry.verbose(
              apparatusName,
              'identity_gap',
              `Iniciando auto-aprovisionamiento para: ${validatedTicketData.userId}`,
            );
            partnerIdentifier = await this.provisionSovereignPartner(
              validatedTicketData.userId,
            );
            wasPartnerProvisioned = true;
          }

          // 3. Mapeo Semántico a la gramática Helpdesk de Odoo
          const odooFormattedPayload = OdooModelMapper.mapToOdooTicketPayload(
            validatedTicketData,
            partnerIdentifier,
          );

          // 4. Ejecución de Transacción vía Driver de Alta Disponibilidad
          const createdTicketIdentifier =
            await OdooDriverApparatus.executeRemoteProcedureCall<number>(
              this.technicalConfiguration,
              'helpdesk.ticket',
              'create',
              [odooFormattedPayload],
            );

          return EnterpriseResourcePlanningActionResponseSchema.parse({
            success: true,
            externalIdentifier: String(createdTicketIdentifier),
            syncStatus: 'SYNCED',
            messageKey: 'integrations.odoo.operation.ticket_created',
            latencyInMilliseconds: performance.now() - executionStartTime,
            operationalMetadata: {
              odooModel: 'helpdesk.ticket',
              partnerIdentifier,
              wasPartnerProvisioned,
            },
          });
        } catch (criticalOperationalError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-604',
            severity: 'HIGH',
            apparatus: apparatusName,
            operation: operationName,
            message: 'integrations.odoo.errors.ticket_sync_error',
            context: {
              errorDetail: String(criticalOperationalError),
              wasPartnerProvisioned,
            },
            isRecoverable: true,
          });

          return EnterpriseResourcePlanningActionResponseSchema.parse({
            success: false,
            syncStatus: 'FAILED_RETRYING',
            messageKey: 'integrations.odoo.errors.ticket_sync_error',
            latencyInMilliseconds: performance.now() - executionStartTime,
            operationalMetadata: {
              errorTrace: String(criticalOperationalError),
            },
          });
        }
      },
    );
  }

  /**
   * @method validateCustomerExistence
   * @description Verifica la soberanía de la identidad del cliente en el ERP remoto.
   */
  public async validateCustomerExistence(
    customerPhoneNumber: string,
  ): Promise<IEnterpriseResourcePlanningActionResponse> {
    const apparatusName = 'OdooAdapterApparatus';
    const operationName = 'validateCustomerExistence';
    const executionStartTime = performance.now();

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        try {
          const partnerIdentifier =
            await this.resolvePartnerIdentifier(customerPhoneNumber);
          const doesIdentityExist = partnerIdentifier !== null;

          return EnterpriseResourcePlanningActionResponseSchema.parse({
            success: doesIdentityExist,
            externalIdentifier: partnerIdentifier
              ? String(partnerIdentifier)
              : undefined,
            syncStatus: 'SYNCED',
            messageKey: doesIdentityExist
              ? 'integrations.odoo.operation.partner_found'
              : 'integrations.odoo.operation.partner_not_found',
            latencyInMilliseconds: performance.now() - executionStartTime,
            operationalMetadata: { lookupMethod: 'multimodal_phone_search' },
          });
        } catch (lookupError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-604',
            severity: 'MEDIUM',
            apparatus: apparatusName,
            operation: operationName,
            message: 'integrations.odoo.errors.partner_lookup_failed',
            context: {
              phoneNumber: customerPhoneNumber,
              error: String(lookupError),
            },
          });

          throw lookupError;
        }
      },
    );
  }

  /**
   * @method resolvePartnerIdentifier
   * @private
   * @description Localiza un contacto en Odoo utilizando un dominio de búsqueda multimodal.
   */
  private async resolvePartnerIdentifier(
    phoneNumber: string,
  ): Promise<number | null> {
    // Búsqueda en campos de teléfono y móvil para mayor precisión geográfica
    const searchDomain = [
      '|',
      ['phone', 'ilike', phoneNumber],
      ['mobile', 'ilike', phoneNumber],
    ];

    const searchResults = await OdooDriverApparatus.executeRemoteProcedureCall<
      number[]
    >(this.technicalConfiguration, 'res.partner', 'search', [searchDomain]);

    return searchResults && searchResults.length > 0 ? searchResults[0] : null;
  }

  /**
   * @method provisionSovereignPartner
   * @private
   * @description Crea un nuevo registro en res.partner cuando el cliente no existe.
   */
  private async provisionSovereignPartner(
    phoneNumber: string,
  ): Promise<number> {
    const partnerPayload = {
      name: `Omnisync Lead (${phoneNumber})`,
      mobile: phoneNumber,
      comment: 'Generado automáticamente por el adaptador Omnisync-AI V3.2',
    };

    return await OdooDriverApparatus.executeRemoteProcedureCall<number>(
      this.technicalConfiguration,
      'res.partner',
      'create',
      [partnerPayload],
    );
  }
}
