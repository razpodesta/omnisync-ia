/** libs/integrations/omnichannel-orchestrator/src/lib/gateway-orchestrator.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { 
  INeuralIntent, 
  NeuralIntentSchema, 
  TenantId, 
  OmnisyncContracts,
  ChannelTypeSchema
} from '@omnisync/core-contracts';

// Traductores y Orquestadores de Persistencia
import { WhatsAppTranslatorApparatus } from './translators/whatsapp-translator.apparatus';
import { WebChatTranslatorApparatus } from './translators/web-chat-translator.apparatus';
import { OmnichannelHistoryOrchestrator } from './persistence/apparatus/omnichannel-history.orchestrator';

/**
 * @name GatewayOrchestrator
 * @description El Cerebro de Comunicaciones del Ecosistema. 
 * Actúa como un Hub de Soberanía que unifica eventos de red en intenciones neurales
 * validadas, sincronizando simultáneamente la memoria del bot y la auditoría forense.
 * 
 * @protocol OEDP-Level: Elite (Next-Gen Orchestration)
 */
export class GatewayOrchestrator {

  /** 
   * @private
   * Mapa de Estrategias: Permite añadir nuevos canales sin tocar el código base.
   */
  private static readonly TRANSLATOR_STRATEGIES = {
    WHATSAPP: WhatsAppTranslatorApparatus,
    WEB_CHAT: WebChatTranslatorApparatus,
    // Próximamente: TELEGRAM, VOICE_CALL
  } as const;

  /**
   * @method executeSovereignStandardization
   * @description Punto de entrada absoluto para tráfico omnicanal. 
   * Realiza la traducción, validación SSOT y activa la persistencia dual.
   * 
   * @param {unknown} rawPayload - El JSON bruto del webhook.
   * @param {keyof typeof GatewayOrchestrator.TRANSLATOR_STRATEGIES} channelIdentifier - El canal de origen.
   * @param {TenantId} tenantId - Sello de soberanía de la organización.
   * @returns {Promise<INeuralIntent>} Intención lista para el AI-Engine.
   */
  public static async executeSovereignStandardization(
    rawPayload: unknown,
    channelIdentifier: keyof typeof GatewayOrchestrator.TRANSLATOR_STRATEGIES,
    tenantId: TenantId
  ): Promise<INeuralIntent> {
    const apparatusName = 'GatewayOrchestrator';
    const operationName = `standardize:${channelIdentifier}`;

    return await OmnisyncTelemetry.traceExecution(apparatusName, operationName, async () => {
      try {
        /**
         * @section 1. Resolución de Estrategia de Traducción
         * Seleccionamos el traductor de forma determinista eliminando condicionales.
         */
        const translator = this.TRANSLATOR_STRATEGIES[channelIdentifier];
        if (!translator) {
          throw new Error(`OS-INTEG-404: Canal [${channelIdentifier}] no provisionado en el Gateway.`);
        }

        /**
         * @section 2. Traducción y Saneamiento
         * Invocamos al traductor nivelado (que ya usa ContentSanitizer e IdentityNormalizer).
         */
        const preNormalPayload = translator.translate(rawPayload as any, tenantId);

        /**
         * @section 3. Sello de Integridad Maestro (SSOT)
         * El orquestador garantiza que la salida cumpla con el ADN Core de Omnisync.
         */
        const finalizedIntent: INeuralIntent = NeuralIntentSchema.parse({
          ...preNormalPayload,
          id: crypto.randomUUID(),
          tenantId: tenantId,
          timestamp: new Date().toISOString()
        });

        /**
         * @section 4. Sincronización Transversal (Background Sync)
         * Activamos la persistencia en Redis y SQL sin bloquear el hilo de respuesta.
         * Esto hace que el bot tenga "memoria" antes de que la IA empiece a pensar.
         */
        this.dispatchStandardizationSideEffects(finalizedIntent);

        OmnisyncTelemetry.verbose(
          apparatusName, 
          'intent_standardized', 
          `Intent [${finalizedIntent.id}] de canal [${channelIdentifier}] listo para inferencia.`
        );

        return finalizedIntent;

      } catch (criticalError: unknown) {
        await OmnisyncSentinel.report({
          errorCode: 'OS-INTEG-500',
          severity: 'HIGH',
          apparatus: apparatusName,
          operation: operationName,
          message: 'integrations.omnichannel.standardization_failure',
          context: { channel: channelIdentifier, tenantId, error: String(criticalError) },
          isRecoverable: true
        });

        throw criticalError;
      }
    });
  }

  /**
   * @method dispatchStandardizationSideEffects
   * @private
   * @description Lógica de "disparar y olvidar" para la persistencia de historia.
   */
  private static dispatchStandardizationSideEffects(intent: INeuralIntent): void {
    // Ejecución asíncrona para no penalizar el tiempo de respuesta del Webhook
    OmnichannelHistoryOrchestrator.synchronizeIntent(intent).catch((err) => {
      console.error('[GATEWAY_SYNC_FAILURE]', err);
    });
  }
}