/** libs/integrations/ai-google-driver/src/lib/apparatus/gemini-flash-live.apparatus.ts */

import * as crypto from 'node:crypto';
import { GoogleSovereignClientApparatus } from '../core/google-client.apparatus';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncContracts } from '@omnisync/core-contracts';
import { TokenPricingApparatus } from '@omnisync/core-auditor';

import { 
  GeminiFlashLiveOutputSchema, 
  IGeminiFlashLiveOutput, 
  GeminiFlashLiveConfigurationSchema,
  IGeminiFlashLiveConfiguration 
} from '../schemas/gemini-flash-live.schema';

/**
 * @name GeminiFlashLiveApparatus
 * @description Nodo de inferencia multimodal de alta velocidad (Fase 5.5).
 * Orquesta la generación simultánea de texto y voz mediante Gemini 2.0 Flash.
 * Implementa la visión "Ojos de Mosca": audita ROI en tiempo real y sella
 * biyectivamente la relación entre el mensaje y su ADN acústico.
 * 
 * @author Raz Podestá <Creator>
 * @protocol OEDP-Level: Elite (Multimodal-Live-Inference V5.5.2)
 */
export class GeminiFlashLiveApparatus {
  private static readonly apparatusName = 'GeminiFlashLiveApparatus';
  private static readonly MODEL_IDENTIFIER = 'gemini-2.0-flash-exp';

  /**
   * @method generateLiveResponse
   * @description Ejecuta el ciclo de inferencia multimodal con blindaje de integridad.
   */
  public static async generateLiveResponse(
    prompt: string,
    customConfig: Partial<IGeminiFlashLiveConfiguration> = {}
  ): Promise<IGeminiFlashLiveOutput> {
    const operationName = 'generateLiveResponse';
    const startTime = performance.now();

    return await OmnisyncTelemetry.traceExecution(this.apparatusName, operationName, async () => {
      // 1. ADUANA DE CONFIGURACIÓN
      const config = OmnisyncContracts.validate(GeminiFlashLiveConfigurationSchema, customConfig, this.apparatusName);

      const google = GoogleSovereignClientApparatus.getAuthenticatedInstance();
      
      try {
        const model = google.getGenerativeModel({ 
          model: this.MODEL_IDENTIFIER,
          /**
           * @note Protocolo de Salida Multimodal 2026
           * Configuramos Gemini 2.0 para actuar como un locutor humano (AOEDE).
           */
          generationConfig: {
            temperature: config.temperature,
            // @ts-ignore - Soporte para Early 2026 SDK Modalities
            response_modalities: config.enableSpeechOutput ? ["audio", "text"] : ["text"],
            speech_config: { 
              voice_config: { 
                prebuilt_voice_config: { voice_name: config.voiceStyle } 
              } 
            }
          }
        });

        // 2. EJECUCIÓN CON RESILIENCIA SENTINEL
        const result = await OmnisyncSentinel.executeWithResilience(
          () => model.generateContent(prompt),
          this.apparatusName,
          'multimodal_ignition'
        );

        const response = await result.response;
        const responseText = response.text();
        
        // Extracción segura de la hebra acústica (InlineData)
        const audioData = (response as any).candidates?.[0]?.content?.parts?.find(
          (part: any) => part.inlineData
        )?.inlineData?.data;

        // 3. AUDITORÍA DE ROI Y INTEGRIDAD (Ojos de Mosca)
        const inputTokens = Math.ceil(prompt.length / 3.7);
        const outputTokens = Math.ceil(responseText.length / 3.7) + (audioData ? 150 : 0); // Heurística de tokens de audio
        
        const totalCost = TokenPricingApparatus.calculateCost(
          'gemini-1.5-flash', // Pricing baseline para Flash 2.0
          inputTokens, 
          outputTokens
        );

        const textHash = crypto.createHash('sha256').update(responseText).digest('hex');
        const audioHash = audioData ? crypto.createHash('sha256').update(audioData).digest('hex') : undefined;

        const finalizedOutput: IGeminiFlashLiveOutput = {
          text: responseText,
          audioBufferBase64: audioData,
          integrityFingerprint: {
            textHash,
            audioHash
          },
          usageMetadata: {
            inputTokens,
            outputTokens,
            costUsd: totalCost,
            latencyMs: performance.now() - startTime
          }
        };

        OmnisyncTelemetry.verbose(this.apparatusName, 'multimodal_resonance_sealed', 
          `Text: ${textHash.substring(0, 8)} | Audio: ${audioHash?.substring(0, 8) ?? 'NONE'} | ROI: $${totalCost}`
        );

        // 4. SELLO DE SOBERANÍA FINAL
        return OmnisyncContracts.validate(GeminiFlashLiveOutputSchema, finalizedOutput, this.apparatusName);

      } catch (criticalMultimodalError: unknown) {
        return await this.handleMultimodalColapse(criticalMultimodalError, startTime);
      }
    });
  }

  /**
   * @method handleMultimodalColapse
   * @private
   */
  private static async handleMultimodalColapse(error: unknown, start: number): Promise<never> {
    const latency = performance.now() - start;
    
    await OmnisyncSentinel.report({
      errorCode: 'OS-INTEG-601',
      severity: 'HIGH',
      apparatus: this.apparatusName,
      operation: 'multimodal_inference',
      message: 'gemini.flash_live.errors.vocal_synthesis_failed',
      context: { errorTrace: String(error), latency },
      isRecoverable: true
    });
    
    throw new Error(`OS-INTEG-601: Multimodal Cluster colapsed after ${latency.toFixed(2)}ms.`);
  }
}