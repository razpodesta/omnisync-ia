/** libs/core/contracts/src/lib/schemas/ai-orchestration.schema.ts */

import { z } from 'zod';

/**
 * @name ArtificialIntelligenceModelConfigurationSchema
 * @description Esquema de validación para la configuración universal de motores de IA.
 * Define los hiperparámetros de inferencia de forma agnóstica al proveedor.
 */
export const ArtificialIntelligenceModelConfigurationSchema = z.object({
  /** Nombre técnico del modelo (ej: 'gemini-1.5-flash') */
  modelName: z.string().min(1),
  
  /** Nivel de creatividad/aleatoriedad de la respuesta (0.0 a 2.0) */
  temperature: z.number().min(0).max(2).default(0.7),
  
  /** Límite máximo de tokens a generar en la respuesta */
  maxTokens: z.number().positive().default(2048),
  
  /** Nucleus sampling: filtra el top de probabilidad de tokens (0.0 a 1.0) */
  topP: z.number().min(0).max(1).optional(),
}).readonly();

/** 
 * @type IArtificialIntelligenceModelConfiguration
 * @description Representación tipada de la configuración del modelo de IA.
 */
export type IArtificialIntelligenceModelConfiguration = z.infer<typeof ArtificialIntelligenceModelConfigurationSchema>;

/**
 * @name IArtificialIntelligenceDriver
 * @description Interfaz de contrato que debe implementar cualquier Driver de IA 
 * (Gemini, OpenAI, Claude, etc.) para garantizar el agnosticismo del orquestador.
 */
export interface IArtificialIntelligenceDriver {
  /** Nombre comercial del proveedor (ej: 'GOOGLE_GEMINI') */
  readonly providerName: string;

  /**
   * @method generateResponse
   * @description Ejecuta la inferencia generativa basada en un prompt y configuración.
   */
  generateResponse(
    inferencePrompt: string, 
    modelConfiguration: IArtificialIntelligenceModelConfiguration
  ): Promise<string>;

  /**
   * @method calculateTokens
   * @description Realiza el conteo heurístico de tokens del texto proporcionado.
   */
  calculateTokens(textualContent: string): number;
}