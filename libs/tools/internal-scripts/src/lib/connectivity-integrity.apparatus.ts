/** libs/tools/internal-scripts/src/lib/connectivity-integrity.apparatus.ts */

import { OmnisyncDatabase } from '@omnisync-ecosystem/persistence';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @name ConnectivityIntegrity
 * @description Aparato especializado en la validación binaria (UP/DOWN) de los 
 * servicios Cloud. Genera un diagnóstico rápido de latencia para Supabase, Upstash y Qdrant.
 */
export class ConnectivityIntegrity {
  
  /**
   * @method validateEcossystemConnectivity
   * @description Ejecuta una sonda de red contra cada proveedor y retorna el estado de salud.
   */
  public static async validateEcossystemConnectivity(): Promise<unknown> {
    return await OmnisyncTelemetry.traceExecution('ConnectivityIntegrity', 'validate', async () => {
      const connectivityStatus = {
        timestamp: new Date().toISOString(),
        supabaseDatabase: await this.pingSupabase(),
        upstashMemory: await this.pingUpstash(),
        qdrantVectorEngine: await this.pingQdrant()
      };

      return connectivityStatus;
    });
  }

  private static async pingSupabase() {
    try {
      await OmnisyncDatabase.db.$queryRaw`SELECT 1`;
      return { status: 'OPERATIONAL', provider: 'Supabase Cloud' };
    } catch (error) {
      return { status: 'CRITICAL_FAILURE', provider: 'Supabase Cloud', detail: String(error) };
    }
  }

  private static async pingUpstash() {
    try {
      const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/ping`, {
        headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
      });
      return response.ok ? { status: 'OPERATIONAL' } : { status: 'NETWORK_FAILURE' };
    } catch (error) {
      return { status: 'CRITICAL_FAILURE' };
    }
  }

  private static async pingQdrant() {
    try {
      const response = await fetch(`${process.env.QDRANT_URL}/healthz`);
      return response.ok ? { status: 'OPERATIONAL' } : { status: 'OFFLINE' };
    } catch (error) {
      return { status: 'CRITICAL_FAILURE' };
    }
  }
}