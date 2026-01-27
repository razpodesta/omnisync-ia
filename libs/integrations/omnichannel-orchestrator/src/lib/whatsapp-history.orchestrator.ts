/** libs/integrations/omnichannel-orchestrator/src/lib/whatsapp-history.orchestrator.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncMemory, OmnisyncDatabase } from '@omnisync-ecosystem/persistence';
import { INeuralIntent } from '@omnisync/core-contracts';

/**
 * @name WhatsAppHistoryOrchestrator
 * @description Aparato encargado de la persistencia y auditoría de hilos de conversación.
 * Gestiona el ciclo de vida de la ventana de servicio (24h) y sincroniza la memoria
 * volátil con la persistencia relacional SQL en Supabase.
 *
 * @protocol OEDP-Level: Elite (Inmutable Audit Trail)
 */
export class WhatsAppHistoryOrchestrator {
  /**
   * @private
   * Ventana operativa estándar de Meta para mensajería reactiva.
   */
  private static readonly SERVICE_WINDOW_HOURS = 24;

  /**
   * @method trackIncomingMessage
   * @description Registra una intención neural en los dos niveles de memoria del sistema.
   * Garantiza que la metadata sea tratada como un registro de auditoría inmutable.
   *
   * @param {INeuralIntent} incomingNeuralIntent - La intención normalizada del usuario.
   */
  public static async trackIncomingMessage(incomingNeuralIntent: INeuralIntent): Promise<void> {
    return await OmnisyncTelemetry.traceExecution(
      'WhatsAppHistoryOrchestrator',
      'trackIncomingMessage',
      async () => {
        const sessionIdentifier = `wa:history:${incomingNeuralIntent.tenantId}:${incomingNeuralIntent.externalUserId}`;

        try {
          /**
           * 1. Sincronización en Memoria Volátil (Upstash Redis)
           */
          await OmnisyncMemory.pushHistory(sessionIdentifier, {
            role: 'user',
            content: incomingNeuralIntent.payload.content,
            timestamp: incomingNeuralIntent.timestamp
          });

          /**
           * 2. Persistencia Fría de Auditoría (PostgreSQL / Prisma)
           * NIVELACIÓN TS2322: Se utiliza un casteo doble (unknown -> target)
           * para satisfacer la definición recursiva de 'InputJsonValue' de Prisma 7
           * sin recurrir al uso de 'any' prohibido.
           */
          await OmnisyncDatabase.databaseEngine.supportThread.create({
            data: {
              externalUserId: incomingNeuralIntent.externalUserId,
              tenantId: incomingNeuralIntent.tenantId,
              content: incomingNeuralIntent.payload.content,
              channel: 'WHATSAPP',
              metadata: incomingNeuralIntent.payload.metadata as Record<string, string | number | boolean | null>
            }
          });

          OmnisyncTelemetry.verbose(
            'WhatsAppHistoryOrchestrator',
            'sync',
            `Historial persistido para el usuario: ${incomingNeuralIntent.externalUserId}`
          );

        } catch (criticalError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-CORE-003',
            severity: 'MEDIUM',
            apparatus: 'WhatsAppHistoryOrchestrator',
            operation: 'persistence',
            message: 'core.persistence.history_sync_failure',
            context: {
              tenantId: incomingNeuralIntent.tenantId,
              error: String(criticalError)
            }
          });
        }
      }
    );
  }

  /**
   * @method isCustomerServiceWindowActive
   * @description Valida si la última interacción del usuario permite el envío de
   * mensajes de texto libre según las políticas de soberanía de Meta.
   */
  public static async isCustomerServiceWindowActive(
    tenantId: string,
    externalUserId: string
  ): Promise<boolean> {
    const lastInteractionRecord = await OmnisyncDatabase.databaseEngine.supportThread.findFirst({
      where: {
        tenantId,
        externalUserId,
        channel: 'WHATSAPP'
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!lastInteractionRecord) return false;

    const timeDifferenceInMilliseconds = Date.now() - new Date(lastInteractionRecord.createdAt).getTime();
    const hoursSinceLastInteraction = timeDifferenceInMilliseconds / (1000 * 60 * 60);

    return hoursSinceLastInteraction < this.SERVICE_WINDOW_HOURS;
  }
}
