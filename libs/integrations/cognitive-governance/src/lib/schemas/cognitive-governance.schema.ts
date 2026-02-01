/** libs/integrations/cognitive-governance/src/lib/schemas/cognitive-governance.schema.ts */

import { z } from 'zod';
import { TenantIdSchema } from '@omnisync/core-contracts';

/**
 * @name CognitiveContextStatusSchema
 * @description Taxonomía de estados del ciclo de vida de una hebra de conciencia.
 */
export const CognitiveContextStatusSchema = z.enum([
  'DRAFT',      
  'STAGING',    
  'PRODUCTION', 
  'DEPRECATED'  
]);

/**
 * @name PromptVersionSchema
 * @description Contrato inmutable para una versión específica de la conciencia IA.
 */
export const PromptVersionSchema = z.object({
  identifier: z.string().uuid().optional(),
  versionTag: z.string().regex(/^v\d+\.\d+\.\d+(-[a-z]+)?$/),
  systemDirective: z.string().min(100),
  authorIdentifier: z.string().min(1),
  
  /** Métricas de Eficiencia (ROI) auditadas por el PromptOptimizer */
  metrics: z.object({
    estimatedTokenWeight: z.number().nonnegative(),
    costEfficiencyScore: z.number().min(0).max(100),
    recommendedModel: z.enum(['FLASH', 'PRO', 'DEEP_THINK']),
  }),

  /** ADN Metadata: Flags de comportamiento técnico */
  metadata: z.object({
    vocalSovereignty: z.boolean().default(true),
    isExperimental: z.boolean().default(false),
    modelSettingsOverride: z.record(z.string(), z.unknown()).optional(),
  }).readonly(),

  timestamp: z.string().datetime(),
}).readonly();

/**
 * @name ABTestConfigurationSchema
 * @description Leyes de reparto de tráfico determinista.
 */
export const ABTestConfigurationSchema = z.object({
  experimentName: z.string().min(5),
  trafficSplit: z.number().min(0).max(1).default(0.5), 
  targetMetric: z.enum(['SENTIMENT', 'LATENCY', 'TOKEN_ECONOMY']).default('SENTIMENT'),
  isActive: z.boolean().default(true),
}).readonly();

/**
 * @name CognitiveGovernanceContextSchema
 * @description Contrato global de Soberanía Cognitiva (SSOT).
 * Orquesta la visión 360 de la hebra activa y la experimental.
 */
export const CognitiveGovernanceContextSchema = z.object({
  tenantId: TenantIdSchema,
  contextName: z.string().min(3),
  status: CognitiveContextStatusSchema,
  
  /** Fuente de Verdad de Producción */
  activeVersion: PromptVersionSchema,
  
  /** Fuente de Verdad de Innovación (Carga Diferida) */
  experimentalVersion: PromptVersionSchema.optional(),
  
  abTesting: ABTestConfigurationSchema.optional(),
}).readonly();

export type ICognitiveContextStatus = z.infer<typeof CognitiveContextStatusSchema>;
export type IPromptVersion = z.infer<typeof PromptVersionSchema>;
export type IABTestConfiguration = z.infer<typeof ABTestConfigurationSchema>;
export type ICognitiveGovernanceContext = z.infer<typeof CognitiveGovernanceContextSchema>;