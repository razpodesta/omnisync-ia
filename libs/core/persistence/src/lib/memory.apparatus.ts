/** libs/core/persistence/src/lib/memory.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';

/**
 * @name OmnisyncMemory
 * @description Aparato de persistencia volátil para hilos de conversación.
 * Gestiona la memoria semántica temporal y estados de sesión conectando con
 * Upstash Redis mediante protocolo REST/HTTPS, garantizando resiliencia
 * en entornos de ejecución Serverless y Edge.
 *
 * @protocol OEDP-Level: Elite
 */
export class OmnisyncMemory {
  /**
   * @section Configuración de Infraestructura
   * Acceso mediante signatura de índice para cumplir con la soberanía territorial de tipos.
   */
  private static readonly CLOUD_REST_URL = process.env['UPSTASH_REDIS_REST_URL'];
  private static readonly CLOUD_REST_TOKEN = process.env['UPSTASH_REDIS_REST_TOKEN'];

  /**
   * @method pushHistory
   * @description Registra un nuevo evento en el historial de la sesión (Derecha de la lista).
   *
   * @param {string} sessionId - Identificador único del hilo de conversación.
   * @param {unknown} messagePayload - Contenido del mensaje a persistir.
   */
  public static async pushHistory(sessionId: string, messagePayload: unknown): Promise<void> {
    return await OmnisyncTelemetry.traceExecution(
      'OmnisyncMemory',
      'pushHistory',
      async () => {
        try {
          const redisCommand = ['RPUSH', `os:session:${sessionId}`, JSON.stringify(messagePayload)];
          await this.executeRemoteCommand(redisCommand);

          OmnisyncTelemetry.verbose(
            'OmnisyncMemory',
            'push',
            `Memoria sincronizada para la sesión: ${sessionId}`
          );
        } catch (criticalError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-CORE-003',
            severity: 'MEDIUM',
            apparatus: 'OmnisyncMemory',
            operation: 'pushHistory',
            message: 'Fallo de escritura en el cluster de memoria Upstash.',
            context: { sessionId, error: String(criticalError) }
          });
        }
      }
    );
  }

  /**
   * @method getHistory
   * @description Recupera los últimos fragmentos de diálogo para hidratar el contexto de la IA.
   *
   * @param {string} sessionId - Identificador único de la sesión.
   * @param {number} messageLimit - Cantidad de mensajes a recuperar (Inferencia trivial removida).
   * @returns {Promise<unknown[]>} Array de mensajes históricos normalizados.
   */
  public static async getHistory(sessionId: string, messageLimit = 10): Promise<unknown[]> {
    try {
      // Recuperación mediante rango inverso para obtener los N mensajes más recientes
      const redisResponse = await this.executeRemoteCommand([
        'LRANGE',
        `os:session:${sessionId}`,
        `-${messageLimit}`,
        '-1'
      ]);

      const executionResult = (redisResponse as { result: string[] }).result;

      return executionResult ? executionResult.map((serializedItem) => JSON.parse(serializedItem)) : [];
    } catch {
      /**
       * @section Silencio Operativo
       * En caso de fallo en la recuperación de memoria, retornamos un estado vacío
       * para permitir que la conversación continúe sin contexto previo (Failsafe).
       */
      return [];
    }
  }

  /**
   * @method executeRemoteCommand
   * @private
   * @description Orquesta la transmisión HTTP hacia el endpoint de Upstash.
   * Valida la integridad de la infraestructura antes de la ejecución.
   */
  private static async executeRemoteCommand(command: string[]): Promise<unknown> {
    if (!this.CLOUD_REST_URL || !this.CLOUD_REST_TOKEN) {
      throw new Error('OS-CORE-003: Credenciales de Upstash Redis no localizadas en el entorno.');
    }

    const httpResponse = await fetch(this.CLOUD_REST_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.CLOUD_REST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(command)
    });

    if (!httpResponse.ok) {
      throw new Error(`Upstash REST Failure: ${httpResponse.status} ${httpResponse.statusText}`);
    }

    return await httpResponse.json();
  }
}
