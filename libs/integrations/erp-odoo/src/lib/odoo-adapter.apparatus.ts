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
 * @description Adaptador de infraestructura de grado industrial para Odoo ERP. 
 * Orquesta la transformación de requerimientos neurales en registros transaccionales. 
 * Implementa el protocolo de "Identidad Idempotente", asegurando que cada ticket 
 * esté vinculado a un Partner válido, creándolo automáticamente si es necesario.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Transactional-Sovereignty V3.2)
 * @vision Ultra-Holística: Atomic-Provisioning & ERP-Sync
 */
export class OdooAdapterApparatus implements IEnterpriseResourcePlanningAdapter {
  /** Identificador técnico para el orquestador de motores ERP */
  public readonly providerName = 'ODOO_ENTERPRISE_CLOUD_V3' as const;

  /**
   * @constructor
   * @param {IOdooConnectionConfiguration} technicalConfiguration - ADN de conexión validado del suscriptor.
   */
  constructor(
    private readonly technicalConfiguration: IOdooConnectionConfiguration,
  ) {}

  /**
   * @method createOperationTicket
   * @description Registra una incidencia en Odoo Helpdesk. Ejecuta un pipeline de dos fases: 
   * 1. Resolución de Soberanía del Cliente. 2. Persistencia del Ticket.
   *
   * @param {unknown} operationalPayload - Carga útil de la operación (Validada por ERPTicketSchema).
   * @returns {Promise<IEnterpriseResourcePlanningActionResponse>} Respuesta sellada por contrato SSOT.
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
          /**
           * @section Fase 1: Validación de ADN Entrante
           */
          const validatedTicketData: IERPTicket = OmnisyncContracts.validate(
            ERPTicketSchema,
            operationalPayload,
            apparatusName,
          );

          /**
           * @section Fase 2: Resolución de Identidad (Handshake Odoo)
           * Buscamos al Partner por teléfono. Si no existe, lo creamos atómicamente.
           */
          let partnerIdentifier = await this.resolvePartnerIdentifier(
            validatedTicketData.userId,
          );

          if (!partnerIdentifier) {
            OmnisyncTelemetry.verbose(
              apparatusName,
              'provisioning_trigger',
              `Identidad no localizada. Iniciando registro para: ${validatedTicketData.userId}`,
            );
            partnerIdentifier = await this.provisionSovereignPartner(
              validatedTicketData.userId,
            );
            wasPartnerProvisioned = true;
          }

          /**
           * @section Fase 3: Mapeo y Persistencia
           * Traducimos el ticket Omnisync al esquema físico de Odoo.
           */
          const odooFormattedPayload = OdooModelMapper.mapToOdooTicketPayload(
            validatedTicketData,
            partnerIdentifier,
          );

          const createdTicketIdentifier =
            await OdooDriverApparatus.executeRemoteProcedureCall<number>(
              this.technicalConfiguration,
              'helpdesk.ticket',
              'create',
              [odooFormattedPayload],
            );

          const finalResponse: IEnterpriseResourcePlanningActionResponse = {
            success: true,
            externalIdentifier: String(createdTicketIdentifier),
            syncStatus: 'SYNCED',
            messageKey: 'integrations.odoo.operation.ticket_created',
            latencyInMilliseconds: performance.now() - executionStartTime,
            operationalMetadata: {
              odooModel: 'helpdesk.ticket',
              partnerIdentifier,
              wasPartnerProvisioned,
              traceId: crypto.randomUUID().substring(0, 8)
            },
          };

          return OmnisyncContracts.validate(
            EnterpriseResourcePlanningActionResponseSchema,
            finalResponse,
            `${apparatusName}:FinalConsolidation`
          );

        } catch (criticalOperationalError: unknown) {
          /**
           * @note Gestión de Desastres
           * El Sentinel captura el fallo del ERP (ej. Timeout o Validación interna).
           */
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-604',
            severity: 'HIGH',
            apparatus: apparatusName,
            operation: operationName,
            message: 'integrations.odoo.errors.ticket_sync_error',
            context: {
              error: String(criticalOperationalError),
              wasPartnerProvisioned,
            },
            isRecoverable: true,
          });

          return EnterpriseResourcePlanningActionResponseSchema.parse({
            success: false,
            syncStatus: 'FAILED_RETRYING',
            messageKey: 'integrations.odoo.errors.ticket_sync_error',
            latencyInMilliseconds: performance.now() - executionStartTime,
            operationalMetadata: { errorTrace: String(criticalOperationalError) },
          });
        }
      },
    );
  }

  /**
   * @method validateCustomerExistence
   * @description Sensor de soberanía. Verifica si el cliente ya es parte del ecosistema Odoo.
   */
  public async validateCustomerExistence(
    customerPhoneNumber: string,
  ): Promise<IEnterpriseResourcePlanningActionResponse> {
    const apparatusName = 'OdooAdapterApparatus';
    const executionStartTime = performance.now();

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      'validateCustomerExistence',
      async () => {
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
          operationalMetadata: { searchMethod: 'fuzzy_phone_match' },
        });
      }
    );
  }

  /**
   * @method resolvePartnerIdentifier
   * @private
   * @description Localiza un Partner en Odoo buscando en campos phone y mobile.
   */
  private async resolvePartnerIdentifier(
    phoneNumber: string,
  ): Promise<number | null> {
    // Implementamos un dominio de búsqueda multimodal
    const searchDomain = [
      '|',
      ['phone', 'ilike', phoneNumber],
      ['mobile', 'ilike', phoneNumber],
    ];

    const results = await OdooDriverApparatus.executeRemoteProcedureCall<number[]>(
      this.technicalConfiguration,
      'res.partner',
      'search',
      [searchDomain],
    );

    return results && results.length > 0 ? results[0] : null;
  }

  /**
   * @method provisionSovereignPartner
   * @private
   * @description Crea un registro en res.partner cuando se detecta un Lead nuevo.
   */
  private async provisionSovereignPartner(
    phoneNumber: string,
  ): Promise<number> {
    const partnerPayload = {
      name: `Omnisync Neural User (${phoneNumber})`,
      mobile: phoneNumber,
      comment: 'Provisionado automáticamente por Omnisync-AI V3.2',
    };

    return await OdooDriverApparatus.executeRemoteProcedureCall<number>(
      this.technicalConfiguration,
      'res.partner',
      'create',
      [partnerPayload],
    );
  }
}