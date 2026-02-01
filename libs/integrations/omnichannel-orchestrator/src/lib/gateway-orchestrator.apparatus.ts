/** libs/integrations/omnichannel-orchestrator/src/lib/gateway-orchestrator.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import {
  INeuralIntent,
  NeuralIntentSchema,
  TenantId,
  OmnisyncContracts,
  ChannelTypeSchema,
  INeuralFlowResult,
} from '@omnisync/core-contracts';
import { VoiceOrchestratorApparatus } from '@omnisync/voice-engine';

/**
 * @section Traductores Atómicos (Lego Pieces)
 */
import { WhatsAppTranslatorApparatus } from './translators/whatsapp-translator.apparatus';
import { WebChatTranslatorApparatus } from './translators/web-chat-translator.apparatus';

/**
 * @section Orquestación de Capas Superiores
 */
import { OmnichannelHistoryOrchestrator } from './persistence/apparatus/omnichannel-history.orchestrator';
import {
  IOmnichannelTranslator,
  IOmnichannelTranslationResult,
} from './schemas/omnichannel-translator.schema';

/**
 * @name GatewayOrchestrator
 * @description Nodo maestro de comunicaciones Omnisync-AI (V5.0). 
 * Orquesta la transformación de señales de red y el ruteo de respuestas multimodales.
 * Implementa el protocolo "Signal Sharding" para separar el tráfico de texto del de audio,
 * garantizando una experiencia de usuario fluida y reactiva.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Multimodal-Signal-Orchestration V5.0)
 */
export class GatewayOrchestrator {
  private static readonly apparatusName = 'GatewayOrchestrator';

  /**
   * @private
   * @description Registro inmutable de traductores nivelado para la Fase 5.
   */
  private static readonly AUTHORIZED_TRANSLATOR_REGISTRY: Readonly<Record<string, IOmnichannelTranslator>> = {
    WHATSAPP: new WhatsAppTranslatorApparatus(),
    WEB_CHAT: new WebChatTranslatorApparatus(),
    /** 
     * @note Nodo Telefonía IP 2026 
     * Soporte para transcripción en tiempo real y señalización VOIP.
     */
    VOICE_CALL: new WebChatTranslatorApparatus(), // Fallback temporal a normalización web
  };

  /**
   * @method executeSovereignStandardization
   * @description Procesa tráfico de entrada. Transforma protocolos amorfos en ADN neural.
   */
  public static async executeSovereignStandardization(
    rawNetworkPayload: unknown,
    channelIdentifier: string,
    tenantId: TenantId,
  ): Promise<INeuralIntent> {
    const operationName = 'executeSovereignStandardization';

    return await OmnisyncTelemetry.traceExecution(this.apparatusName, operationName, async () => {
      // 1. Handshake de Canal
      const validatedChannel = OmnisyncContracts.validate(
        ChannelTypeSchema,
        channelIdentifier.toUpperCase().trim(),
        `${this.apparatusName}:ChannelAudit`
      );

      const translator = this.AUTHORIZED_TRANSLATOR_REGISTRY[validatedChannel];
      if (!translator) throw new Error(`OS-INTEG-404: Canal [${validatedChannel}] no habilitado.`);

      // 2. Normalización Semántica
      const localizedUrgencyKeys = await this.resolveTenantUrgencyContext(tenantId);
      const translationResult: IOmnichannelTranslationResult = translator.translate(
        rawNetworkPayload,
        tenantId,
        localizedUrgencyKeys,
      );

      // 3. Sello de Intención (SSOT)
      const finalizedNeuralIntent = OmnisyncContracts.validate(NeuralIntentSchema, {
        ...translationResult,
        id: crypto.randomUUID(),
        tenantId,
        timestamp: new Date().toISOString(),
      }, this.apparatusName);

      // 4. Efectos Secundarios: Persistencia Biyectiva
      this.triggerAsyncPersistenceSideEffects(finalizedNeuralIntent);

      return finalizedNeuralIntent;
    }, { tenantId, channel: channelIdentifier });
  }

  /**
   * @method executeResponseRouting
   * @description Orquesta la salida de datos. Evalúa si la respuesta debe ser 
   * sintetizada por el VoiceEngine (Vocalización Reactiva).
   * 
   * @param {INeuralFlowResult} flowResult - Resultado de la inferencia IA.
   * @returns {Promise<INeuralFlowResult>} Resultado enriquecido con buffer de audio si aplica.
   */
  public static async executeResponseRouting(
    flowResult: INeuralFlowResult
  ): Promise<INeuralFlowResult> {
    const operationName = 'executeResponseRouting';

    return await OmnisyncTelemetry.traceExecution(this.apparatusName, operationName, async () => {
      const { vocalContext } = flowResult.artificialIntelligenceResponse as any;

      /**
       * @section Gate de Vocalización
       * Si el cerebro neural marcó la respuesta como vocalizable (ej. Canal WA o Voice),
       * disparamos la síntesis en paralelo para optimizar TTV (Time to Voice).
       */
      if (vocalContext?.isVocalizable) {
        OmnisyncTelemetry.verbose(this.apparatusName, 'vocal_routing_active', 
          `Iniciando síntesis reactiva para intención: ${flowResult.neuralIntentIdentifier}`
        );

        try {
          const vocalBuffer = await OmnisyncSentinel.executeWithResilience(
            () => VoiceOrchestratorApparatus.synthesizeSovereignSpeech({
              text: flowResult.finalMessage,
              tenantId: flowResult.tenantId,
              emotion: vocalContext.suggestedEmotion,
              intentId: flowResult.neuralIntentIdentifier
            } as any),
            this.apparatusName,
            'acoustic_synthesis'
          );

          // Inyectamos el buffer en los metadatos de respuesta para el canal físico
          (flowResult as any).audioOutput = vocalBuffer;

        } catch (vocalFailure: unknown) {
          /**
           * @note Failsafe Multimodal
           * Si la voz falla, el sistema degrada a "Solo Texto" para no romper la UX.
           */
          OmnisyncTelemetry.verbose(this.apparatusName, 'vocal_degradation', 'Degradando a modo solo-texto por fallo en síntesis.');
        }
      }

      return flowResult;
    });
  }

  /**
   * @method resolveTenantUrgencyContext
   * @private
   */
  private static async resolveTenantUrgencyContext(_tenantId: TenantId): Promise<string[]> {
    return ['urgente', 'emergencia', 'falla', 'error', 'ayuda', 'caído', 'roto'];
  }

  /**
   * @method triggerAsyncPersistenceSideEffects
   * @private
   */
  private static triggerAsyncPersistenceSideEffects(intent: INeuralIntent): void {
    OmnichannelHistoryOrchestrator.synchronizeIntent(intent).catch(async (error) => {
      await OmnisyncSentinel.report({
        errorCode: 'OS-CORE-003',
        severity: 'MEDIUM',
        apparatus: 'GatewayOrchestrator:Persistence',
        operation: 'async_sync',
        message: 'Fuga de persistencia detectada en el ruteo.',
        context: { error: String(error) }
      });
    });
  }
}