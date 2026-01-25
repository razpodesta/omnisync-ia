/** libs/integrations/web-chat-driver/src/lib/web-chat-driver.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { INeuralIntent, NeuralIntentSchema } from '@omnisync/core-contracts';

/**
 * @name WebChatDriver
 * @description Aparato para la gestión de comunicación bidireccional vía WebSockets.
 * Traduce eventos del Widget Web en Intenciones Neurales estandarizadas.
 */
export class WebChatDriver {
  /**
   * @method transformEventToIntent
   * @description Normaliza el payload recibido desde el socket al formato universal del sistema.
   */
  public static async transformEventToIntent(
    socketClientId: string,
    rawPayload: unknown,
    tenantId: string
  ): Promise<INeuralIntent> {
    return await OmnisyncTelemetry.traceExecution(
      'WebChatDriver',
      'transformEventToIntent',
      async () => {
        try {
          const intent: Partial<INeuralIntent> = {
            id: crypto.randomUUID(),
            channel: 'WEB_CHAT',
            externalUserId: socketClientId,
            tenantId: tenantId as any, // Branded type cast
            payload: {
              type: 'TEXT',
              content: (rawPayload as any).message ?? '',
              metadata: { userAgent: (rawPayload as any).browserInfo ?? 'unknown' }
            },
            timestamp: new Date().toISOString()
          };

          return NeuralIntentSchema.parse(intent);
        } catch (error: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-701',
            severity: 'MEDIUM',
            apparatus: 'WebChatDriver',
            operation: 'transform',
            message: 'Fallo al mapear evento de socket a Intención Neural',
            context: { socketClientId, rawPayload }
          });
          throw error;
        }
      }
    );
  }
}