/** libs/core/contracts/src/lib/neural-bridge.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @name NeuralBridge
 * @description Aparato de comunicación holística entre el Frontend y el Neural Hub en Render.
 */
export class NeuralBridge {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL;

  /**
   * @method request
   * @description Ejecuta una petición tipada al backend de Render.
   */
  public static async request<T>(
    endpoint: string, 
    tenantId: string, 
    payload: unknown
  ): Promise<T> {
    return await OmnisyncTelemetry.traceExecution(
      'NeuralBridge',
      `call:${endpoint}`,
      async () => {
        const response = await fetch(`${this.API_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-omnisync-tenant': tenantId,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`NEURAL_BRIDGE_FAILURE: ${response.statusText}`);
        }

        return await response.json() as T;
      }
    );
  }
}