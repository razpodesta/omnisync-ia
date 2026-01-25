/** libs/core/persistence/src/lib/memory.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';

/**
 * @name OmnisyncMemory
 * @description Aparato de persistencia volátil para hilos de conversación.
 * Conecta con Upstash Redis vía HTTPS para garantizar ejecución en entornos serverless.
 */
export class OmnisyncMemory {
  private static readonly BASE_URL = process.env.UPSTASH_REDIS_REST_URL;
  private static readonly TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  /**
   * @method pushHistory
   * @description Añade un nuevo mensaje al historial de la sesión (Derecha de la lista).
   */
  public static async pushHistory(sessionId: string, payload: unknown): Promise<void> {
    return await OmnisyncTelemetry.traceExecution(
      'OmnisyncMemory',
      'pushHistory',
      async () => {
        try {
          const command = ['RPUSH', `os:session:${sessionId}`, JSON.stringify(payload)];
          await this.executeRemote(command);
          
          OmnisyncTelemetry.verbose('OmnisyncMemory', 'push', `Memoria actualizada para: ${sessionId}`);
        } catch (error: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-CORE-003',
            severity: 'MEDIUM',
            apparatus: 'OmnisyncMemory',
            operation: 'pushHistory',
            message: 'Error de escritura en Upstash Cloud',
            context: { sessionId, error: String(error) }
          });
        }
      }
    );
  }

  /**
   * @method getHistory
   * @description Recupera los últimos mensajes para dar contexto a la IA.
   */
  public static async getHistory(sessionId: string, limit: number = 10): Promise<unknown[]> {
    try {
      // Obtenemos los últimos 'limit' elementos
      const response = await this.executeRemote(['LRANGE', `os:session:${sessionId}`, `-${limit}`, '-1']);
      const result = (response as { result: string[] }).result;
      
      return result ? result.map(item => JSON.parse(item)) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * @method executeRemote
   * @private
   */
  private static async executeRemote(command: string[]): Promise<unknown> {
    const response = await fetch(`${this.BASE_URL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(command)
    });

    if (!response.ok) throw new Error(`Upstash REST Failure: ${response.statusText}`);
    return await response.json();
  }
}