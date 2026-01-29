/** libs/integrations/whatsapp-meta-driver/src/lib/apparatus/meta-voice-signal.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncContracts } from '@omnisync/core-contracts';
import {
  MetaVoiceCallSignalSchema,
  IMetaVoiceCallSignal,
} from '../schemas/meta-contracts.schema';

/**
 * @name MetaVoiceSignalApparatus
 * @description Aparato de élite para la gestión de señalización VOIP (Voice over IP).
 * Orquesta la iniciación, transferencia y terminación de llamadas de voz oficiales
 * de Meta, integrando el flujo de audio con el cerebro neural de Omnisync.
 *
 * @protocol OEDP-Level: Elite (VOIP Signal Orchestration)
 */
export class MetaVoiceSignalApparatus {
  /**
   * @method dispatchVoiceSignal
   * @description Nodo central para el control de señalización telefónica.
   * Valida la integridad del comando antes de su transmisión al cluster de Meta.
   *
   * @param {string} facebookPhoneNumberIdentifier - ID técnico del canal de voz.
   * @param {string} permanentAccessToken - Token de sistema con permisos de telefonía.
   * @param {IMetaVoiceCallSignal} voiceSignalPayload - ADN de la operación de voz.
   */
  public static async dispatchVoiceSignal(
    facebookPhoneNumberIdentifier: string,
    permanentAccessToken: string,
    voiceSignalPayload: IMetaVoiceCallSignal,
  ): Promise<void> {
    const apparatusName = 'MetaVoiceSignalApparatus';
    const operationName = `signal:${voiceSignalPayload.signalAction}`;

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        /**
         * @section Validación de Soberanía de Señal
         * Aseguramos que la acción (START, TRANSFER, etc.) cumpla con el contrato 2026.
         */
        const validatedSignal = OmnisyncContracts.validate(
          MetaVoiceCallSignalSchema,
          voiceSignalPayload,
          apparatusName,
        );

        return await OmnisyncSentinel.executeWithResilience(
          async () => {
            const callManagementUrl = `https://graph.facebook.com/v20.0/${facebookPhoneNumberIdentifier}/calls`;

            // Construcción del payload según la acción de señalización
            const metaRequestBody =
              this.assembleVoiceSignalBody(validatedSignal);

            const networkResponse = await fetch(callManagementUrl, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${permanentAccessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(metaRequestBody),
            });

            if (!networkResponse.ok) {
              const errorTrace = await networkResponse.json();
              throw new Error(
                `META_VOIP_FAILURE: ${networkResponse.status} - ${JSON.stringify(errorTrace)}`,
              );
            }

            OmnisyncTelemetry.verbose(
              apparatusName,
              'signal_confirmed',
              `Llamada [${validatedSignal.callIdentifier}] accionada: ${validatedSignal.signalAction}`,
            );
          },
          apparatusName,
          operationName,
        );
      },
    );
  }

  /**
   * @method assembleVoiceSignalBody
   * @private
   * @description Ensamblador de gramática Meta para protocolos de voz.
   */
  private static assembleVoiceSignalBody(
    signal: IMetaVoiceCallSignal,
  ): unknown {
    const base = {
      messaging_product: 'whatsapp',
      call_id: signal.callIdentifier,
      to: signal.recipientPhoneNumber,
    };

    switch (signal.signalAction) {
      case 'START_CALL':
        return {
          ...base,
          action: 'initiate',
          config: {
            audio_quality: signal.callMetadata?.quality ?? 'HD',
            recording_enabled: false, // Soberanía de privacidad por defecto
          },
        };

      case 'TRANSFER':
        return {
          ...base,
          action: 'transfer',
          transfer_to: 'AGENT_ID_PLACEHOLDER', // Inyectado por el orquestador en Fase 3
        };

      case 'END_CALL':
        return { ...base, action: 'terminate' };

      case 'REJECT':
        return { ...base, action: 'reject' };

      default:
        throw new Error(
          `integrations.meta.unsupported_voice_signal: ${signal.signalAction}`,
        );
    }
  }
}
