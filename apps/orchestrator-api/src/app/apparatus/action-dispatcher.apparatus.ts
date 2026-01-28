/** apps/orchestrator-api/src/app/apparatus/action-dispatcher.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncSecurity } from '@omnisync/core-security';
import { OmnisyncEnterpriseResourcePlanningOrchestrator } from '@omnisync/erp-engine';

// Adaptadores Autorizados (Lego Pieces)
import { MockEnterpriseResourcePlanningAdapter } from '@omnisync/erp-mock';
import { OdooAdapterApparatus } from '@omnisync/erp-odoo';

import {
  INeuralIntent,
  ITenantConfiguration,
  IAIResponse,
  IEnterpriseResourcePlanningActionResponse,
  IEnterpriseResourcePlanningAdapter
} from '@omnisync/core-contracts';

/**
 * @name ActionDispatcherApparatus
 * @description Aparato especializado en la orquestación y despacho de acciones operativas.
 * Centraliza la resolución dinámica de adaptadores ERP/CRM, la desencriptación de
 * credenciales soberanas y el aprovisionamiento de servicios externos.
 *
 * @protocol OEDP-Level: Elite (Atomic Dispatcher)
 */
export class ActionDispatcherApparatus {

  /**
   * @method dispatchOperationalAction
   * @description Evalúa la intención neural y, si requiere intervención operativa,
   * resuelve el adaptador y ejecuta la acción en el sistema externo.
   *
   * @param {INeuralIntent} incomingNeuralIntent - Intención original del usuario.
   * @param {IAIResponse} artificialIntelligenceResponse - Inferencia del modelo de IA.
   * @param {ITenantConfiguration} tenantConfiguration - ADN técnico del nodo suscriptor.
   * @returns {Promise<IEnterpriseResourcePlanningActionResponse | undefined>} Resultado de la acción o undefined.
   */
  public static async dispatchOperationalAction(
    incomingNeuralIntent: INeuralIntent,
    artificialIntelligenceResponse: IAIResponse,
    tenantConfiguration: ITenantConfiguration
  ): Promise<IEnterpriseResourcePlanningActionResponse | undefined> {
    const apparatusName = 'ActionDispatcherApparatus';
    const operationName = 'dispatchOperationalAction';

    // Evaluación de necesidad: Solo despachamos si el estado de la IA es ESCALATED_TO_ERP
    if (artificialIntelligenceResponse.status !== 'ESCALATED_TO_ERP') {
      return undefined;
    }

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        try {
          /**
           * @section Fase de Resolución de Adaptador
           * El dispatcher aísla la lógica de instanciación del flujo principal.
           */
          const sovereignAdapter = await this.resolveSovereignAdapter(tenantConfiguration);

          /**
           * @section Fase de Ejecución Operativa
           * Delega al orquestador de motor ERP la creación del ticket técnico.
           */
          return await OmnisyncEnterpriseResourcePlanningOrchestrator.executeServiceTicketProvisioning(
            sovereignAdapter,
            {
              userId: incomingNeuralIntent.externalUserId,
              subject: `Incidencia Neural: ${incomingNeuralIntent.id.substring(0, 8)}`,
              description: artificialIntelligenceResponse.suggestion,
              priority: 'MEDIUM',
              createdAt: new Date().toISOString()
            }
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
              error: String(criticalDispatchError)
            },
            isRecoverable: true
          });

          throw criticalDispatchError;
        }
      }
    );
  }

  /**
   * @method resolveSovereignAdapter
   * @private
   * @description Factoría interna para la resolución de adaptadores y secretos.
   */
  private static async resolveSovereignAdapter(
    tenantConfiguration: ITenantConfiguration
  ): Promise<IEnterpriseResourcePlanningAdapter> {
    const adapterIdentifier = tenantConfiguration.enterpriseResourcePlanning.adapterIdentifier;

    switch (adapterIdentifier) {
      case 'ODOO_V16': {
        const systemEncryptionKey = process.env['SYSTEM_ENCRYPTION_KEY'];

        if (!systemEncryptionKey) {
          throw new Error('OS-SEC-004: Master System Encryption Key is missing in the environment.');
        }

        /**
         * @section Seguridad de Élite
         * Desencriptación atómica del ADN de conexión de Odoo.
         */
        const decryptedCredentialsJson = await OmnisyncSecurity.decryptSensitiveData(
          tenantConfiguration.enterpriseResourcePlanning.encryptedCredentials,
          systemEncryptionKey
        );

        return new OdooAdapterApparatus(JSON.parse(decryptedCredentialsJson));
      }

      case 'MOCK_SYSTEM':
      default: {
        return new MockEnterpriseResourcePlanningAdapter();
      }
    }
  }
}
