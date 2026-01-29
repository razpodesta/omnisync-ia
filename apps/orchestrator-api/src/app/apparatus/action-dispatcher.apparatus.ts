/** apps/orchestrator-api/src/app/apparatus/action-dispatcher.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncSecurity } from '@omnisync/core-security';
import { OmnisyncEnterpriseResourcePlanningOrchestrator } from '@omnisync/erp-engine';

/**
 * @section Adaptadores Autorizados (Lego Pieces)
 * Se importan las implementaciones específicas para la resolución dinámica.
 */
import { MockEnterpriseResourcePlanningAdapter } from '@omnisync/erp-mock';
import { OdooAdapterApparatus } from '@omnisync/erp-odoo';

import {
  INeuralIntent,
  ITenantConfiguration,
  IAIResponse as IArtificialIntelligenceResponse,
  IEnterpriseResourcePlanningActionResponse,
  IEnterpriseResourcePlanningAdapter,
} from '@omnisync/core-contracts';

/**
 * @name ActionDispatcherApparatus
 * @description Aparato especializado en la orquestación y despacho de acciones operativas.
 * Centraliza la resolución dinámica de adaptadores ERP/CRM, la desencriptación de
 * credenciales soberanas y el aprovisionamiento de servicios en sistemas externos.
 *
 * @protocol OEDP-Level: Elite (Atomic Action Dispatcher)
 */
export class ActionDispatcherApparatus {
  /**
   * @method dispatchOperationalAction
   * @description Evalúa el estado de la inferencia neural y, si el sistema determina la necesidad
   * de una acción en el mundo real, resuelve el adaptador del suscriptor y ejecuta la petición.
   *
   * @param {INeuralIntent} incomingNeuralIntent - Intención original normalizada.
   * @param {IArtificialIntelligenceResponse} artificialIntelligenceResponse - Inferencia del cerebro neural.
   * @param {ITenantConfiguration} tenantConfiguration - ADN técnico del nodo organizacional.
   * @returns {Promise<IEnterpriseResourcePlanningActionResponse | undefined>} Resultado sellado por SSOT o undefined.
   */
  public static async dispatchOperationalAction(
    incomingNeuralIntent: INeuralIntent,
    artificialIntelligenceResponse: IArtificialIntelligenceResponse,
    tenantConfiguration: ITenantConfiguration,
  ): Promise<IEnterpriseResourcePlanningActionResponse | undefined> {
    const apparatusName = 'ActionDispatcherApparatus';
    const operationName = 'dispatchOperationalAction';

    /**
     * @section Triaje de Acción
     * El despacho solo ocurre si la IA ha clasificado explícitamente el flujo como 'ESCALATED_TO_ERP'.
     */
    if (artificialIntelligenceResponse.status !== 'ESCALATED_TO_ERP') {
      return undefined;
    }

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        try {
          /**
           * 1. Fase de Resolución de Soberanía Técnica
           * Instanciamos el adaptador específico y desciframos sus secretos de conexión.
           */
          const sovereignEnterpriseResourcePlanningAdapter =
            await this.resolveSovereignAdapter(tenantConfiguration);

          /**
           * 2. Fase de Ejecución y Aprovisionamiento
           * Delegamos al orquestador de motor ERP la creación del ticket o registro transaccional.
           */
          return await OmnisyncEnterpriseResourcePlanningOrchestrator.executeServiceTicketProvisioning(
            sovereignEnterpriseResourcePlanningAdapter,
            {
              userId: incomingNeuralIntent.externalUserId,
              subject: `Incidencia Neural: ${incomingNeuralIntent.id.substring(0, 8)}`,
              description: artificialIntelligenceResponse.suggestion,
              priority: 'MEDIUM',
              createdAt: new Date().toISOString(),
            },
          );
        } catch (criticalDispatchError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-404',
            severity: 'HIGH',
            apparatus: apparatusName,
            operation: operationName,
            message: 'core.action_dispatcher.dispatch_failed',
            context: {
              tenantId: tenantConfiguration.id,
              error: String(criticalDispatchError),
              intentId: incomingNeuralIntent.id,
            },
            isRecoverable: true,
          });

          throw criticalDispatchError;
        }
      },
      {
        targetAdapter:
          tenantConfiguration.enterpriseResourcePlanning.adapterIdentifier,
      },
    );
  }

  /**
   * @method resolveSovereignAdapter
   * @private
   * @description Factoría interna para la resolución de adaptadores y gestión de secretos.
   * Implementa el protocolo de seguridad AES-256-GCM para la recuperación de credenciales.
   */
  private static async resolveSovereignAdapter(
    tenantConfiguration: ITenantConfiguration,
  ): Promise<IEnterpriseResourcePlanningAdapter> {
    const enterpriseResourcePlanningAdapterIdentifier =
      tenantConfiguration.enterpriseResourcePlanning.adapterIdentifier;

    switch (enterpriseResourcePlanningAdapterIdentifier) {
      case 'ODOO_V16': {
        const masterSystemEncryptionKey = process.env['SYSTEM_ENCRYPTION_KEY'];

        if (!masterSystemEncryptionKey) {
          throw new Error(
            'OS-SEC-004: Master System Encryption Key is missing in the environment infrastructure.',
          );
        }

        /**
         * @section Descifrado de ADN de Conexión
         * Recuperamos el JSON de credenciales de la organización mediante el Security Apparatus.
         */
        const decryptedCredentialsJsonString =
          await OmnisyncSecurity.decryptSensitiveData(
            tenantConfiguration.enterpriseResourcePlanning.encryptedCredentials,
            masterSystemEncryptionKey,
          );

        return new OdooAdapterApparatus(
          JSON.parse(decryptedCredentialsJsonString),
        );
      }

      case 'MOCK_SYSTEM':
      default: {
        OmnisyncTelemetry.verbose(
          'ActionDispatcherApparatus',
          'adapter_resolution',
          'Instanciando Mock Adapter para entorno de pruebas.',
        );
        return new MockEnterpriseResourcePlanningAdapter();
      }
    }
  }
}
