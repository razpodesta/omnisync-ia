/** apps/orchestrator-api/src/app/app.controller.ts */

import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
/**
 * @section Inyección de Tipos Soberanos
 * NIVELACIÓN TS1272: Se utiliza 'import type' para miembros que no emiten código en runtime,
 * cumpliendo con la ley de 'isolatedModules'.
 */
import type { INeuralIntent, INeuralFlowResult } from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

import { NeuralFlowOrchestrator } from './apparatus';

/**
 * @name AppController
 * @description Punto de entrada soberano para el ecosistema de inteligencia neural.
 *
 * @protocol OEDP-Level: Elite (TS-Isolated-Compliant)
 */
@Controller('v1/neural')
export class AppController {
  /**
   * @endpoint ingestNeuralIntent
   * @description Procesa intenciones neurales con validación de soberanía de cabeceras.
   */
  @Post('chat')
  public async ingestNeuralIntent(
    @Body() incomingNeuralIntent: INeuralIntent,
    @Headers('x-omnisync-tenant') tenantOrganizationIdentifier: string,
  ): Promise<INeuralFlowResult> {
    const apparatusName = 'AppController';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      'ingestNeuralIntent',
      async () => {
        if (!tenantOrganizationIdentifier) {
          throw new UnauthorizedException(
            'OS-SEC-401: Identificador de organización requerido.',
          );
        }

        return await NeuralFlowOrchestrator.processNeuralIntentMessage(
          incomingNeuralIntent,
        );
      },
    );
  }
}
