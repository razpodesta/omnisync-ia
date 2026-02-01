/** libs/core/contracts/src/lib/schemas/cognitive-governance.schema.ts */

import { z } from 'zod';

/**
 * @name CognitiveContextTemplateSchema
 * @description Contrato maestro para la definición de la "Conciencia" del sistema.
 * Valida la densidad del prompt y su compatibilidad con los tiers de IA.
 */
export const CognitiveContextTemplateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(5).max(50).toUpperCase(),
  description: z.string().max(200).optional(),
  
  /** La directiva maestra que guía el comportamiento */
  systemDirective: z.string().min(100, {
    message: "Gobernanza: Una directiva de élite requiere al menos 100 caracteres de contexto."
  }),
  
  /** Configuración de Pruebas A/B */
  abTesting: z.object({
    isEnabled: z.boolean().default(false),
    variantWeight: z.number().min(0).max(1).default(0.5),
    alternativeDirective: z.string().optional(),
  }).optional(),

  /** Límites de Seguridad y Costo */
  constraints: z.object({
    maxResponseTokens: z.number().int().positive().default(2048),
    stopSequences: z.array(z.string()).default([]),
    enforceTone: z.enum(['PROFESSIONAL', 'ARCHITECTURAL', 'FRIENDLY', 'ACADEMIC']).default('PROFESSIONAL'),
  }),
}).readonly();

/**
 * @name TokenSimulationReportSchema
 * @description Contrato para el reporte de previsión de gastos.
 */
export const TokenSimulationReportSchema = z.object({
  promptTokens: z.number(),
  estimatedCostUsd: z.number(),
  efficiencyScore: z.number().min(0).max(100), // Cuán optimizado está el prompt
  remediationSuggestions: z.array(z.string()),
}).readonly();

export type ICognitiveContextTemplate = z.infer<typeof CognitiveContextTemplateSchema>;
export type ITokenSimulationReport = z.infer<typeof TokenSimulationReportSchema>;