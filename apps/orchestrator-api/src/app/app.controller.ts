/** apps/orchestrator-api/src/app/app.controller.ts */

import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { NeuralFlowOrchestrator } from './flow-orchestrator.apparatus';
import { INeuralIntent, INeuralFlowResult } from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @name AppController
 * @description Punto de entrada principal para el ecosistema de inteligencia neural.
 * Actúa como la puerta de enlace (Gateway) para procesar intenciones provenientes de 
 * canales omnicanales, garantizando la identificación del Tenant solicitante.
 */
@Controller('v1/neural')
export class AppController {
  
  /**
   * @endpoint ingestNeuralIntent
   * @description Recibe y procesa una intención neural desde el Widget Web o Gateways de mensajería.
   * Valida la presencia de la identidad de la organización antes de delegar la ejecución.
   * 
   * @param {INeuralIntent} incomingNeuralIntent - El payload estructurado con la consulta del usuario.
   * @param {string} tenantIdentifierHeader - Cabecera obligatoria que identifica a la organización.
   * @returns {Promise<INeuralFlowResult>} El resultado de la inferencia IA y acciones operativas.
   * @throws {UnauthorizedException} Si el identificador del Tenant no está presente en la petición.
   */
  @Post('chat')
  public async ingestNeuralIntent(
    @Body() incomingNeuralIntent: INeuralIntent,
    @Headers('x-omnisync-tenant') tenantIdentifierHeader: string
  ): Promise<INeuralFlowResult> {
    return await OmnisyncTelemetry.traceExecution(
      'AppController',
      'ingestNeuralIntent',
      async () => {
        
        // Validación de Soberanía: El sistema no procesa datos anónimos a nivel de infraestructura
        if (!tenantIdentifierHeader) {
          OmnisyncTelemetry.verbose('AppController', 'ingest', 'Acceso denegado: Cabecera x-omnisync-tenant ausente');
          throw new UnauthorizedException('OS-SEC-401: Identificador de organización requerido.');
        }

        // Delegación al Orquestador Neural para el procesamiento de lógica profunda
        return await NeuralFlowOrchestrator.processNeuralIntentMessage(incomingNeuralIntent);
      }
    );
  }
}