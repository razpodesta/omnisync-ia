/** libs/integrations/api-client/src/lib/api-client.apparatus.ts */

import { 
  NeuralBridge, 
  TenantId, 
  OmnisyncContracts,
  INeuralFlowResult 
} from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { 
  ApiRequestConfigurationSchema, 
  INeuralHubEndpoint,
  IHealthCheckDepth
} from './schemas/api-client.schema';

/**
 * @name NeuralNexusClient
 * @description Aparato de despacho perimetral encargado de orquestar la comunicación 
 * soberana entre la interfaz de usuario y el Neural Hub. Implementa la inyección 
 * de huellas digitales de dispositivo (Fingerprinting), gestión de timeouts 
 * específicos y auditoría de salud de infraestructura.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Sovereign-Nexus-Dispatcher V4.0)
 * @vision Ultra-Holística: Zero-Anonymous-Traffic & Real-time-Pulse-Sync
 */
export class NeuralNexusClient {
  /**
   * @method executeNexusRequest
   * @private
   * @description Motor interno de transmisión. Valida el ADN de la petición 
   * y enriquece la señal con metadatos de transporte forense.
   */
  private static async executeNexusRequest<TResponse>(
    endpoint: INeuralHubEndpoint,
    tenantId: TenantId,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST',
    payloadData?: unknown
  ): Promise<TResponse> {
    const apparatusName = 'NeuralNexusClient';
    const operationName = `dispatch:${endpoint}`;

    return await OmnisyncTelemetry.traceExecution(apparatusName, operationName, async () => {
      /**
       * @section 1. Aduana de Datos Atómica
       * Sincronizado con ApiRequestConfigurationSchema V4.0.
       */
      const requestConfiguration = OmnisyncContracts.validate(
        ApiRequestConfigurationSchema,
        {
          endpoint,
          method,
          payload: payloadData,
          timeoutInMilliseconds: endpoint === '/v1/health/pulse' ? 5000 : 15000
        },
        apparatusName
      );

      /**
       * @section 2. Enriquecimiento de Señal (Contextual Injection)
       */
      const transportMetadata = this.captureSovereignDeviceFingerprint();
      
      const enrichedPayload = {
        ...(requestConfiguration.payload as object),
        metadata: {
          ...requestConfiguration.payload?.metadata,
          _transport: transportMetadata,
          clientEngine: 'OEDP-V4.0-NEXUS'
        }
      };

      OmnisyncTelemetry.verbose(apparatusName, 'handshake_ignition', 
        `Iniciando señal hacia ${endpoint} | Trace: ${transportMetadata.traceIdentifier}`
      );

      /**
       * @section 3. Transmisión vía NeuralBridge
       */
      return await NeuralBridge.request<TResponse>(
        requestConfiguration.endpoint,
        tenantId,
        enrichedPayload,
        requestConfiguration.method
      );
    }, { tenantId, endpoint });
  }

  /**
   * @section Proxies de Ejecución Soberana
   */

  /**
   * @method getInfrastructurePulse
   * @description Realiza una sonda de signos vitales hacia el HealthEngine.
   * Permite la visualización de los 5 pilares en el Dashboard.
   */
  public static async getInfrastructurePulse(
    tenantId: TenantId,
    depth: IHealthCheckDepth = 'FULL_360'
  ): Promise<unknown> {
    return this.executeNexusRequest<unknown>(
      '/v1/health/pulse',
      tenantId,
      'POST',
      { checkDepth: depth }
    );
  }

  /**
   * @method dispatchChatInference
   * @description Orquesta el diálogo neural inyectando contexto de sesión.
   */
  public static async dispatchChatInference(
    tenantId: TenantId,
    textualContent: string,
    metadata: Record<string, unknown> = {}
  ): Promise<INeuralFlowResult> {
    return this.executeNexusRequest<INeuralFlowResult>(
      '/v1/neural/chat',
      tenantId,
      'POST',
      { content: textualContent, metadata }
    );
  }

  /**
   * @method ingestTechnicalKnowledge
   * @description Transmite ADN técnico al pipeline RAG del Vector Engine.
   */
  public static async ingestTechnicalKnowledge(
    tenantId: TenantId,
    content: string,
    title: string
  ): Promise<void> {
    return this.executeNexusRequest<void>(
      '/v1/neural/ingest',
      tenantId,
      'POST',
      { 
        content, 
        metadata: { documentTitle: title, ingestedAt: new Date().toISOString() } 
      }
    );
  }

  /**
   * @method captureSovereignDeviceFingerprint
   * @private
   * @description Captura de metadatos de entorno para trazabilidad biyectiva.
   */
  private static captureSovereignDeviceFingerprint() {
    const isServer = typeof window === 'undefined';

    return {
      traceIdentifier: `ntr_${crypto.randomUUID().substring(0, 8)}`,
      userAgent: isServer ? 'SSR_ENGINE' : navigator.userAgent,
      platform: isServer ? 'SERVER' : navigator.platform,
      language: isServer ? 'SYSTEM' : navigator.language,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * @section Exportación Funcional de Élite
 */
export const nexusApi = NeuralNexusClient;