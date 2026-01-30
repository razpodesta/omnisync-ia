/** libs/tools/internal-scripts/src/lib/configuration-specification.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { z } from 'zod';

/**
 * @section Contrato Estructural Interno
 * Define el ADN de la auditoría de configuración.
 */
const ConfigurationSpecificationSchema = z.object({
  relationalPersistence: z.object({
    engine: z.string(),
    status: z.enum(['CONFIGURED', 'MISSING_URL']),
    schemaPath: z.string(),
  }),
  volatileMemory: z.object({
    provider: z.string(),
    status: z.enum(['OPERATIONAL', 'MISSING_CREDENTIALS', 'CONNECTION_FAILURE']),
    metrics: z.unknown().optional(),
  }),
  vectorKnowledge: z.object({
    provider: z.string(),
    status: z.enum(['OPERATIONAL', 'MISSING_URL', 'UNAUTHORIZED', 'OFFLINE']),
    collectionCount: z.number().default(0),
  }),
}).readonly();

export type IConfigurationSpecification = z.infer<typeof ConfigurationSpecificationSchema>;

/**
 * @name ConfigurationSpecification
 * @description Aparato de auditoría profunda. Extrae y valida la configuración
 * del entorno Cloud garantizando el acceso seguro a variables de entorno.
 * Actúa como la aduana de pre-despliegue para el Neural Hub.
 *
 * @protocol OEDP-Level: Elite (Zero Any & Cloud-Resilient V2.5)
 */
export class ConfigurationSpecification {
  /**
   * @method extractGranularConfiguration
   * @description Recopila el ADN técnico de la infraestructura Cloud y valida su integridad.
   * @returns {Promise<IConfigurationSpecification>} Reporte de configuración validado.
   */
  public static async extractGranularConfiguration(): Promise<IConfigurationSpecification> {
    const apparatusName = 'ConfigurationSpecification';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      'extract',
      async () => {
        try {
          const reportBody = {
            relationalPersistence: {
              engine: 'PostgreSQL 15+ (Supabase)',
              status: process.env['DATABASE_URL'] ? 'CONFIGURED' : 'MISSING_URL',
              schemaPath: 'libs/core/persistence/prisma/schema.prisma',
            },
            volatileMemory: await this.getUpstashMetrics(),
            vectorKnowledge: await this.getQdrantCollections(),
          };

          /**
           * @section Sello de Integridad (SSOT)
           * Validamos que el reporte generado cumpla con el contrato estructural.
           */
          return ConfigurationSpecificationSchema.parse(reportBody);
        } catch (criticalError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-CORE-002',
            severity: 'HIGH',
            apparatus: apparatusName,
            operation: 'extract',
            message: 'tools.config.extraction_failed',
            context: { error: String(criticalError) },
            isRecoverable: true,
          });
          throw criticalError;
        }
      },
    );
  }

  /**
   * @method getUpstashMetrics
   * @private
   * @description Consulta la salud de Upstash Redis con protección de timeout.
   */
  private static async getUpstashMetrics(): Promise<IConfigurationSpecification['volatileMemory']> {
    const url = process.env['UPSTASH_REDIS_REST_URL'];
    const token = process.env['UPSTASH_REDIS_REST_TOKEN'];

    if (!url || !token) {
      return { provider: 'Upstash Redis', status: 'MISSING_CREDENTIALS' };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${url}/info`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });

      if (!response.ok) throw new Error('CONNECTION_FAILURE');

      const data = (await response.json()) as { result: unknown };
      return { 
        provider: 'Upstash Redis', 
        status: 'OPERATIONAL', 
        metrics: data.result 
      };
    } catch {
      return { provider: 'Upstash Redis', status: 'CONNECTION_FAILURE' };
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * @method getQdrantCollections
   * @private
   * @description Verifica la soberanía de acceso al motor de vectores Qdrant.
   */
  private static async getQdrantCollections(): Promise<IConfigurationSpecification['vectorKnowledge']> {
    const url = process.env['QDRANT_URL'];
    const apiKey = process.env['QDRANT_API_KEY'] || '';

    if (!url) {
      return { provider: 'Qdrant Cloud', status: 'MISSING_URL', collectionCount: 0 };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${url}/collections`, {
        headers: { 'api-key': apiKey },
        signal: controller.signal,
      });

      if (response.status === 401 || response.status === 403) {
        return { provider: 'Qdrant Cloud', status: 'UNAUTHORIZED', collectionCount: 0 };
      }

      if (!response.ok) throw new Error('OFFLINE');

      const data = (await response.json()) as { result: { collections: unknown[] } };
      return { 
        provider: 'Qdrant Cloud', 
        status: 'OPERATIONAL', 
        collectionCount: data.result?.collections?.length || 0 
      };
    } catch {
      return { provider: 'Qdrant Cloud', status: 'OFFLINE', collectionCount: 0 };
    } finally {
      clearTimeout(timeout);
    }
  }
}