/** apps/comms-gateway/src/app/app.service.ts */

import { Injectable } from '@nestjs/common';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { 
  INeuralIntent, 
  INeuralFlowResult, 
  NeuralBridge 
} from '@omnisync/core-contracts';

/**
 * @name GatewayDispatchService
 * @description Aparato de lógica encargado de la transmisión soberana de señales. 
 * Orquesta el relevo de intenciones neurales desde el borde (Edge) hacia el 
 * Hub de Inferencia. Implementa el patrón "Circuit Breaker" mediante el Sentinel 
 * para garantizar la entrega del mensaje en infraestructuras distribuidas.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Signal-Relay-Orchestration V3.2)
 * @vision Ultra-Holística: Zero-Loss-Ingestion & Resilient-Backpressure
 */
@Injectable()
export class AppService {
  
  /**
   * @method relayIntentToNeuralHub
   * @description Ejecuta el despacho del mensaje normalizado hacia el orquestador API. 
   * Aplica blindaje de telemetría para medir la latencia del "Salto de Red" (Hop).
   * 
   * @param {INeuralIntent} standardizedIntent - Intención validada por la aduana del Gateway.
   * @returns {Promise<INeuralFlowResult>} El resultado de la inferencia y acción ERP.
   */
  public async relayIntentToNeuralHub(
    standardizedIntent: INeuralIntent
  ): Promise<INeuralFlowResult> {
    const apparatusName = 'GatewayDispatchService';
    const operationName = 'relayIntentToNeuralHub';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        /**
         * @section Ejecución con Blindaje de Resiliencia (Standard 2026)
         * Si el Hub de Inferencia está en "Cold Start" o bajo mantenimiento, 
         * el Sentinel orquesta reintentos con backoff exponencial.
         */
        return await OmnisyncSentinel.executeWithResilience(
          async () => {
            /**
             * @note Transmisión vía NeuralBridge
             * Utilizamos el puente soberano que ya inyecta cabeceras de 
             * TenantId y Versión de Framework automáticamente.
             */
            const executionResult = await NeuralBridge.request<INeuralFlowResult>(
              '/v1/neural/chat',
              standardizedIntent.tenantId,
              standardizedIntent
            );

            OmnisyncTelemetry.verbose(
              apparatusName, 
              'relay_confirmed', 
              `Intención ${standardizedIntent.id} procesada por el Hub con éxito.`
            );

            return executionResult;
          },
          apparatusName,
          `dispatch_to_hub:${standardizedIntent.channel}`
        );
      },
      { 
        intentId: standardizedIntent.id, 
        tenantId: standardizedIntent.tenantId,
        channel: standardizedIntent.channel 
      }
    );
  }

  /**
   * @method getGatewayStatus
   * @description Provee metadatos de salud del nodo de entrada para el CloudHealthAuditor.
   */
  public getGatewayStatus(): Record<string, unknown> {
    return {
      status: 'OPERATIONAL',
      engine: 'OEDP-V3.2-ELITE',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage().heapUsed,
      nodeIdentifier: process.env['NODE_NAME'] || 'PRIMARY_GATEWAY'
    };
  }
}