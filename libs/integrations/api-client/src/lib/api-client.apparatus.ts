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
  INeuralEndpoint 
} from './schemas/api-client.schema';

/**
 * @name NeuralNexusClient
 * @description Aparato de despacho de alto nivel encargado de la orquestación de 
 * peticiones hacia la infraestructura neural. Actúa como el puente soberano 
 * entre la interfaz de usuario y el orquestador NestJS, garantizando que 
 * cada transacción cumpla con el ADN de validación institucional (SSOT).
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Sovereign-Client-Interface V3.2)
 * @vision Ultra-Holística: Zero-Any & Resilient-Dispatch
 */
export class NeuralNexusClient {
  /**
   * @method nexusApi
   * @description Punto de entrada unificado y tipado para la comunicación neural. 
   * Orquesta la validación previa del payload y registra la latencia de despacho.
   * 
   * @template TResponse - Interfaz esperada para el ADN de respuesta.
   * @param {string} targetEndpoint - Ruta autorizada del servicio (ej: '/v1/neural/chat').
   * @param {TenantId} tenantId - Sello de soberanía del nodo suscriptor.
   * @param {unknown} payloadData - Carga útil de la petición sin procesar.
   * @returns {Promise<TResponse>} Respuesta validada y tipada por el framework.
   */
  public static async nexusApi<TResponse>(
    targetEndpoint: string,
    tenantId: TenantId,
    payloadData?: unknown
  ): Promise<TResponse> {
    const apparatusName = 'NeuralNexusClient';
    const operationName = `dispatch:${targetEndpoint}`;

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        /**
         * @section Fase 1: Auditoría de ADN (Aduana de Red)
         * Validamos que la petición cumpla con el contrato de configuración API.
         */
        OmnisyncContracts.validate(
          ApiRequestConfigurationSchema, 
          { endpoint: targetEndpoint, payload: payloadData }, 
          apparatusName
        );

        OmnisyncTelemetry.verbose(
          apparatusName, 
          'ignition', 
          `Iniciando despacho neural hacia el nodo: ${targetEndpoint}`,
          { tenantId }
        );

        /**
         * @section Fase 2: Delegación al Transporte Resiliente
         * El NeuralBridge asume la responsabilidad del handshake físico y reintentos.
         */
        return await NeuralBridge.request<TResponse>(
          targetEndpoint as INeuralEndpoint,
          tenantId,
          payloadData
        );
      },
      { endpoint: targetEndpoint, tenantId }
    );
  }

  /**
   * @section Capacidades Especializadas (High-Level Proxies)
   * Métodos con responsabilidad única para simplificar el consumo en la capa UI.
   */

  /**
   * @method dispatchChatInference
   * @description Especialista en el envío de intenciones de diálogo neural. 
   * Automatiza la construcción de la carga útil de texto.
   */
  public static async dispatchChatInference(
    tenantId: TenantId, 
    content: string
  ): Promise<INeuralFlowResult> {
    return this.nexusApi<INeuralFlowResult>(
      '/v1/neural/chat', 
      tenantId, 
      { payload: { type: 'TEXT', content: content.trim() } }
    );
  }

  /**
   * @method ingestTechnicalKnowledge
   * @description Orquesta el envío de ADN técnico para el pipeline RAG.
   * Crucial para la fase de entrenamiento y actualización de manuales.
   */
  public static async ingestTechnicalKnowledge(
    tenantId: TenantId, 
    documentPayload: unknown
  ): Promise<void> {
    return this.nexusApi<void>(
      '/v1/neural/ingest', 
      tenantId, 
      documentPayload
    );
  }

  /**
   * @method checkSystemPulse
   * @description Consulta el estado de salud de la infraestructura desde el cliente.
   */
  public static async checkSystemPulse(tenantId: TenantId): Promise<unknown> {
    return this.nexusApi<unknown>('/v1/health/pulse', tenantId, {});
  }
}