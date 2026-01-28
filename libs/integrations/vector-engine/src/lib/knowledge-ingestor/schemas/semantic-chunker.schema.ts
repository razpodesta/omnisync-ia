/** libs/integrations/vector-engine/src/lib/knowledge-ingestor/schemas/semantic-chunker.schema.ts */

import { z } from 'zod';

/**
 * @name SemanticChunkerConfigurationSchema
 * @description Define los parámetros técnicos para el motor de fragmentación.
 * Permite ajustar la granularidad del ADN vectorial según la naturaleza del manual.
 */
export const SemanticChunkerConfigurationSchema = z.object({
  /** Tamaño máximo de caracteres por fragmento */
  maximumChunkSize: z.number().int().min(100).max(5000).default(1000),
  /** Cantidad de caracteres que se solapan entre fragmentos para preservar contexto */
  overlapSize: z.number().int().min(0).max(1000).default(200),
  /** Indica si el algoritmo debe intentar no romper palabras a la mitad */
  enableSmartBoundaryDetection: z.boolean().default(true),
}).readonly();

/** @type ISemanticChunkerConfiguration */
export type ISemanticChunkerConfiguration = z.infer<typeof SemanticChunkerConfigurationSchema>;
