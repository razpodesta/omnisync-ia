/** libs/integrations/vector-engine/src/lib/schemas/vector-engine.schema.ts */

import { z } from 'zod';
import { IKnowledgeSemanticChunk, TenantId } from '@omnisync/core-contracts';

/**
 * @name VectorSearchConfigurationSchema
 * @description Define las leyes de búsqueda de capas cruzadas. 
 * Introduce filtros por intención e indicadores de densidad para la Fase 5.5.
 */
export const VectorSearchConfigurationSchema = z.object({
  /** Parámetros de Extensión */
  maximumChunksToRetrieve: z.number().int().min(1).max(15).default(5),
  similarityScoreThreshold: z.number().min(0).max(1).default(0.7),
  
  /** 
   * @section Filtros de Resonancia (Ojos de Mosca)
   * Permite al motor priorizar el ADN según el tipo de consulta.
   */
  filters: z.object({
    requiredIntent: z.enum(['PROCEDURAL', 'INFORMATIVE', 'REGULATORY', 'SPECIFICATION']).optional(),
    minimumTechnicalDensity: z.number().min(0).max(1).default(0),
    preferredLanguage: z.enum(['es', 'en', 'pt']).optional(),
  }).optional(),

  /** Factor de penalización para fragmentos fuera de intención */
  semanticPenaltyFactor: z.number().min(0).max(1).default(0.2),
}).readonly();

/** @type IVectorSearchConfiguration */
export type IVectorSearchConfiguration = z.infer<typeof VectorSearchConfigurationSchema>;

/**
 * @interface IVectorDatabaseAgnosticDriver
 * @description Interfaz de contrato con soporte para filtrado de metadatos profundos.
 */
export interface IVectorDatabaseAgnosticDriver {
  readonly providerName: string;
  
  executeSemanticSearch(
    queryVector: number[],
    tenantId: TenantId,
    limit: number,
    /** Inyección de filtros de metadatos para optimización k-NN */
    metadataFilters?: Record<string, unknown>
  ): Promise<IKnowledgeSemanticChunk[]>;

  upsertKnowledgeChunks(chunks: IKnowledgeSemanticChunk[]): Promise<void>;
}