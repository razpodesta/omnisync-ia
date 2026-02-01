/** libs/integrations/agent-factory/src/lib/schemas/agent-factory.schema.ts */

import { z } from 'zod';
import { ArtificialIntelligenceModelConfigurationSchema } from '@omnisync/core-contracts';

export const NeuralAgentDefinitionSchema = z.object({
  agentId: z.string().uuid(),
  agentName: z.string().min(2),
  specialty: z.enum(['TECHNICAL_SUPPORT', 'SALES_EXPERT', 'BILLING_ADMIN', 'EMPATHY_CORE']),
  systemPersona: z.string().min(100),
  dispatchGovernance: z.object({
    sentimentThreshold: z.number().min(-1).max(1).default(0),
    costWeight: z.number().min(0).max(1).default(0.2),
    priorityLevel: z.number().int().min(1).max(5).default(3),
  }),
  modelConfiguration: ArtificialIntelligenceModelConfigurationSchema,
  isEnabled: z.boolean().default(true),
}).readonly();

export const SwarmResolutionSchema = z.object({
  resolvedAgentId: z.string().uuid(),
  fitnessScore: z.number().min(0).max(1),
  resolutionReason: z.string(),
  /** @section Trazabilidad Fase 5.5 */
  integrityHash: z.string().min(32), // Sello del registro en el momento del triaje
  dispatchMetadata: z.object({
    estimatedInputCost: z.number(),
    sentimentAdjustmentApplied: z.boolean(),
    isGenesisFallback: z.boolean().default(false)
  }),
}).readonly();

export type INeuralAgentDefinition = z.infer<typeof NeuralAgentDefinitionSchema>;
export type ISwarmResolution = z.infer<typeof SwarmResolutionSchema>;