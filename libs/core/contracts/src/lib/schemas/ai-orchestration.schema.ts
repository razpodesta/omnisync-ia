/** libs/core/contracts/src/lib/schemas/ai-orchestration.schema.ts */

import { z } from 'zod';

/**
 * @description Configuración universal para cualquier motor de IA.
 */
export const AIModelConfigSchema = z.object({
  modelName: z.string(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().positive().default(2048),
  topP: z.number().min(0).max(1).optional(),
}).readonly();

export type IAIModelConfig = z.infer<typeof AIModelConfigSchema>;

/**
 * @description Interfaz que debe cumplir cualquier Driver de IA (Gemini, GPT, etc).
 */
export interface IAIDriver {
  readonly providerName: string;
  generateResponse(prompt: string, config: IAIModelConfig): Promise<string>;
  calculateTokens(text: string): number;
}