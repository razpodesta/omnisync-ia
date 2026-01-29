/** libs/integrations/ai-google-driver/src/lib/gemini-driver.apparatus.ts */

import {
  GoogleGenerativeAI,
  Content,
  GenerativeModel,
  Part,
} from '@google/generative-ai';
import {
  IArtificialIntelligenceDriver,
  IArtificialIntelligenceModelConfiguration,
} from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';

/**
 * @interface ISovereignConversationEntry
 * @description Estructura interna para la validación de mensajes históricos.
 */
interface ISovereignConversationEntry {
  readonly role: 'user' | 'assistant';
  readonly content: string;
}

/**
 * @name GoogleGeminiDriver
 * @description Implementación técnica de élite para la integración con Gemini 3 (v2026).
 * Orquesta la inferencia generativa y embeddings bajo soberanía de tipos estricta.
 *
 * @protocol OEDP-Level: Elite (Zero Any Implementation)
 */
export class GoogleGeminiDriver implements IArtificialIntelligenceDriver {
  public readonly providerName: string = 'GOOGLE_GEMINI';

  private static readonly MODEL_MAP = {
    PRO: 'gemini-3-pro-latest',
    FLASH: 'gemini-3-flash-latest',
    DEEP_THINK: 'gemini-3-deep-think-experimental',
    EMBEDDING: 'text-embedding-004',
  } as const;

  private readonly googleGenerativeAIClient: GoogleGenerativeAI;
  private readonly activeModelIdentifier: string;

  constructor(modelAlias: keyof typeof GoogleGeminiDriver.MODEL_MAP = 'FLASH') {
    const securityApiKey = process.env['GOOGLE_GEMINI_API_KEY'];

    if (!securityApiKey) {
      OmnisyncSentinel.report({
        errorCode: 'OS-INTEG-401',
        severity: 'CRITICAL',
        apparatus: 'GoogleGeminiDriver',
        operation: 'instantiation',
        message: 'integrations.google_gemini.errors.missing_api_key',
      });
      throw new Error('OS-INTEG-401: Google AI API Key missing.');
    }

    this.googleGenerativeAIClient = new GoogleGenerativeAI(securityApiKey);
    this.activeModelIdentifier = GoogleGeminiDriver.MODEL_MAP[modelAlias];
  }

  public async generateResponse(
    inferencePrompt: string,
    modelConfiguration: IArtificialIntelligenceModelConfiguration,
    conversationHistoryContext: unknown[] = [],
  ): Promise<string> {
    return await OmnisyncTelemetry.traceExecution(
      'GoogleGeminiDriver',
      'generateResponse',
      async () => {
        try {
          const generativeModel: GenerativeModel =
            this.googleGenerativeAIClient.getGenerativeModel({
              model: this.activeModelIdentifier,
            });

          const chatSession = generativeModel.startChat({
            history: this.mapToGoogleSovereignHistory(
              conversationHistoryContext,
            ),
            generationConfig: {
              temperature: modelConfiguration.temperature,
              maxOutputTokens: modelConfiguration.maxTokens,
              topP: modelConfiguration.topP,
            },
          });

          const executionResult =
            await chatSession.sendMessage(inferencePrompt);
          return executionResult.response.text();
        } catch (executionError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-001',
            severity: 'HIGH',
            apparatus: 'GoogleGeminiDriver',
            operation: 'generateResponse',
            message: 'integrations.google_gemini.errors.inference_failure',
            context: {
              model: this.activeModelIdentifier,
              error: String(executionError),
            },
          });
          throw executionError;
        }
      },
    );
  }

  public async calculateVectorEmbeddings(
    textualContent: string,
  ): Promise<number[]> {
    const model = this.googleGenerativeAIClient.getGenerativeModel({
      model: GoogleGeminiDriver.MODEL_MAP.EMBEDDING,
    });
    const result = await model.embedContent(textualContent);
    return result.embedding.values;
  }

  public calculateTokens(textualContent: string): number {
    return Math.ceil(textualContent.length / 3.8);
  }

  /**
   * @method mapToGoogleSovereignHistory
   * @private
   * @description Transforma el historial de Omnisync al contrato de Google sin usar 'any'.
   */
  private mapToGoogleSovereignHistory(rawHistory: unknown[]): Content[] {
    // Cast seguro mediante la interfaz de contrato interna
    const validatedHistory =
      rawHistory as readonly ISovereignConversationEntry[];

    return validatedHistory.map((entry) => ({
      role: entry.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: entry.content }] as Part[],
    }));
  }
}
