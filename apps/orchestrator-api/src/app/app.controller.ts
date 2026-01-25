/** apps/orchestrator-api/src/app/app.controller.ts */

import { Controller, Post, Body, Headers } from '@nestjs/common';
import { NeuralFlowOrchestrator } from './flow-orchestrator.apparatus';
import { INeuralIntent, INeuralFlowResult } from '@omnisync/core-contracts';

@Controller('v1/neural')
export class AppController {
  
  /**
   * @endpoint chat
   * @description Recibe intenciones desde el Widget o WhatsApp y devuelve la respuesta neural.
   */
  @Post('chat')
  async handleChat(
    @Body() intent: INeuralIntent,
    @Headers('x-omnisync-tenant') tenantHeader: string
  ): Promise<INeuralFlowResult> {
    // La validación del esquema Zod se realiza dentro del orquestador
    return await NeuralFlowOrchestrator.process(intent);
  }
}