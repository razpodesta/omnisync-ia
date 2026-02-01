/** libs/integrations/ai-google-driver/src/lib/apparatus/gemini-pro-vision.apparatus.ts */

import * as crypto from 'node:crypto';
import { GoogleSovereignClientApparatus } from '../core/google-client.apparatus';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncContracts } from '@omnisync/core-contracts';
import { TokenPricingApparatus } from '@omnisync/core-auditor';

import { 
  GeminiProVisionInputSchema, 
  GeminiProVisionOutputSchema,
  IGeminiProVisionInput,
  IGeminiProVisionOutput 
} from '../schemas/gemini-pro-vision.schema';

/**
 * @name GeminiProVisionApparatus
 * @description Nodo de percepción multimodal de Omnisync-AI. 
 * Implementa la visión "Ojos de Mosca": decodifica señales visuales, audita ROI 
 * y sella la integridad biyectiva del lote de medios.
 * 
 * @author Raz Podestá <Creator>
 * @protocol OEDP-Level: Elite (Multimodal-Optical-Perception V5.5.3)
 */
export class GeminiProVisionApparatus {
  private static readonly apparatusName = 'GeminiProVisionApparatus';
  private static readonly MODEL_IDENTIFIER = 'gemini-1.5-pro-latest';

  /**
   * @method analyzeVisualContext
   * @description Orquesta la inferencia multimodal con blindaje de integridad.
   */
  public static async analyzeVisualContext(
    input: Readonly<IGeminiProVisionInput>
  ): Promise<IGeminiProVisionOutput> {
    const operationName = 'analyzeVisualContext';

    return await OmnisyncTelemetry.traceExecution(this.apparatusName, operationName, async () => {
      // 1. ADUANA DE ENTRADA Y FINGERPRINTING
      const validatedInput = OmnisyncContracts.validate(GeminiProVisionInputSchema, input, this.apparatusName);
      const batchFingerprint = this.calculateBatchFingerprint(validatedInput.mediaAssets);

      // 2. HANDSHAKE CON EL CLUSTER DE GOOGLE
      const googleAI = GoogleSovereignClientApparatus.getAuthenticatedInstance();
      const visionModel = googleAI.getGenerativeModel({ model: this.MODEL_IDENTIFIER });

      try {
        /**
         * @section Erradicación de Any (Standard V5.5)
         * Transformamos los assets a la estructura de Google con tipado estricto.
         */
        const promptContents = [
          { text: validatedInput.textPrompt },
          ...validatedInput.mediaAssets.map(asset => ({
            inlineData: {
              data: asset.base64Data,
              mimeType: asset.mimeType
            }
          }))
        ];

        // 3. EJECUCIÓN CON RESILIENCIA SENTINEL
        const result = await OmnisyncSentinel.executeWithResilience(
          async () => {
            const inferenceResponse = await visionModel.generateContent({
              contents: [{ role: 'user', parts: promptContents }],
              generationConfig: {
                temperature: validatedInput.config?.temperature ?? 0.4,
                maxOutputTokens: validatedInput.config?.maxOutputTokens ?? 2048,
              }
            });
            return inferenceResponse.response;
          },
          this.apparatusName,
          'optical_inference'
        );

        const responseText = result.text();

        // 4. AUDITORÍA DE ROI (Ojos de Mosca)
        const visualTokens = this.calculateEstimatedVisualTokens(validatedInput.mediaAssets.length);
        const textTokens = Math.ceil(validatedInput.textPrompt.length / 3.7);
        const totalForecastTokens = visualTokens + textTokens;
        
        const forecastCost = TokenPricingApparatus.calculateCost(
          'gemini-1.5-pro', 
          totalForecastTokens, 
          totalForecastTokens * 0.5 // Previsión de Output
        );

        const finalizedOutput: IGeminiProVisionOutput = {
          analysis: responseText,
          detectedAnomalies: this.extractAnomaliesFromText(responseText),
          confidenceScore: 0.95,
          usageMetadata: {
            imageCount: validatedInput.mediaAssets.length,
            estimatedTokens: totalForecastTokens,
            forecastCostUsd: forecastCost
          },
          originFingerprint: batchFingerprint
        };

        OmnisyncTelemetry.verbose(this.apparatusName, 'visual_perception_complete', 
          `Lote Sellado: ${batchFingerprint.substring(0, 12)} | ROI: $${forecastCost}`
        );

        return OmnisyncContracts.validate(GeminiProVisionOutputSchema, finalizedOutput, this.apparatusName);

      } catch (criticalVisionError: unknown) {
        return await this.handleVisionColapse(batchFingerprint, criticalVisionError);
      }
    });
  }

  /**
   * @method calculateBatchFingerprint
   * @private
   * @description Genera un sello SHA-256 del lote completo de imágenes.
   */
  private static calculateBatchFingerprint(assets: IGeminiProVisionInput['mediaAssets']): string {
    const combinedData = assets.map(a => a.base64Data).join(':');
    return crypto.createHash('sha256').update(combinedData).digest('hex');
  }

  private static calculateEstimatedVisualTokens(count: number): number {
    /** 
     * @note Google Standard: 258 tokens por imagen. 
     * En video/MP4 (Fase 6) esto escalará según FPS. 
     */
    return count * 258;
  }

  private static extractAnomaliesFromText(text: string): string[] {
    const patterns = ['falla', 'error', 'defect', 'warning', 'inconsistent', 'anomaly'];
    return patterns.filter(p => text.toLowerCase().includes(p));
  }

  private static async handleVisionColapse(fingerprint: string, error: unknown): Promise<never> {
    await OmnisyncSentinel.report({
      errorCode: 'OS-INTEG-601',
      severity: 'HIGH',
      apparatus: this.apparatusName,
      operation: 'optical_handshake',
      message: 'gemini.vision.errors.cluster_unreachable',
      context: { fingerprint, errorTrace: String(error) },
      isRecoverable: true
    });
    
    throw new Error(`OS-INTEG-601: Perception cluster failure for batch ${fingerprint.substring(0, 8)}`);
  }
}