/** libs/integrations/vector-engine/src/lib/vector-engine.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { 
  IKnowledgeChunk, 
  ISemanticSearchResult, 
  SemanticSearchResultSchema 
} from '@omnisync/core-contracts';

/**
 * @interface IVectorDatabaseDriver
 * @description Contrato estricto que debe cumplir cualquier proveedor de base de datos vectorial.
 */
export interface IVectorDatabaseDriver {
  readonly providerName: string;
  search(queryVector: number[], tenantId: string, limit: number): Promise<IKnowledgeChunk[]>;
  upsert(chunks: IKnowledgeChunk[]): Promise<void>;
}

/**
 * @name OmnisyncVectorEngine
 * @description Aparato agnóstico para la gestión de recuperación de conocimiento (RAG).
 * Coordina la búsqueda semántica delegando la ejecución técnica a drivers especializados.
 */
export class OmnisyncVectorEngine {
  /**
   * @method retrieveRelevantContext
   * @description Recupera fragmentos de manuales técnicos basados en la similitud vectorial.
   */
  public static async retrieveRelevantContext(
    driver: IVectorDatabaseDriver,
    queryVector: number[],
    tenantId: string,
    limit: number = 3
  ): Promise<ISemanticSearchResult> {
    return await OmnisyncTelemetry.traceExecution(
      'OmnisyncVectorEngine',
      `retrieve:${driver.providerName}`,
      async () => {
        try {
          const startTimeInMilliseconds: number = performance.now();

          // Ejecución delegada al driver con política de resiliencia
          const foundChunks: IKnowledgeChunk[] = await OmnisyncSentinel.executeWithResilience(
            () => driver.search(queryVector, tenantId, limit),
            'OmnisyncVectorEngine',
            `search:${driver.providerName}`
          );

          const durationInMilliseconds: number = performance.now() - startTimeInMilliseconds;

          // Normalización del resultado bajo contrato SSOT
          return SemanticSearchResultSchema.parse({
            chunks: foundChunks,
            score: foundChunks.length > 0 ? 0.92 : 0, // Score base para el MVP
            latencyInMilliseconds: durationInMilliseconds
          });
        } catch (error: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-601',
            severity: 'HIGH',
            apparatus: 'OmnisyncVectorEngine',
            operation: 'retrieve',
            message: 'Error crítico en la recuperación de contexto semántico',
            context: { tenantId, driver: driver.providerName }
          });
          throw error;
        }
      }
    );
  }
}