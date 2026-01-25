/** libs/integrations/omnichannel-orchestrator/src/lib/gateway-orchestrator.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { INeuralIntent, NeuralIntentSchema, TenantId } from '@omnisync/core-contracts';

/**
 * @name GatewayOrchestrator
 * @description Aparato de élite para la unificación de canales.
 * Convierte peticiones heterogéneas (WA/Web) en Intenciones Neurales puras.
 */
export class GatewayOrchestrator {
  /**
   * @method standardizeIntent
   * @description Toma un evento crudo de cualquier canal y lo transforma al estándar Omnisync.
   */
  public static async standardizeIntent(
    rawEvent: any,
    source: 'WHATSAPP' | 'WEB_CHAT',
    tenantId: string
  ): Promise<INeuralIntent> {
    return await OmnisyncTelemetry.traceExecution(
      'GatewayOrchestrator',
      `standardize:${source}`,
      async () => {
        try {
          const intent: Partial<INeuralIntent> = {
            id: crypto.randomUUID(),
            channel: source,
            externalUserId: source === 'WHATSAPP' ? rawEvent.from : rawEvent.sessionId,
            tenantId: tenantId as TenantId,
            payload: {
              type: 'TEXT',
              content: source === 'WHATSAPP' ? rawEvent.body : rawEvent.message,
              metadata: { platform: source, raw: rawEvent }
            },
            timestamp: new Date().toISOString()
          };

          return NeuralIntentSchema.parse(intent);
        } catch (error: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-500',
            severity: 'HIGH',
            apparatus: 'GatewayOrchestrator',
            operation: 'mapping',
            message: 'Error al normalizar la entrada del canal',
            context: { source, rawEvent, error: String(error) }
          });
          throw error;
        }
      }
    );
  }
}