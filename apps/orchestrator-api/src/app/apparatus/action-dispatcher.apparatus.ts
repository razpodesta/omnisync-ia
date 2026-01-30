/** apps/orchestrator-api/src/app/apparatus/action-dispatcher.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncSecurity } from '@omnisync/core-security';
import { OmnisyncEnterpriseResourcePlanningOrchestrator } from '@omnisync/erp-engine';

/**
 * @section Adaptadores Autorizados (Lego Pieces)
 * Importación de implementaciones niveladas para el despacho polimórfico.
 */
import { MockEnterpriseResourcePlanningAdapter } from '@omnisync/erp-mock';
import { OdooAdapterApparatus } from '@omnisync/erp-odoo';

import {
  INeuralIntent,
  ITenantConfiguration,
  IAIResponse as IArtificialIntelligenceResponse,
  IEnterpriseResourcePlanningActionResponse,
  IEnterpriseResourcePlanningAdapter,
  OmnisyncContracts,
  EnterpriseResourcePlanningActionResponseSchema,
} from '@omnisync/core-contracts';

/**
 * @name ActionDispatcherApparatus
 * @description Aparato de despacho operativo de alta fidelidad. Orquesta la 
 * materialización de inferencias neurales en acciones transaccionales dentro 
 * de sistemas ERP/CRM. Gestiona la resolución dinámica de adaptadores, 
 * el descifrado de credenciales soberanas y el aprovisionamiento atómico de servicios.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Action-Orchestration V3.2)
 * @vision Ultra-Holística: Zero-Trust-Credentials & Polymorphic-Execution
 */
export class ActionDispatcherApparatus {
  /**
   * @method dispatchOperationalAction
   * @description Evalúa el triaje de la IA y, si se requiere escalación operativa, 
   * resuelve el puente técnico hacia el ERP del suscriptor.
   *
   * @param {INeuralIntent} incomingNeuralIntent - Intención original capturada.
   * @param {IArtificialIntelligenceResponse} artificialIntelligenceResponse - Inferencia del cerebro neural.
   * @param {ITenantConfiguration} tenantConfiguration - ADN técnico del nodo organizacional.
   * @returns {Promise<IEnterpriseResourcePlanningActionResponse | undefined>} Respuesta sellada por SSOT o undefined.
   */
  public static async dispatchOperationalAction(
    incomingNeuralIntent: INeuralIntent,
    artificialIntelligenceResponse: IArtificialIntelligenceResponse,
    tenantConfiguration: ITenantConfiguration,
  ): Promise<IEnterpriseResourcePlanningActionResponse | undefined> {
    const apparatusName = 'ActionDispatcherApparatus';
    const operationName = 'dispatchOperationalAction';

    /**
     * @section Triaje de Acción (Cognitive Gate)
     * El despacho solo se activa si la IA ha emitido la señal 'ESCALATED_TO_ERP'.
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
           * Instanciamos el adaptador específico y desciframos sus secretos AES-256-GCM.
           */
          const sovereignAdapter = await this.resolveSovereignAdapter(tenantConfiguration);

          /**
           * 2. Fase de Aprovisionamiento Atómico
           * Delegamos al orquestador la creación del ticket, asegurando la 
           * vinculación con el ID del usuario de WhatsApp/Web.
           */
          const actionResponse = await OmnisyncEnterpriseResourcePlanningOrchestrator.executeServiceTicketProvisioning(
            sovereignAdapter,
            {
              userId: incomingNeuralIntent.externalUserId,
              subject: `Incidencia Neural: ${incomingNeuralIntent.id.substring(0, 8)}`,
              description: artificialIntelligenceResponse.suggestion,
              priority: 'MEDIUM',
              createdAt: new Date().toISOString(),
            },
          );

          /**
           * @note Validación de Salida (SSOT)
           */
          return OmnisyncContracts.validate(
            EnterpriseResourcePlanningActionResponseSchema,
            actionResponse,
            `${apparatusName}:OperationalResponse`
          );

        } catch (criticalDispatchError: unknown) {
          /**
           * @section Gestión de Resiliencia
           * Si el puente ERP colapsa, el Sentinel reporta la brecha de acción 
           * para intervención humana inmediata.
           */
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-404',
            severity: 'HIGH',
            apparatus: apparatusName,
            operation: operationName,
            message: 'core.action_dispatcher.dispatch_failed',
            context: {
              tenantId: tenantConfiguration.id,
              adapter: tenantConfiguration.enterpriseResourcePlanning.adapterIdentifier,
              error: String(criticalDispatchError),
            },
            isRecoverable: true,
          });

          throw criticalDispatchError;
        }
      },
      { tenantId: tenantConfiguration.id, adapter: tenantConfiguration.enterpriseResourcePlanning.adapterIdentifier }
    );
  }

  /**
   * @method resolveSovereignAdapter
   * @private
   * @description Factoría interna de adaptadores. Implementa el descifrado 
   * de ADN de conexión utilizando la llave maestra del ecosistema.
   */
  private static async resolveSovereignAdapter(
    tenantConfiguration: ITenantConfiguration,
  ): Promise<IEnterpriseResourcePlanningAdapter> {
    const apparatusName = 'ActionDispatcherApparatus:Resolver';
    const adapterType = tenantConfiguration.enterpriseResourcePlanning.adapterIdentifier;

    switch (adapterType) {
      case 'ODOO_V16': {
        const masterSystemEncryptionKey = process.env['SYSTEM_ENCRYPTION_KEY'];

        if (!masterSystemEncryptionKey) {
          throw new Error('OS-SEC-004: Master System Encryption Key is missing.');
        }

        /**
         * @section Descifrado de Credenciales (Security First)
         * El ADN de conexión de Odoo se recupera y se procesa en memoria volátil.
         */
        const decryptedCredentialsJson = await OmnisyncSecurity.decryptSensitiveData(
          tenantConfiguration.enterpriseResourcePlanning.encryptedCredentials,
          masterSystemEncryptionKey,
        );

        const odooConfig = JSON.parse(decryptedCredentialsJson);

        return new OdooAdapterApparatus(odooConfig);
      }

      case 'MOCK_SYSTEM':
      default: {
        OmnisyncTelemetry.verbose(apparatusName, 'adapter_fallback', 'Activando simulador de pruebas ERP.');
        return new MockEnterpriseResourcePlanningAdapter();
      }
    }
  }
}