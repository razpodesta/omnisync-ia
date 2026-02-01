/** libs/core/media-orchestrator/src/lib/apparatus/neural-voice-streamer.apparatus.ts */

import * as crypto from 'node:crypto';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncContracts, IVoiceInferenceResult } from '@omnisync/core-contracts';
import { NeuralVoiceSignalSchema, INeuralVoiceSignal } from '../schemas/neural-voice-streamer.schema';

/**
 * @name NeuralVoiceStreamerApparatus
 * @description Puente físico de transporte acústico (Fase 5.0).
 * Orquesta la transformación de buffers de inferencia en señales de transmisión 
 * compatibles con protocolos omnicanales. Implementa el triaje de MIME-Types 
 * y sellado de integridad mediante huellas digitales (Digital Fingerprinting).
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Acoustic-Signal-Streaming V5.0)
 */
export class NeuralVoiceStreamerApparatus {
  private static readonly apparatusName = 'NeuralVoiceStreamerApparatus';

  /**
   * @method prepareSignalForTransport
   * @description Transmuta un resultado de inferencia en una señal de transporte sellada.
   * 
   * @param {IVoiceInferenceResult} inferenceResult - ADN acústico crudo del VoiceEngine.
   * @param {string} targetChannel - Canal de destino (ej: 'WHATSAPP').
   * @param {string} intentId - Identificador de la intención neural original.
   * @returns {Promise<INeuralVoiceSignal>} Señal validada y lista para despacho físico.
   */
  public static async prepareSignalForTransport(
    inferenceResult: IVoiceInferenceResult,
    targetChannel: 'WHATSAPP' | 'WEB_CHAT' | 'VOICE_CALL',
    intentId: string
  ): Promise<INeuralVoiceSignal> {
    const operationName = 'prepareSignalForTransport';

    return await OmnisyncTelemetry.traceExecution(this.apparatusName, operationName, async () => {
      try {
        // 1. GENERACIÓN DE HUELLA DIGITAL (Sovereign Integrity)
        // Creamos un hash único para el buffer para auditoría forense.
        const fingerprint = this.calculateSignalFingerprint(inferenceResult.audioBuffer);

        // 2. TRIAJE DE CODIFICACIÓN (MIME-Type Sharding)
        // WhatsApp prefiere Opus/Ogg; Web Chat prefiere WebM/MPEG.
        const optimalMimeType = this.resolveOptimalMimeType(targetChannel);

        OmnisyncTelemetry.verbose(this.apparatusName, 'signal_transformation', 
          `Transmutando señal para canal: ${targetChannel} | MIME: ${optimalMimeType}`
        );

        const signalPayload: INeuralVoiceSignal = {
          signalIdentifier: crypto.randomUUID(),
          fingerprint,
          payload: inferenceResult.audioBuffer,
          specs: {
            mimeType: optimalMimeType,
            bitrate: 64000, // Standard OEDP Acoustic Bitrate
            durationSeconds: inferenceResult.durationSeconds,
          },
          origin: {
            intentId,
            provider: 'OMNISYNC_VOICE_CORE',
            engineVersion: 'OEDP-V5.0-STREAMER',
          },
          timestamp: new Date().toISOString(),
        };

        /**
         * @section Sello de Integridad SSOT
         * Validamos el ADN del transporte antes de que abandone la capa Core.
         */
        return OmnisyncContracts.validate(
          NeuralVoiceSignalSchema,
          signalPayload,
          this.apparatusName
        );

      } catch (criticalStreamingError: unknown) {
        /**
         * @note Gestión de Colapso Acústico
         * Un fallo aquí silencia el canal de voz. El Sentinel reporta con severidad HIGH.
         */
        await OmnisyncSentinel.report({
          errorCode: 'OS-CORE-701',
          severity: 'HIGH',
          apparatus: this.apparatusName,
          operation: operationName,
          message: 'Fallo crítico en la transmutación de la señal acústica.',
          context: { errorTrace: String(criticalStreamingError), intentId },
          isRecoverable: true
        });
        throw criticalStreamingError;
      }
    }, { intentId, targetChannel });
  }

  /**
   * @method calculateSignalFingerprint
   * @private
   */
  private static calculateSignalFingerprint(base64Buffer: string): string {
    return crypto
      .createHash('md5')
      .update(base64Buffer)
      .digest('hex');
  }

  /**
   * @method resolveOptimalMimeType
   * @private
   * @description Algoritmo de decisión de protocolo basado en el canal físico.
   */
  private static resolveOptimalMimeType(channel: string): INeuralVoiceSignal['specs']['mimeType'] {
    switch (channel) {
      case 'WHATSAPP':
        return 'audio/ogg; codecs=opus'; // Formato nativo PTT de WhatsApp
      case 'WEB_CHAT':
        return 'audio/webm'; // Optimización para navegadores modernos
      case 'VOICE_CALL':
        return 'audio/wav'; // Baja latencia para señalización VOIP
      default:
        return 'audio/mpeg';
    }
  }
}