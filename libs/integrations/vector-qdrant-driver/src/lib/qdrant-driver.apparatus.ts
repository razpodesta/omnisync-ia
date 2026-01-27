/** libs/integrations/vector-qdrant-driver/src/lib/qdrant-driver.apparatus.ts */

import { z } from 'zod';
import {
  IKnowledgeSemanticChunk,
  KnowledgeSemanticChunkSchema,
  TenantId
} from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';

/**
 * @name QdrantConfigurationSchema
 * @description Valida la integridad de las credenciales del cluster en la nube.
 */
const QdrantConfigurationSchema = z.object({
  endpoint: z.string().url(),
  apiKey: z.string().min(1),
}).readonly();

type IQdrantConfiguration = z.infer<typeof QdrantConfigurationSchema>;

/**
 * @name QdrantDriver
 * @description Implementación técnica de élite para la interacción con Qdrant Vector Database.
 * Garantiza el aislamiento multitenant mediante colecciones dinámicas y blindaje de red.
 *
 * @protocol OEDP-Level: Elite (Full Sentinel Integration)
 */
export class QdrantDriver {
  /** Identificador técnico del motor */
  public readonly providerName: string = 'QDRANT_RUST_ENGINE_V1';
  private readonly technicalConfiguration: IQdrantConfiguration;

  /**
   * @constructor
   * @description Inicializa la configuración validando la soberanía del entorno.
   */
  constructor() {
    try {
      this.technicalConfiguration = QdrantConfigurationSchema.parse({
        endpoint: process.env['QDRANT_URL'],
        apiKey: process.env['QDRANT_API_KEY']
      });
    } catch (configurationError: unknown) {
      OmnisyncSentinel.report({
        errorCode: 'OS-INTEG-601',
        severity: 'CRITICAL',
        apparatus: 'QdrantDriver',
        operation: 'instantiation',
        message: 'integrations.qdrant.errors.missing_credentials',
        context: { error: String(configurationError) }
      });
      throw configurationError;
    }
  }

  /**
   * @method executeSemanticSearch
   * @description Ejecuta una búsqueda k-NN con protección de resiliencia ante fallos de nube.
   */
  public async executeSemanticSearch(
    queryVectorFields: number[],
    tenantOrganizationIdentifier: string,
    resultsLimit: number
  ): Promise<IKnowledgeSemanticChunk[]> {
    return await OmnisyncTelemetry.traceExecution(
      'QdrantDriver',
      'executeSemanticSearch',
      async () => {
        const collectionIdentifier = `omnisync_tenant_${tenantOrganizationIdentifier}`;

        return await OmnisyncSentinel.executeWithResilience(
          async () => {
            const searchResponse = await fetch(`${this.technicalConfiguration.endpoint}/collections/${collectionIdentifier}/points/search`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'api-key': this.technicalConfiguration.apiKey
              },
              body: JSON.stringify({
                vector: queryVectorFields,
                limit: resultsLimit,
                with_payload: true,
                with_score: true
              })
            });

            if (!searchResponse.ok) {
              throw new Error(`integrations.qdrant.errors.rest_failure_${searchResponse.status}`);
            }

            const rawDataFound = await searchResponse.json() as { result: unknown[] };

            return (rawDataFound.result || []).map((point: unknown) => {
              const typedPoint = point as { id: string, score: number, payload: Record<string, unknown> };

              return KnowledgeSemanticChunkSchema.parse({
                id: typedPoint.id,
                content: typedPoint.payload['content'],
                sourceName: typedPoint.payload['sourceName'],
                tenantId: tenantOrganizationIdentifier as TenantId,
                metadata: {
                  ...(typedPoint.payload['metadata'] as Record<string, unknown>),
                  score: typedPoint.score
                }
              });
            });
          },
          'QdrantDriver',
          'search_operation'
        );
      }
    );
  }

  /**
   * @method upsertKnowledgeChunks
   * @description Sincroniza y persiste vectores de ADN técnico en la nube.
   */
  public async upsertKnowledgeChunks(knowledgeChunks: IKnowledgeSemanticChunk[]): Promise<void> {
    if (knowledgeChunks.length === 0) return;

    return await OmnisyncTelemetry.traceExecution(
      'QdrantDriver',
      'upsertKnowledgeChunks',
      async () => {
        const tenantOrganizationIdentifier = knowledgeChunks[0].tenantId;
        const collectionIdentifier = `omnisync_tenant_${tenantOrganizationIdentifier}`;

        const pointsToSync = knowledgeChunks.map((chunk) => {
          const metadataRecord = chunk.metadata as Record<string, unknown>;
          const vectorCoordinates = metadataRecord['vectorCoordinates'] as number[];

          if (!vectorCoordinates) {
            throw new Error('integrations.qdrant.errors.missing_vector_coordinates');
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
        });

        await OmnisyncSentinel.executeWithResilience(
          async () => {
            const upsertResponse = await fetch(`${this.technicalConfiguration.endpoint}/collections/${collectionIdentifier}/points`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'api-key': this.technicalConfiguration.apiKey
              },
              body: JSON.stringify({ points: pointsToSync })
            });

            if (!upsertResponse.ok) {
              throw new Error(`integrations.qdrant.errors.upsert_failure_${upsertResponse.status}`);
            }
          },
          'QdrantDriver',
          'upsert_operation'
        );

        OmnisyncTelemetry.verbose('QdrantDriver', 'upsert', `integrations.qdrant.success.sync_count`, {
          count: pointsToSync.length
        });
      }
    );
  }
}
