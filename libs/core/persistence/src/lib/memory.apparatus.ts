/** libs/core/persistence/src/lib/memory.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncContracts } from '@omnisync/core-contracts';

/**
 * @section Sincronización de ADN Local
 */
import {
  MemoryInfrastructureConfigurationSchema,
  UpstashRestResponseSchema,
  IMemoryInfrastructureConfiguration
} from './schemas/memory.schema';

/**
 * @name OmnisyncMemory
 * @description Aparato de persistencia volátil para hilos de conversación.
 * Gestiona la memoria semántica temporal y estados de sesión conectando con
 * Upstash Redis mediante protocolo REST/HTTPS.
 *
 * @protocol OEDP-Level: Elite (Full Resilient & Traceable)
 */
export class OmnisyncMemory {
  /**
   * @private
   * @description Cache inmutable de configuración para optimizar el handshake REST.
   */
  private static validatedInfrastructureConfiguration: IMemoryInfrastructureConfiguration | null = null;

  /**
   * @method pushHistory
   * @description Registra un nuevo turno de diálogo en el historial de la sesión.
   *
   * @param {string} conversationSessionIdentifier - Identificador único de la sesión.
   * @param {unknown} messagePayloadContent - El ADN del mensaje a persistir.
   */
  public static async pushHistory(
    conversationSessionIdentifier: string,
    messagePayloadContent: unknown,
  ): Promise<void> {
    const apparatusName = 'OmnisyncMemory';
    const operationName = 'pushHistory';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        try {
          const redisCommandSequence = [
            'RPUSH',
            `os:session:${conversationSessionIdentifier}`,
            JSON.stringify(messagePayloadContent),
          ];

          await this.executeRemoteInfrastructureCommand(redisCommandSequence);

          OmnisyncTelemetry.verbose(
            apparatusName,
            'synchronization_success',
            'persistence.memory.sync_success',
            { conversationSessionIdentifier }
          );
        } catch (criticalWriteError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-CORE-003',
            severity: 'MEDIUM',
            apparatus: apparatusName,
            operation: operationName,
            message: 'persistence.memory.error.write_failure',
            context: {
              session: conversationSessionIdentifier,
              errorTrace: String(criticalWriteError)
            },
            isRecoverable: true
          });
        }
      },
      { session: conversationSessionIdentifier }
    );
  }

  /**
   * @method getHistory
   * @description Recupera los fragmentos de diálogo más recientes para hidratar el contexto de la IA.
   * NIVELACIÓN V2.1: Ahora incluye trazabilidad de ejecución y manejo de errores proactivo.
   *
   * @param {string} conversationSessionIdentifier - Identificador de la sesión.
   * @param {number} maximumMessageRetrievalLimit - Límite de mensajes (Ventana de memoria).
   * @returns {Promise<unknown[]>} Colección de mensajes válidos.
   */
  public static async getHistory(
    conversationSessionIdentifier: string,
    maximumMessageRetrievalLimit = 10,
  ): Promise<unknown[]> {
    const apparatusName = 'OmnisyncMemory';
    const operationName = 'getHistory';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        try {
          const rawInfrastructureResponse = await this.executeRemoteInfrastructureCommand([
            'LRANGE',
            `os:session:${conversationSessionIdentifier}`,
            `-${maximumMessageRetrievalLimit}`,
            '-1',
          ]);

          const validatedResult = rawInfrastructureResponse.result;

          if (!Array.isArray(validatedResult)) {
            return [];
          }

          /**
           * @section Higiene en Deserialización
           * Filtramos atómicamente cualquier fragmento que no sea JSON válido.
           */
          return validatedResult
            .map((serializedMessage: string) => {
              try {
                return JSON.parse(serializedMessage);
              } catch {
                return null;
              }
            })
            .filter((parsedMessage): parsedMessage is unknown => parsedMessage !== null);

        } catch (retrievalError: unknown) {
          /**
           * @section Resolución de Anomalía ESLint
           * El error se inyecta en la telemetría para auditoría sin romper el Failsafe.
           */
          OmnisyncTelemetry.verbose(
            apparatusName,
            operationName,
            'persistence.memory.error.retrieval_silent_fail',
            { errorDetail: String(retrievalError) }
          );

          return [];
        }
      },
      { session: conversationSessionIdentifier }
    );
  }

  /**
   * @method executeRemoteInfrastructureCommand
   * @private
   * @description Orquesta la transmisión HTTPS hacia Upstash con blindaje de resiliencia.
   */
  private static async executeRemoteInfrastructureCommand(
    commandSequence: string[],
  ): Promise<{ result: unknown }> {
    const apparatusName = 'OmnisyncMemory:REST';

    // 1. Hidratación de Soberanía de Configuración
    if (!this.validatedInfrastructureConfiguration) {
      this.validatedInfrastructureConfiguration = OmnisyncContracts.validate(
        MemoryInfrastructureConfigurationSchema,
        {
          upstashRedisRestUniversalResourceLocator: process.env['UPSTASH_REDIS_REST_URL'],
          upstashRedisRestAuthorizationToken: process.env['UPSTASH_REDIS_REST_TOKEN'],
        },
        apparatusName
      );
    }

    const { upstashRedisRestUniversalResourceLocator, upstashRedisRestAuthorizationToken } = this.validatedInfrastructureConfiguration;

    /**
     * @section Ejecución con Blindaje Sentinel
     * Se aplica el patrón Retry con Backoff Exponencial para mitigar latencias de red.
     */
    return await OmnisyncSentinel.executeWithResilience(
      async () => {
        const infrastructureHttpResponse = await fetch(
          upstashRedisRestUniversalResourceLocator,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${upstashRedisRestAuthorizationToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(commandSequence),
          }
        );

        if (!infrastructureHttpResponse.ok) {
          throw new Error(`UPSTASH_INFRA_ERROR: ${infrastructureHttpResponse.status}`);
        }

        const rawJsonResponse = await infrastructureHttpResponse.json();

        return OmnisyncContracts.validate(
          UpstashRestResponseSchema,
          rawJsonResponse,
          apparatusName
        );
      },
      apparatusName,
      'network_transmission'
    );
  }
}
