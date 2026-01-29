/** libs/integrations/vector-qdrant-driver/src/lib/apparatus/qdrant-collection.apparatus.ts */

import { TenantId } from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { IQdrantConnectionConfiguration } from '../schemas/qdrant-driver.schema';

/**
 * @name QdrantCollectionApparatus
 * @description Aparato de gobernanza de infraestructura vectorial.
 * Gestiona el ciclo de vida de las colecciones bajo demanda.
 */
export class QdrantCollectionApparatus {
  private static readonly VECTOR_DIMENSIONS = 768;
  private static readonly DISTANCE_METRIC = 'Cosine';

  /**
   * @method ensureSovereignCollection
   * @description Verifica existencia y aprovisiona atómicamente si el nodo es nuevo.
   */
  public static async ensureSovereignCollection(
    config: IQdrantConnectionConfiguration,
    tenantOrganizationIdentifier: TenantId,
  ): Promise<string> {
    const collectionAlias = `os_tenant_${tenantOrganizationIdentifier.replace(/-/g, '_')}`;
    const apparatusName = 'QdrantCollectionApparatus';

    const checkResponse = await fetch(
      `${config.endpoint}/collections/${collectionAlias}`,
      {
        method: 'GET',
        headers: { 'api-key': config.apiKey },
      },
    );

    if (checkResponse.ok) return collectionAlias;

    OmnisyncTelemetry.verbose(
      apparatusName,
      'provisioning',
      `Creando infraestructura para el Tenant: ${tenantOrganizationIdentifier}`,
    );

    const createResponse = await fetch(
      `${config.endpoint}/collections/${collectionAlias}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.apiKey,
        },
        body: JSON.stringify({
          vectors: {
            size: this.VECTOR_DIMENSIONS,
            distance: this.DISTANCE_METRIC,
          },
        }),
      },
    );

    if (!createResponse.ok) {
      throw new Error(`OS-INFRA-COLLECTION-FAIL: ${createResponse.status}`);
    }

    return collectionAlias;
  }

  public static resolveAlias(tenantId: TenantId): string {
    return `os_tenant_${tenantId.replace(/-/g, '_')}`;
  }
}
