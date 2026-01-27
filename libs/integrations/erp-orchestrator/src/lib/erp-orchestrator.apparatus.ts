/** libs/integrations/erp-orchestrator/src/lib/erp-orchestrator.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import {
  IEnterpriseResourcePlanningAdapter,
  IEnterpriseResourcePlanningActionResponse,
  EnterpriseResourcePlanningActionResponseSchema
} from '@omnisync/core-contracts';

/**
 * @name OmnisyncEnterpriseResourcePlanningOrchestrator
 * @description Cerebro de ejecución operativa agnóstico.
 * Actúa como un puente de alta disponibilidad que orquesta la comunicación
 * entre los flujos neurales y los sistemas de gestión empresarial (ERP).
 *
 * @protocol OEDP-Level: Elite (Atomic & Agnostic)
 */
export class OmnisyncEnterpriseResourcePlanningOrchestrator {

  /**
   * @method executeServiceTicketProvisioning
   * @description Nodo atómico para la creación de tickets o incidencias.
   * Centraliza la resiliencia y la normalización de la respuesta operativa.
   *
   * @param {IEnterpriseResourcePlanningAdapter} technicalAdapter - Implementación del ERP destino.
   * @param {unknown} operationalData - Carga útil de la operación (validada por el adaptador).
   * @returns {Promise<IEnterpriseResourcePlanningActionResponse>} Resultado bajo contrato SSOT.
   */
  public static async executeServiceTicketProvisioning(
    technicalAdapter: IEnterpriseResourcePlanningAdapter,
    operationalData: unknown
  ): Promise<IEnterpriseResourcePlanningActionResponse> {
    return await OmnisyncTelemetry.traceExecution(
      'OmnisyncEnterpriseResourcePlanningOrchestrator',
      `provisionTicket:${technicalAdapter.providerName}`,
      async () => {
        const executionStartTime = performance.now();

        try {
          /**
           * @section Ejecución con Blindaje de Resiliencia
           * El Sentinel gestiona reintentos exponenciales específicos para el driver del ERP.
           */
          const executionResult = await OmnisyncSentinel.executeWithResilience(
            () => technicalAdapter.createOperationTicket(operationalData),
            'OmnisyncEnterpriseResourcePlanningOrchestrator',
            `externalCall:${technicalAdapter.providerName}`
          );

          return this.mapToSovereignResponse({
            success: true,
            externalIdentifier: executionResult.externalIdentifier,
            syncStatus: 'SYNCED',
            messageKey: 'integrations.erp.provisioning.success',
            latency: performance.now() - executionStartTime
          });

        } catch (criticalError: unknown) {
          return this.handleOperationalFailure(
            technicalAdapter.providerName,
            'provisioning',
            criticalError
          );
        }
      }
    );
  }

  /**
   * @method verifyCustomerIdentitySovereignty
   * @description Nodo atómico para la validación de existencia del cliente en el ERP.
   * Esencial para flujos de seguridad y personalización de la IA.
   */
  public static async verifyCustomerIdentitySovereignty(
    technicalAdapter: IEnterpriseResourcePlanningAdapter,
    customerPhoneNumber: string
  ): Promise<IEnterpriseResourcePlanningActionResponse> {
    return await OmnisyncTelemetry.traceExecution(
      'OmnisyncEnterpriseResourcePlanningOrchestrator',
      `verifyIdentity:${technicalAdapter.providerName}`,
      async () => {
        const executionStartTime = performance.now();

        try {
          const identificationResult = await OmnisyncSentinel.executeWithResilience(
            () => technicalAdapter.validateCustomerExistence(customerPhoneNumber),
            'OmnisyncEnterpriseResourcePlanningOrchestrator',
            `identityProbe:${technicalAdapter.providerName}`
          );

          return this.mapToSovereignResponse({
            success: identificationResult.exists,
            externalIdentifier: identificationResult.externalIdentifier,
            syncStatus: 'SYNCED',
            messageKey: identificationResult.exists
              ? 'integrations.erp.identity.verified'
              : 'integrations.erp.identity.not_found',
            latency: performance.now() - executionStartTime
          });

        } catch (criticalError: unknown) {
          return this.handleOperationalFailure(
            technicalAdapter.providerName,
            'identity_verification',
            criticalError
          );
        }
      }
    );
  }

  /**
   * @method mapToSovereignResponse
   * @private
   * @description Garantiza que cada salida cumpla con el ADN del sistema (SSOT).
   */
  private static mapToSovereignResponse(payload: {
    success: boolean;
    externalIdentifier?: string;
    syncStatus: 'SYNCED' | 'FAILED_RETRYING' | 'PENDING' | 'MANUAL_INTERVENTION';
    messageKey: string;
    latency: number;
  }): IEnterpriseResourcePlanningActionResponse {
    return EnterpriseResourcePlanningActionResponseSchema.parse({
      success: payload.success,
      externalIdentifier: payload.externalIdentifier,
      syncStatus: payload.syncStatus,
      messageKey: payload.messageKey,
      latencyInMilliseconds: payload.latency
    });
  }

  /**
   * @method handleOperationalFailure
   * @private
   * @description Clasifica el error y genera una respuesta de seguridad para el orquestador neural.
   */
  private static async handleOperationalFailure(
    provider: string,
    context: string,
    error: unknown
  ): Promise<IEnterpriseResourcePlanningActionResponse> {
    await OmnisyncSentinel.report({
      errorCode: 'OS-INTEG-404',
      severity: 'MEDIUM',
      apparatus: 'OmnisyncEnterpriseResourcePlanningOrchestrator',
      operation: context,
      message: `Fallo de comunicación con el adaptador ERP: ${provider}`,
      context: { provider, error: String(error) },
      isRecoverable: true
    });

    return this.mapToSovereignResponse({
      success: false,
      syncStatus: 'FAILED_RETRYING',
      messageKey: 'integrations.erp.errors.service_unavailable',
      latency: 0
    });
  }
}
