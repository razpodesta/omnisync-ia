/** libs/integrations/omnichannel-orchestrator/src/lib/whatsapp/whatsapp-history.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { INeuralIntent } from '@omnisync/core-contracts';

/**
 * @section Importación Modular (Lego Style)
 * Consumimos los aparatos de persistencia interna nivelados bajo OEDP V2.2.
 */
import {
  ContextMemoryApparatus,
  ThreadAuditApparatus
} from '../persistence';

/**
 * @name WhatsAppHistoryApparatus
 * @description Orquestador de sincronización de datos para el canal de WhatsApp.
 * Coordina el flujo de información entre la memoria neural (Redis) y la auditoría 
 * relacional (SQL) asegurando integridad y trazabilidad forense en cada interacción.
 *
 * @protocol OEDP-Level: Elite (Contract-Aligned & Forensic Ready)
 */
export class WhatsAppHistoryApparatus {

  /**
   * @method synchronizeIncomingMessage
   * @description Orquesta el volcado paralelo de la intención hacia Redis y SQL.
   * RESOLUCIÓN TS2345: Se mapea el ADN de la intención al contrato 'IThreadAuditEntry'.
   *
   * @param {INeuralIntent} incomingNeuralIntent - ADN de la consulta del usuario.
   */
  public static async synchronizeIncomingMessage(
    incomingNeuralIntent: INeuralIntent
  ): Promise<void> {
    const apparatusName = 'WhatsAppHistoryApparatus';
    const operationName = 'synchronizeIncomingMessage';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        // Identificador soberano de sesión para memoria volátil
        const sessionIdentifierKey = `wa:history:${incomingNeuralIntent.tenantId}:${incomingNeuralIntent.externalUserId}`;

        try {
          /**
           * @section Persistencia en Tubería Paralela
           * Maximizamos el throughput mediante ejecución asíncrona concurrente.
           */
          await Promise.all([
            /**
             * 1. Inyección en Memoria Neural (Short-term Context)
             * Permite que el AI-Engine mantenga la coherencia del diálogo.
             */
            ContextMemoryApparatus.pushConversationFragment(
              sessionIdentifierKey,
              'user',
              incomingNeuralIntent.payload.content
            ),

            /**
             * 2. Inyección en Auditoría Relacional (Long-term Forensic Trace)
             * NIVELACIÓN: Sincronización con ThreadAuditEntrySchema V2.1.
             */
            ThreadAuditApparatus.executeAtomicAuditPersistence({
              intentIdentifier: incomingNeuralIntent.id,
              externalUserIdentifier: incomingNeuralIntent.externalUserId,
              tenantOrganizationIdentifier: incomingNeuralIntent.tenantId,
              textualContent: incomingNeuralIntent.payload.content,
              originChannel: 'WHATSAPP',
              authorRole: 'USER', // Clasificación de origen de la comunicación
              auditMetadata: {
                /**
                 * Metadatos enriquecidos preservados para análisis de ingeniería.
                 * Se eliminan redundancias ya presentes en la raíz del objeto.
                 */
                ...incomingNeuralIntent.payload.metadata,
                synchronizedAt: new Date().toISOString(),
                platformAgent: 'Omnisync-WhatsApp-Orchestrator-V2'
              }
            })
          ]);

          OmnisyncTelemetry.verbose(
            apparatusName,
            'sync_confirmed',
            `Sincronización forense completada para intención: ${incomingNeuralIntent.id}`
          );

        } catch (criticalSynchronizationError: unknown) {
          /**
           * @section Resiliencia y Failsafe
           * Reportamos el fallo pero no bloqueamos la respuesta al usuario final,
           * preservando la disponibilidad del canal.
           */
          await OmnisyncSentinel.report({
            errorCode: 'OS-CORE-003',
            severity: 'MEDIUM',
            apparatus: apparatusName,
            operation: operationName,
            message: 'integrations.omnichannel.history_sync_failed',
            context: {
              intentId: incomingNeuralIntent.id,
              error: String(criticalSynchronizationError)
            },
            isRecoverable: true
          });
        }
      }
    );
  }
}