/** libs/integrations/erp-orchestrator/src/lib/erp-orchestrator.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import {
  IEnterpriseResourcePlanningAdapter,
  IEnterpriseResourcePlanningActionResponse,
  EnterpriseResourcePlanningActionResponseSchema,
  IEnterpriseResourcePlanningSyncStatus,
  OmnisyncContracts,
} from '@omnisync/core-contracts';

import { 
  ERPTicketProvisioningContextSchema, 
  IdentityVerificationContextSchema 
} from './schemas/erp-orchestrator.schema';

/**
 * @name OmnisyncEnterpriseResourcePlanningOrchestrator
 * @description Nodo maestro de ejecución operativa. Orquesta la comunicación 
 * entre el cerebro neural y los sistemas de gestión externos (ERP/CRM). 
 * Garantiza el agnosticismo total mediante despacho polimórfico, 
 * validación SSOT de entrada/salida y blindaje de resiliencia Sentinel.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Transactional-Orchestration V3.2)
 * @vision Ultra-Holística: Agnostic-Execution & Fault-Tolerance
 */
export class OmnisyncEnterpriseResourcePlanningOrchestrator {
  /**
   * @method executeServiceTicketProvisioning
   * @description Nodo maestro para la creación de incidencias técnicas. 
   * Valida la carga útil localmente antes de invocar el adaptador físico.
   *
   * @param {IEnterpriseResourcePlanningAdapter} technicalAdapter - Implementación del ERP destino.
   * @param {unknown} operationalPayload - Datos de la incidencia a validar y crear.
   * @returns {Promise<IEnterpriseResourcePlanningActionResponse>} Resultado sellado por SSOT.
   */
  public static async executeServiceTicketProvisioning(
    technicalAdapter: IEnterpriseResourcePlanningAdapter,
    operationalPayload: unknown,
  ): Promise<IEnterpriseResourcePlanningActionResponse> {
    const apparatusName = 'OmnisyncERPOrchestrator';
    const operationName = `provisionTicket:${technicalAdapter.providerName}`;

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        const executionStartTime = performance.now();

        try {
          /**
           * @section Fase 1: Validación de Aduana Local
           * RESOLUCIÓN LINT: Uso de Zod local para validar la entrada.
           */
          const validatedPayload = OmnisyncContracts.validate(
            ERPTicketProvisioningContextSchema,
            operationalPayload,
            `${apparatusName}:PayloadValidation`
          );

          /**
           * @section Fase 2: Ejecución Resiliente
           */
          const executionResult = await OmnisyncSentinel.executeWithResilience(
            () => technicalAdapter.createOperationTicket(validatedPayload),
            apparatusName,
            operationName,
          );

          return this.mapToSovereignResponse({
            success: executionResult.success,
            externalIdentifier: executionResult.externalIdentifier,
            syncStatus: executionResult.syncStatus,
            messageKey: 'integrations.erp.provisioning.success',
            latency: performance.now() - executionStartTime,
            metadata: executionResult.operationalMetadata,
          });
        } catch (criticalOperationalError: unknown) {
          return await this.handleOperationalFailure(
            technicalAdapter.providerName,
            'provisioning',
            criticalOperationalError,
          );
        }
      },
    );
  }

  /**
   * @method verifyCustomerIdentitySovereignty
   * @description Valida la existencia de una identidad en el ERP externo. 
   * Vital para flujos de personalización RAG y seguridad de datos.
   */
  public static async verifyCustomerIdentitySovereignty(
    technicalAdapter: IEnterpriseResourcePlanningAdapter,
    customerPhoneNumberIdentifier: string,
  ): Promise<IEnterpriseResourcePlanningActionResponse> {
    const apparatusName = 'OmnisyncERPOrchestrator';
    const operationName = `verifyIdentity:${technicalAdapter.providerName}`;

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        const executionStartTime = performance.now();

        try {
          // Validación de entrada para cumplimiento de formato E.164
          OmnisyncContracts.validate(
            IdentityVerificationContextSchema,
            { customerPhoneNumberIdentifier },
            `${apparatusName}:IdentityInputCheck`
          );

          const identificationResult = await OmnisyncSentinel.executeWithResilience(
            () => technicalAdapter.validateCustomerExistence(customerPhoneNumberIdentifier),
            apparatusName,
            operationName,
          );

          return this.mapToSovereignResponse({
            success: identificationResult.success,
            externalIdentifier: identificationResult.externalIdentifier,
            syncStatus: 'SYNCED',
            messageKey: identificationResult.success
              ? 'integrations.erp.identity.verified'
              : 'integrations.erp.identity.not_found',
            latency: performance.now() - executionStartTime,
            metadata: identificationResult.operationalMetadata,
          });
        } catch (criticalOperationalError: unknown) {
          return await this.handleOperationalFailure(
            technicalAdapter.providerName,
            'identity_verification',
            criticalOperationalError,
          );
        }
      },
    );
  }

  /**
   * @method mapToSovereignResponse
   * @private
   * @description Valida y sella la respuesta final contra el contrato SSOT global.
   */
  private static mapToSovereignResponse(payload: {
    success: boolean;
    externalIdentifier?: string;
    syncStatus: IEnterpriseResourcePlanningSyncStatus;
    messageKey: string;
    latency: number;
    metadata?: Record<string, unknown>;
  }): IEnterpriseResourcePlanningActionResponse {
    return EnterpriseResourcePlanningActionResponseSchema.parse({
      success: payload.success,
      externalIdentifier: payload.externalIdentifier,
      syncStatus: payload.syncStatus,
      messageKey: payload.messageKey,
      latencyInMilliseconds: payload.latency,
      operationalMetadata: payload.metadata ?? { engineVersion: 'OEDP-V3.2' },
    });
  }

  /**
   * @method handleOperationalFailure
   * @private
   * @description Centraliza el reporte de anomalías operativas al Sentinel.
   */
  private static async handleOperationalFailure(
    providerIdentifier: string,
    operationContext: string,
    errorInstance: unknown,
  ): Promise<IEnterpriseResourcePlanningActionResponse> {
    const apparatusName = 'OmnisyncERPOrchestrator';

    await OmnisyncSentinel.report({
      errorCode: 'OS-INTEG-404',
      severity: 'MEDIUM',
      apparatus: apparatusName,
      operation: operationContext,
      message: `Fallo de sincronización con el cluster ERP: ${providerIdentifier}`,
      context: { provider: providerIdentifier, errorTrace: String(errorInstance) },
      isRecoverable: true,
    });

    return this.mapToSovereignResponse({
      success: false,
      syncStatus: 'FAILED_RETRYING',
      messageKey: 'integrations.erp.errors.service_unavailable',
      latency: 0,
    });
  }
}