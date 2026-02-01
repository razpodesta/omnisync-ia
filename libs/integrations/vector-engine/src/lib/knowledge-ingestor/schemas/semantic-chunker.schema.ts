/** libs/integrations/vector-engine/src/lib/knowledge-ingestor/schemas/semantic-chunker.schema.ts */

import { z } from 'zod';

/**
 * @name SemanticChunkerConfigurationSchema
 * @description Define las leyes de fragmentación dinámica para el motor RAG.
 * Implementa parámetros de escala basados en la densidad técnica del ADN.
 */
export const SemanticChunkerConfigurationSchema = z.object({
  /** Parámetros base para escalado dinámico */
  baseChunkSize: z.number().int().min(200).max(3000).default(1000),
  baseOverlapSize: z.number().int().min(50).max(1000).default(200),
  
  /** 
   * Sensibilidad al escalado (0.0 a 1.0). 
   * Define qué tanto afecta la densidad al tamaño del chunk. 
   */
  scalingSensitivity: z.number().min(0).max(1).default(0.8),
  
  /** Flags de Calidad */
  enableSmartBoundaryDetection: z.boolean().default(true),
  enforceMinimumChunkLength: z.number().default(50),
}).readonly();

export type ISemanticChunkerConfiguration = z.infer<typeof SemanticChunkerConfigurationSchema>;