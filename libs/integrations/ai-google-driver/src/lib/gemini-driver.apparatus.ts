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
 * Garantiza que el mapeo hacia Google AI cumpla con los roles autorizados.
 */
interface ISovereignConversationEntry {
  readonly role: 'user' | 'assistant' | 'model';
  readonly content: string;
}

/**
 * @name GoogleGeminiDriver
 * @description Implementación técnica de élite para la integración con el ecosistema Gemini.
 * Orquesta la inferencia generativa y la generación de firmas vectoriales (Embeddings)
 * bajo soberanía de tipos estricta y blindaje de telemetría.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Inference-Sovereignty V3.2)
 * @vision Ultra-Holística: Zero-Any & Resilient-Cognition
 */
export class GoogleGeminiDriver implements IArtificialIntelligenceDriver {
  public readonly providerName: string = 'GOOGLE_GEMINI';

  /**
   * @private
   * Mapeo inmutable de identificadores de modelos para el año 2026.
   */
  private static readonly MODEL_MAP = {
    PRO: 'gemini-1.5-pro-latest',
    FLASH: 'gemini-1.5-flash-latest',
    DEEP_THINK: 'gemini-2.0-flash-thinking-exp',
    EMBEDDING: 'text-embedding-004',
  } as const;

  private readonly googleGenerativeAIClient: GoogleGenerativeAI;
  private readonly activeModelIdentifier: string;

  constructor(modelAlias: keyof typeof GoogleGeminiDriver.MODEL_MAP = 'FLASH') {
    const securityApiKey = process.env['GOOGLE_GEMINI_API_KEY'];

    if (!securityApiKey) {
      /**
       * @section Reporte de Anomalía de Infraestructura
       * Si la llave falta, el Sentinel bloquea la ignición del driver.
       */
      OmnisyncSentinel.report({
        errorCode: 'OS-INTEG-401',
        severity: 'CRITICAL',
        apparatus: 'GoogleGeminiDriver',
        operation: 'constructor_ignition',
        message: 'integrations.google_gemini.errors.missing_api_key',
      });
      throw new Error('OS-INTEG-401: Google AI API Key is missing in environment.');
    }

    this.googleGenerativeAIClient = new GoogleGenerativeAI(securityApiKey);
    this.activeModelIdentifier = GoogleGeminiDriver.MODEL_MAP[modelAlias];
  }

  /**
   * @method generateResponse
   * @description Ejecuta la inferencia cognitiva basada en un prompt enriquecido.
   */
  public async generateResponse(
    inferencePrompt: string,
    modelConfiguration: IArtificialIntelligenceModelConfiguration,
    conversationHistoryContext: unknown[] = [],
  ): Promise<string> {
    const apparatusName = 'GoogleGeminiDriver';
    const operationName = 'generateResponse';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        try {
          const generativeModel: GenerativeModel =
            this.googleGenerativeAIClient.getGenerativeModel({
              model: this.activeModelIdentifier,
            });

          /**
           * @section Hidratación de Sesión (Short-Term Memory)
           * Iniciamos el chat inyectando el historial normalizado.
           */
          const chatSession = generativeModel.startChat({
            history: this.mapToGoogleSovereignHistory(conversationHistoryContext),
            generationConfig: {
              temperature: modelConfiguration.temperature,
              maxOutputTokens: modelConfiguration.maxTokens,
              topP: modelConfiguration.topP,
            },
          });

          const executionResult = await chatSession.sendMessage(inferencePrompt);
          
          OmnisyncTelemetry.verbose(apparatusName, 'inference_success', `Model: ${this.activeModelIdentifier}`);
          
          return executionResult.response.text();
        } catch (executionError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-001',
            severity: 'HIGH',
            apparatus: apparatusName,
            operation: operationName,
            message: 'integrations.google_gemini.errors.inference_failure',
            context: {
              model: this.activeModelIdentifier,
              error: String(executionError),
            },
            isRecoverable: true
          });
          throw executionError;
        }
      },
      { model: this.activeModelIdentifier }
    );
  }

  /**
   * @method calculateVectorEmbeddings
   * @description Genera coordenadas matemáticas para la memoria semántica (RAG).
   */
  public async calculateVectorEmbeddings(
    textualContent: string,
  ): Promise<number[]> {
    return await OmnisyncTelemetry.traceExecution(
      'GoogleGeminiDriver',
      'calculateVectorEmbeddings',
      async () => {
        const model = this.googleGenerativeAIClient.getGenerativeModel({
          model: GoogleGeminiDriver.MODEL_MAP.EMBEDDING,
        });
        const result = await model.embedContent(textualContent);
        return result.embedding.values;
      }
    );
  }

  /**
   * @method calculateTokens
   * @description Estimación heurística de tokens para control de presupuesto.
   */
  public calculateTokens(textualContent: string): number {
    // Proporción aproximada para modelos Gemini (1 token ~= 4 caracteres)
    return Math.ceil(textualContent.length / 4);
  }

  /**
   * @method mapToGoogleSovereignHistory
   * @private
   * @description Transforma el historial de Omnisync a la gramática de Google AI 
   * sin violar la Zero-Any Policy.
   */
  private mapToGoogleSovereignHistory(rawHistory: unknown[]): Content[] {
    const validatedHistory = rawHistory as readonly ISovereignConversationEntry[];

    return validatedHistory.map((entry) => {
      /**
       * @note Traducción de Roles
       * Omnisync 'assistant' mapea a Google 'model'.
       */
      const sovereignRole = entry.role === 'assistant' ? 'model' : 'user';
      
      return {
        role: sovereignRole,
        parts: [{ text: entry.content }] as Part[],
      };
    });
  }
}