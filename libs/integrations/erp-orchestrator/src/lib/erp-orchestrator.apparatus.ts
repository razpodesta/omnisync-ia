/** libs/integrations/erp-orchestrator/src/lib/erp-orchestrator.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import {
  IEnterpriseResourcePlanningAdapter,
  IEnterpriseResourcePlanningActionResponse,
  EnterpriseResourcePlanningActionResponseSchema,
  IEnterpriseResourcePlanningSyncStatus,
} from '@omnisync/core-contracts';

/**
 * @name OmnisyncEnterpriseResourcePlanningOrchestrator
 * @description Cerebro de ejecución operativa agnóstico de alta disponibilidad.
 * Actúa como el puente soberano que orquesta la comunicación entre el Neural Hub
 * y los sistemas externos (ERP/CRM), garantizando que todos los adaptadores
 * hablen el mismo idioma técnico bajo contrato SSOT.
 *
 * @protocol OEDP-Level: Elite (Agnostic & Resilient)
 */
export class OmnisyncEnterpriseResourcePlanningOrchestrator {
  /**
   * @method executeServiceTicketProvisioning
   * @description Nodo maestro para la creación de incidencias técnicas.
   * Centraliza la resiliencia y garantiza que el ticket quede vinculado al ADN del ERP.
   *
   * @param {IEnterpriseResourcePlanningAdapter} technicalAdapter - Implementación del sistema destino.
   * @param {unknown} operationalPayload - Datos de la incidencia (Validado por el adaptador).
   * @returns {Promise<IEnterpriseResourcePlanningActionResponse>} Resultado bajo estándar SSOT.
   */
  public static async executeServiceTicketProvisioning(
    technicalAdapter: IEnterpriseResourcePlanningAdapter,
    operationalPayload: unknown,
  ): Promise<IEnterpriseResourcePlanningActionResponse> {
    const apparatusName = 'OmnisyncEnterpriseResourcePlanningOrchestrator';
    const operationName = `provisionTicket:${technicalAdapter.providerName}`;

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        const executionStartTime = performance.now();

        try {
          /**
           * @section Ejecución con Blindaje Sentinel
           * Aplicamos reintentos automáticos para mitigar fallos transitorios de red en el ERP.
           */
          const executionResult = await OmnisyncSentinel.executeWithResilience(
            () => technicalAdapter.createOperationTicket(operationalPayload),
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
   * @description Valida la existencia del cliente en el sistema de gestión externo.
   * Esencial para flujos de personalización de IA y seguridad de datos.
   *
   * @param {IEnterpriseResourcePlanningAdapter} technicalAdapter - Adaptador activo.
   * @param {string} customerPhoneNumberIdentifier - Identificador E.164 del cliente.
   */
  public static async verifyCustomerIdentitySovereignty(
    technicalAdapter: IEnterpriseResourcePlanningAdapter,
    customerPhoneNumberIdentifier: string,
  ): Promise<IEnterpriseResourcePlanningActionResponse> {
    const apparatusName = 'OmnisyncEnterpriseResourcePlanningOrchestrator';
    const operationName = `verifyIdentity:${technicalAdapter.providerName}`;

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        const executionStartTime = performance.now();

        try {
          /**
           * @section Resolución del Error TS2339
           * El contrato SSOT usa 'success' para indicar éxito de localización.
           * Erradicamos el uso del término 'exists' por ser inconsistente con el ADN.
           */
          const identificationResult =
            await OmnisyncSentinel.executeWithResilience(
              () =>
                technicalAdapter.validateCustomerExistence(
                  customerPhoneNumberIdentifier,
                ),
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
   * @description Valida y sella la respuesta final contra el contrato SSOT del sistema.
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
      operationalMetadata: payload.metadata ?? {},
    });
  }

  /**
   * @method handleOperationalFailure
   * @private
   * @description Orquesta la recuperación ante fallos de comunicación con el ERP.
   */
  private static async handleOperationalFailure(
    providerIdentifier: string,
    operationContext: string,
    errorInstance: unknown,
  ): Promise<IEnterpriseResourcePlanningActionResponse> {
    const apparatusName = 'OmnisyncEnterpriseResourcePlanningOrchestrator';

    await OmnisyncSentinel.report({
      errorCode: 'OS-INTEG-404',
      severity: 'MEDIUM',
      apparatus: apparatusName,
      operation: operationContext,
      message: `Fallo de comunicación con el cluster ERP: ${providerIdentifier}`,
      context: { providerIdentifier, error: String(errorInstance) },
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
