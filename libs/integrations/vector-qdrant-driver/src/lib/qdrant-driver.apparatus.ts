/** libs/integrations/vector-qdrant-driver/src/lib/qdrant-driver.apparatus.ts */

import {
  IKnowledgeSemanticChunk,
  TenantId,
  OmnisyncContracts,
} from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { IVectorDatabaseAgnosticDriver } from '@omnisync/vector-engine';
import {
  QdrantConnectionConfigurationSchema,
  IQdrantConnectionConfiguration,
  IQdrantInternalPoint,
} from './schemas/qdrant-driver.schema';
import { QdrantMapperApparatus } from './apparatus/qdrant-mapper.apparatus';
import { QdrantCollectionApparatus } from './apparatus/qdrant-collection.apparatus';

/**
 * @name QdrantDriver
 * @description Driver de alta disponibilidad para Qdrant.
 * Nivelado: Libre de catches inútiles y atomizado mediante aparatos subordinados.
 *
 * @protocol OEDP-Level: Elite (Clean Orchestration)
 */
export class QdrantDriver implements IVectorDatabaseAgnosticDriver {
  public readonly providerName = 'QDRANT_RUST_ENGINE_V2';
  private readonly technicalConfiguration: IQdrantConnectionConfiguration;

  constructor() {
    this.technicalConfiguration = OmnisyncContracts.validate(
      QdrantConnectionConfigurationSchema,
      {
        endpoint: process.env['QDRANT_URL'],
        apiKey: process.env['QDRANT_API_KEY'],
      },
      'QdrantDriver:Init',
    );
  }

  public async executeSemanticSearch(
    queryVectorCoordinates: number[],
    tenantOrganizationIdentifier: TenantId,
    maximumResultsLimit: number,
  ): Promise<IKnowledgeSemanticChunk[]> {
    const apparatusName = 'QdrantDriver';
    const collectionAlias = QdrantCollectionApparatus.resolveAlias(
      tenantOrganizationIdentifier,
    );

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      'executeSemanticSearch',
      async () => {
        /**
         * NIVELACIÓN: Eliminación de 'no-useless-catch'.
         * Delegamos el control de excepciones directamente al sentinel.executeWithResilience.
         */
        return await OmnisyncSentinel.executeWithResilience(
          async () => {
            const response = await fetch(
              `${this.technicalConfiguration.endpoint}/collections/${collectionAlias}/points/search`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'api-key': this.technicalConfiguration.apiKey,
                },
                body: JSON.stringify({
                  vector: queryVectorCoordinates,
                  limit: maximumResultsLimit,
                  with_payload: true,
                  with_score: true,
                }),
              },
            );

            if (response.status === 404) return [];
            if (!response.ok) throw new Error(`QDRANT_HTTP_${response.status}`);

            const payload = (await response.json()) as {
              result: IQdrantInternalPoint[];
            };

            return payload.result.map((point) =>
              QdrantMapperApparatus.mapToOmnisyncChunk(
                point,
                tenantOrganizationIdentifier,
              ),
            );
          },
          apparatusName,
          `search:${collectionAlias}`,
        );
      },
    );
  }

  public async upsertKnowledgeChunks(
    knowledgeChunks: IKnowledgeSemanticChunk[],
  ): Promise<void> {
    if (knowledgeChunks.length === 0) return;

    const apparatusName = 'QdrantDriver';
    const tenantId = knowledgeChunks[0].tenantId;

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      'upsertKnowledgeChunks',
      async () => {
        // 1. Delegación de Infraestructura
        const collectionAlias =
          await QdrantCollectionApparatus.ensureSovereignCollection(
            this.technicalConfiguration,
            tenantId,
          );

        // 2. Delegación de Mapeo
        const points = knowledgeChunks.map((chunk) =>
          QdrantMapperApparatus.mapToQdrantPoint(chunk),
        );

        await OmnisyncSentinel.executeWithResilience(
          async () => {
            const res = await fetch(
              `${this.technicalConfiguration.endpoint}/collections/${collectionAlias}/points`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'api-key': this.technicalConfiguration.apiKey,
                },
                body: JSON.stringify({ points }),
              },
            );
            if (!res.ok) throw new Error(`UPSERT_FAIL_${res.status}`);
          },
          apparatusName,
          `upsert:${collectionAlias}`,
        );
      },
    );
  }
}
