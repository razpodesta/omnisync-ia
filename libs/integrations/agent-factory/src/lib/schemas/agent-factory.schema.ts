/** libs/integrations/agent-factory/src/lib/schemas/agent-factory.schema.ts */

import { z } from 'zod';
import { ArtificialIntelligenceModelConfigurationSchema } from '@omnisync/core-contracts';

/**
 * @name NeuralAgentDefinitionSchema
 * @description ADN de un agente especializado. 
 * Define su propósito, restricciones y disparadores semánticos.
 */
export const NeuralAgentDefinitionSchema = z.object({
  agentId: z.string().uuid(),
  agentName: z.string().min(2),
  specialty: z.enum(['TECHNICAL_SUPPORT', 'SALES_EXPERT', 'BILLING_ADMIN', 'GENERIC_ASSISTANT']),
  systemPersona: z.string().min(100), // Exigimos densidad en la personalidad
  triggerKeywords: z.array(z.string()),
  modelConfiguration: ArtificialIntelligenceModelConfigurationSchema,
  isEnabled: z.boolean().default(true),
}).readonly();

/**
 * @name SwarmResolutionSchema
 * @description Resultado de la decisión del orquestador de agentes.
 */
export const SwarmResolutionSchema = z.object({
  resolvedAgentId: z.string().uuid(),
  confidenceScore: z.number().min(0).max(1),
  resolutionReason: z.string(),
}).readonly();

export type INeuralAgentDefinition = z.infer<typeof NeuralAgentDefinitionSchema>;
export type ISwarmResolution = z.infer<typeof SwarmResolutionSchema>;