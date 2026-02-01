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
 * @description Adaptador de infraestructura evolucionado para Odoo ERP (V5.0).
 * Orquesta la transformación de requerimientos neurales en mutaciones físicas.
 * Implementa el protocolo "Action Guard Aware", permitiendo la suspensión
 * preventiva de transacciones para validación humana sin romper el pipeline.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Action-Guard-Sovereignty V5.0)
 */
export class OdooAdapterApparatus implements IEnterpriseResourcePlanningAdapter {
  public readonly providerName = 'ODOO_ENTERPRISE_CLOUD_V5' as const;

  constructor(
    private readonly technicalConfiguration: IOdooConnectionConfiguration,
  ) {}

  /**
   * @method createOperationTicket
   * @description Registra una incidencia en Odoo. Implementa una aduana de 
   * seguridad para detectar si la acción requiere sanción humana previa.
   * 
   * @param {unknown} operationalPayload - Carga útil (Ticket + Metadatos de Guardia).
   * @returns {Promise<IEnterpriseResourcePlanningActionResponse>} Resultado sellado.
   */
  public async createOperationTicket(
    operationalPayload: unknown,
  ): Promise<IEnterpriseResourcePlanningActionResponse> {
    const apparatusName = 'OdooAdapterApparatus';
    const operationName = 'createOperationTicket';

    return await OmnisyncTelemetry.traceExecution(apparatusName, operationName, async () => {
      const executionStartTime = performance.now();
      let wasPartnerProvisioned = false;

      try {
        // 1. ADUANA DE DATOS Y TRIAJE DE GUARDIA
        const validatedTicketData: IERPTicket = OmnisyncContracts.validate(
          ERPTicketSchema,
          operationalPayload,
          apparatusName,
        );

        /**
         * @section Protocolo Action Guard (Fase 5.0)
         * Si el payload contiene una directiva de suspensión del ActionDispatcher,
         * el adaptador aborta la comunicación con Odoo y devuelve el rastro de espera.
         */
        const guardDirective = (operationalPayload as any)?._actionGuard;
        if (guardDirective?.status === 'PENDING_APPROVAL') {
          return this.suspendActionForSanction(validatedTicketData, guardDirective, executionStartTime);
        }

        // 2. RESOLUCIÓN DE IDENTIDAD (Handshake Idempotente)
        let partnerIdentifier = await this.resolvePartnerIdentifier(validatedTicketData.userId);

        if (!partnerIdentifier) {
          OmnisyncTelemetry.verbose(apparatusName, 'auto_provisioning', `Partner no existe: ${validatedTicketData.userId}`);
          partnerIdentifier = await this.provisionSovereignPartner(validatedTicketData.userId);
          wasPartnerProvisioned = true;
        }

        // 3. PERSISTENCIA FÍSICA EN ODOO
        const odooPayload = OdooModelMapper.mapToOdooTicketPayload(validatedTicketData, partnerIdentifier);
        
        const ticketId = await OdooDriverApparatus.executeRemoteProcedureCall<number>(
          this.technicalConfiguration,
          'helpdesk.ticket',
          'create',
          [odooPayload],
        );

        const finalResponse: IEnterpriseResourcePlanningActionResponse = {
          success: true,
          externalIdentifier: String(ticketId),
          syncStatus: 'SYNCED',
          messageKey: 'integrations.odoo.operation.ticket_created',
          latencyInMilliseconds: performance.now() - executionStartTime,
          operationalMetadata: {
            odooModel: 'helpdesk.ticket',
            wasPartnerProvisioned,
            traceId: crypto.randomUUID().substring(0, 8),
            engine: 'OEDP-V5.0-SYNC'
          },
        };

        return OmnisyncContracts.validate(EnterpriseResourcePlanningActionResponseSchema, finalResponse, apparatusName);

      } catch (error: unknown) {
        return await this.handleOperationalAnomaly(error, executionStartTime);
      }
    });
  }

  /**
   * @method suspendActionForSanction
   * @private
   * @description Sella el estado de suspensión inyectando metadatos para el Dashboard.
   */
  private suspendActionForSanction(
    data: IERPTicket, 
    guard: any, 
    start: number
  ): IEnterpriseResourcePlanningActionResponse {
    OmnisyncTelemetry.verbose(this.providerName, 'action_suspended', `Mutación ERP congelada para: ${data.subject}`);

    return {
      success: true,
      syncStatus: 'PENDING_APPROVAL',
      messageKey: 'integrations.erp.action_guard.waiting_approval',
      latencyInMilliseconds: performance.now() - start,
      actionGuardContext: {
        suspensionReasonIdentifier: guard.reason,
        riskAssessmentScore: guard.riskScore || 0,
        suspendedAt: new Date().toISOString(),
        originalIntentSnapshot: { ...data } as any
      },
      operationalMetadata: { adapter: this.providerName }
    };
  }

  /**
   * @method validateCustomerExistence
   * @description Verifica identidad sin realizar mutaciones (ReadOnly).
   */
  public async validateCustomerExistence(phone: string): Promise<IEnterpriseResourcePlanningActionResponse> {
    const start = performance.now();
    return await OmnisyncTelemetry.traceExecution(this.providerName, 'validateCustomer', async () => {
      const partnerId = await this.resolvePartnerIdentifier(phone);
      const exists = partnerId !== null;

      return EnterpriseResourcePlanningActionResponseSchema.parse({
        success: exists,
        externalIdentifier: partnerId ? String(partnerId) : undefined,
        syncStatus: 'SYNCED',
        messageKey: exists ? 'integrations.odoo.partner.found' : 'integrations.odoo.partner.not_found',
        latencyInMilliseconds: performance.now() - start,
        operationalMetadata: { source: 'odoo_search_read' },
      });
    });
  }

  private async resolvePartnerIdentifier(phone: string): Promise<number | null> {
    const domain = ['|', ['phone', 'ilike', phone], ['mobile', 'ilike', phone]];
    const results = await OdooDriverApparatus.executeRemoteProcedureCall<number[]>(
      this.technicalConfiguration, 'res.partner', 'search', [domain]
    );
    return results && results.length > 0 ? results[0] : null;
  }

  private async provisionSovereignPartner(phone: string): Promise<number> {
    return await OdooDriverApparatus.executeRemoteProcedureCall<number>(
      this.technicalConfiguration, 'res.partner', 'create', 
      [{ name: `Omnisync Neural User (${phone})`, mobile: phone, comment: 'V5.0 Auto-Sync' }]
    );
  }

  private async handleOperationalAnomaly(error: unknown, start: number): Promise<IEnterpriseResourcePlanningActionResponse> {
    await OmnisyncSentinel.report({
      errorCode: 'OS-INTEG-604',
      severity: 'HIGH',
      apparatus: 'OdooAdapterApparatus',
      operation: 'mutation_failed',
      message: 'Fallo crítico de sincronización con Odoo.',
      context: { errorTrace: String(error) },
      isRecoverable: true
    });

    return {
      success: false,
      syncStatus: 'FAILED_RETRYING',
      messageKey: 'integrations.odoo.errors.sync_colapse',
      latencyInMilliseconds: performance.now() - start,
      operationalMetadata: { errorTrace: String(error) }
    };
  }
}