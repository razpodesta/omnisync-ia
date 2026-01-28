/** apps/orchestrator-api/src/app/app.controller.ts */

import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { INeuralIntent, INeuralFlowResult } from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @section Importación de Aparatos Atomizados
 * Se utiliza el barril de la carpeta apparatus para mantener la limpieza semántica.
 */
import { NeuralFlowOrchestrator } from './apparatus';

/**
 * @name AppController
 * @description Punto de entrada soberano para el ecosistema de inteligencia neural.
 * Actúa como la puerta de enlace (Gateway) para procesar intenciones provenientes de
 * canales omnicanales, garantizando la identificación del Tenant solicitante.
 *
 * @protocol OEDP-Level: Elite (Path-Nivelated)
 */
@Controller('v1/neural')
export class AppController {

  /**
   * @endpoint ingestNeuralIntent
   * @description Recibe y procesa una intención neural desde el Widget Web o Gateways de mensajería.
   * Valida la presencia de la identidad de la organización antes de delegar la ejecución.
   *
   * @param {INeuralIntent} incomingNeuralIntent - El payload estructurado con la consulta del usuario.
   * @param {string} tenantOrganizationIdentifier - Cabecera obligatoria que identifica a la organización.
   * @returns {Promise<INeuralFlowResult>} El resultado de la inferencia IA y acciones operativas.
   * @throws {UnauthorizedException} Si el identificador del Tenant no está presente en la petición.
   */
  @Post('chat')
  public async ingestNeuralIntent(
    @Body() incomingNeuralIntent: INeuralIntent,
    @Headers('x-omnisync-tenant') tenantOrganizationIdentifier: string
  ): Promise<INeuralFlowResult> {
    const apparatusName = 'AppController';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      'ingestNeuralIntent',
      async () => {

        /**
         * @section Validación de Soberanía de Entrada
         * El sistema bloquea físicamente cualquier petición que no declare su nodo de origen.
         */
        if (!tenantOrganizationIdentifier) {
          OmnisyncTelemetry.verbose(apparatusName, 'security_alert', 'Acceso denegado: Cabecera x-omnisync-tenant ausente');
          throw new UnauthorizedException('OS-SEC-401: Identificador de organización requerido para la orquestación.');
        }

        /**
         * @section Delegación al Cerebro de Orquestación
         * Se invoca el método estático del NeuralFlowOrchestrator nivelado.
         */
        return await NeuralFlowOrchestrator.processNeuralIntentMessage(incomingNeuralIntent);
      }
    );
  }
}
