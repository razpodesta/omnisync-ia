/** libs/integrations/vector-qdrant-driver/src/lib/apparatus/qdrant-mapper.apparatus.ts */

import {
  IKnowledgeSemanticChunk,
  KnowledgeSemanticChunkSchema,
  TenantId
} from '@omnisync/core-contracts';
import { IQdrantInternalPoint } from '../schemas/qdrant-driver.schema';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @name QdrantMapperApparatus
 * @description Aparato encargado de la traducción entre el Dominio Qdrant y el ADN Omnisync.
 * Erradica la ambigüedad de tipos mediante mapeo determinista.
 */
export class QdrantMapperApparatus {

  /**
   * @method mapToOmnisyncChunk
   * @description Transforma un punto de Qdrant en un fragmento semántico validado.
   */
  public static mapToOmnisyncChunk(
    point: IQdrantInternalPoint,
    tenantOrganizationIdentifier: TenantId
  ): IKnowledgeSemanticChunk {
    return OmnisyncTelemetry.traceExecutionSync('QdrantMapper', 'mapToOmnisync', () => {
      return KnowledgeSemanticChunkSchema.parse({
        id: point.id,
        content: point.payload['content'],
        sourceName: point.payload['sourceName'],
        tenantId: tenantOrganizationIdentifier,
        metadata: {
          ...(point.payload['metadata'] as Record<string, unknown>),
          score: point.score
        }
      });
    });
  }

  /**
   * @method mapToQdrantPoint
   * @description Transforma un fragmento Omnisync en la gramática de inserción de Qdrant.
   */
  public static mapToQdrantPoint(chunk: IKnowledgeSemanticChunk): unknown {
    const vectorCoordinates = (chunk.metadata as Record<string, unknown>)['vectorCoordinates'];

    if (!Array.isArray(vectorCoordinates)) {
      throw new Error(`[MAPPER-FAIL]: The chunk [${chunk.id}] is missing its vector footprint.`);
    }

    return {
      id: chunk.id,
      vector: vectorCoordinates,
      payload: {
        content: chunk.content,
        sourceName: chunk.sourceName,
        metadata: chunk.metadata
      }
    };
  }
}
