/** libs/tools/internal-scripts/src/lib/configuration-specification.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';

/**
 * @name ConfigurationSpecification
 * @description Aparato de auditoría profunda. Extrae y valida la configuración
 * del entorno Cloud garantizando el acceso seguro a variables de entorno.
 *
 * @protocol OEDP-Level: Elite (Index-Signature Safe)
 */
export class ConfigurationSpecification {

  /**
   * @method extractGranularConfiguration
   * @description Recopila el ADN técnico de la infraestructura Cloud.
   */
  public static async extractGranularConfiguration(): Promise<unknown> {
    return await OmnisyncTelemetry.traceExecution(
      'ConfigurationSpecification',
      'extract',
      async () => {
        try {
          return {
            persistenceDatabase: {
              engine: 'PostgreSQL 15+ (Supabase)',
              pooling: 'Prisma Accelerated',
              schemaPath: 'libs/core/persistence/prisma/schema.prisma'
            },
            volatileMemory: await this.getUpstashMetrics(),
            vectorKnowledge: await this.getQdrantCollections()
          };
        } catch (error: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-CORE-002',
            severity: 'MEDIUM',
            apparatus: 'ConfigurationSpecification',
            operation: 'extract',
            message: 'tools.config.extraction_failed',
            context: { error: String(error) }
          });
          throw error;
        }
      }
    );
  }

  /**
   * @method getUpstashMetrics
   * @private
   * @description Acceso seguro mediante signatura de índice para evitar TS4111.
   */
  private static async getUpstashMetrics(): Promise<unknown> {
    const url = process.env['UPSTASH_REDIS_REST_URL'];
    const token = process.env['UPSTASH_REDIS_REST_TOKEN'];

    if (!url || !token) return { status: 'MISSING_CREDENTIALS' };

    const response = await fetch(`${url}/info`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const metrics = await response.json() as { result: unknown };
    return { provider: 'Upstash', verboseOutput: metrics.result };
  }

  /**
   * @method getQdrantCollections
   * @private
   */
  private static async getQdrantCollections(): Promise<unknown> {
    const url = process.env['QDRANT_URL'];
    const apiKey = process.env['QDRANT_API_KEY'] || '';

    if (!url) return { status: 'URL_NOT_CONFIGURED' };

    const response = await fetch(`${url}/collections`, {
      headers: { 'api-key': apiKey }
    });
    const data = await response.json() as { result: unknown };
    return { provider: 'Qdrant Cloud', existingCollections: data.result };
  }
}
