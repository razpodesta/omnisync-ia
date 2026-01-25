/** libs/integrations/ai-google-driver/src/lib/gemini-driver.apparatus.ts */

import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import { IAIDriver, IAIModelConfig } from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';

/**
 * @name GeminiDriver
 * @description Driver de producción para Google Gemini 1.5. 
 * Maneja la construcción de contenidos y la interacción con el modelo generativo.
 */
export class GeminiDriver implements IAIDriver {
  public readonly providerName = 'GOOGLE_GEMINI';
  private readonly client: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) throw new Error('MISSING_GEMINI_API_KEY');
    this.client = new GoogleGenerativeAI(apiKey);
  }

  /**
   * @method generateResponse
   * @description Envía el historial completo y el nuevo prompt al modelo.
   */
  public async generateResponse(
    prompt: string, 
    config: IAIModelConfig,
    history: Content[] = []
  ): Promise<string> {
    return await OmnisyncTelemetry.traceExecution(
      'GeminiDriver',
      'generateResponse',
      async () => {
        try {
          const model = this.client.getGenerativeModel({ 
            model: config.modelName,
            systemInstruction: prompt // Inyectamos el System Prompt del Tenant
          });

          const chat = model.startChat({
            history: history,
            generationConfig: {
              temperature: config.temperature,
              maxOutputTokens: config.maxTokens,
            },
          });

          const result = await chat.sendMessage(prompt);
          const response = await result.response;
          return response.text();
        } catch (error: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-001',
            severity: 'CRITICAL',
            apparatus: 'GeminiDriver',
            operation: 'generate',
            message: 'Error en la comunicación con Google Vertex/AI Studio',
            context: { error: String(error) }
          });
          throw error;
        }
      }
    );
  }

  public calculateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}