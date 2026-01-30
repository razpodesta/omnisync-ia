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
 * @description Driver de infraestructura de alta disponibilidad para el motor Qdrant (Rust).
 * Orquesta la búsqueda semántica y la sincronización de fragmentos de conocimiento, 
 * delegando la construcción de colecciones y el mapeo de ADN a aparatos especialistas.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Vector-Sovereignty V3.2)
 * @vision Ultra-Holística: Zero-Local & High-Performance-RAG
 */
export class QdrantDriver implements IVectorDatabaseAgnosticDriver {
  /** Identificador nominal para la fábrica de motores vectoriales */
  public readonly providerName = 'QDRANT_RUST_ENGINE_V3' as const;

  /** Configuración inmutable de conectividad validada en la ignición */
  private readonly technicalConfiguration: IQdrantConnectionConfiguration;

  constructor() {
    /**
     * @section Validación de Soberanía de Infraestructura
     * Aseguramos que los secretos de Qdrant Cloud estén presentes y sean válidos.
     */
    this.technicalConfiguration = OmnisyncContracts.validate(
      QdrantConnectionConfigurationSchema,
      {
        endpoint: process.env['QDRANT_URL'],
        apiKey: process.env['QDRANT_API_KEY'],
      },
      'QdrantDriver:Ignition',
    );
  }

  /**
   * @method executeSemanticSearch
   * @description Ejecuta una búsqueda k-NN en el espacio vectorial del Tenant.
   * Implementa un Failsafe ante colecciones no inicializadas retornando un set vacío.
   */
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
         * @section Ejecución con Blindaje de Resiliencia
         * El Sentinel aplica backoff exponencial si el cluster reporta sobrecarga.
         */
        return await OmnisyncSentinel.executeWithResilience(
          async () => {
            const searchEndpoint = `${this.technicalConfiguration.endpoint}/collections/${collectionAlias}/points/search`;

            const networkResponse = await fetch(searchEndpoint, {
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
            });

            // Manejo de estado 404 (Soberanía de Colección: Si no existe, no hay conocimiento)
            if (networkResponse.status === 404) {
              OmnisyncTelemetry.verbose(apparatusName, 'empty_knowledge', `La colección ${collectionAlias} no ha sido ingerida aún.`);
              return [];
            }

            if (!networkResponse.ok) {
              throw new Error(`OS-INTEG-QDRANT-HTTP: ${networkResponse.status}`);
            }

            const responseBody = (await networkResponse.json()) as {
              result: IQdrantInternalPoint[];
            };

            /**
             * @note Mapeo de ADN (SSOT)
             * Delegamos la transformación de puntos de Rust a Chunks Omnisync.
             */
            return responseBody.result.map((point) =>
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
      { tenantId: tenantOrganizationIdentifier }
    );
  }

  /**
   * @method upsertKnowledgeChunks
   * @description Sincroniza fragmentos enriquecidos con la nube de Qdrant.
   * Asegura atómicamente que la infraestructura del Tenant exista antes de la carga.
   */
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
        /**
         * 1. Fase de Preparación de Infraestructura
         * El especialista de colección asegura que el nodo vectorial esté activo.
         */
        const collectionAlias = await QdrantCollectionApparatus.ensureSovereignCollection(
          this.technicalConfiguration,
          tenantId,
        );

        /**
         * 2. Fase de Traducción de ADN
         * Convertimos el contrato Omnisync a la estructura física de Qdrant.
         */
        const pointsToIngest = knowledgeChunks.map((chunk) =>
          QdrantMapperApparatus.mapToQdrantPoint(chunk),
        );

        // 3. Persistencia Masiva (Batch Upsert)
        await OmnisyncSentinel.executeWithResilience(
          async () => {
            const upsertUrl = `${this.technicalConfiguration.endpoint}/collections/${collectionAlias}/points`;

            const res = await fetch(upsertUrl, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'api-key': this.technicalConfiguration.apiKey,
              },
              body: JSON.stringify({ points: pointsToIngest }),
            });

            if (!res.ok) throw new Error(`OS-INTEG-QDRANT-UPSERT: ${res.status}`);
          },
          apparatusName,
          `bulk_upsert:${collectionAlias}`,
        );

        OmnisyncTelemetry.verbose(apparatusName, 'ingestion_confirmed', `${pointsToIngest.length} vectores sincronizados.`);
      },
      { tenantId, pointsCount: knowledgeChunks.length }
    );
  }
}