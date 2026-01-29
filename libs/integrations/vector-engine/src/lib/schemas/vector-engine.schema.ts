/** libs/integrations/vector-engine/src/lib/schemas/vector-engine.schema.ts */

import { z } from 'zod';
import { IKnowledgeSemanticChunk, TenantId } from '@omnisync/core-contracts';

/**
 * @name VectorSearchConfigurationSchema
 * @description Define los parámetros de precisión para la recuperación de
 * conocimiento en el espacio vectorial.
 */
export const VectorSearchConfigurationSchema = z
  .object({
    /** Cantidad máxima de fragmentos a recuperar para el contexto de la IA */
    maximumChunksToRetrieve: z.number().int().min(1).max(15).default(3),
    /** Umbral de similitud de coseno (0.0 a 1.0) para filtrar ruido */
    similarityScoreThreshold: z.number().min(0).max(1).default(0.7),
  })
  .readonly();

export type IVectorSearchConfiguration = z.infer<
  typeof VectorSearchConfigurationSchema
>;

/**
 * @name IVectorDatabaseAgnosticDriver
 * @description Interfaz de contrato soberana para drivers vectoriales (ej: Qdrant, Pinecone).
 * Garantiza que el motor de búsqueda sea independiente de la implementación técnica.
 */
export interface IVectorDatabaseAgnosticDriver {
  readonly providerName: string;
  /**
   * @method executeSemanticSearch
   * @description Realiza una búsqueda k-NN basada en un vector de consulta.
   */
  executeSemanticSearch(
    queryVectorCoordinates: number[],
    tenantOrganizationIdentifier: TenantId,
    maximumResultsLimit: number,
  ): Promise<IKnowledgeSemanticChunk[]>;

  /**
   * @method upsertKnowledgeChunks
   * @description Sincroniza fragmentos de ADN técnico con la nube vectorial.
   */
  upsertKnowledgeChunks(
    knowledgeChunks: IKnowledgeSemanticChunk[],
  ): Promise<void>;
}
