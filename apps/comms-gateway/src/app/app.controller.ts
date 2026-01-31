/** apps/comms-gateway/src/app/app.controller.ts */

import { Controller, Get, Post, Body, Query, Param, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { TenantIdSchema } from '@omnisync/core-contracts';
import { GatewayOrchestrator } from '@omnisync/omnichannel-orchestrator';

/**
 * @name WebhookGatewayController
 * @description Punto de entrada soberano para el tráfico omnicanal. 
 * Orquesta la recepción de pulsos de red desde Meta Cloud API, Evolution API 
 * y Web Chat. Actúa como la aduana primaria que valida la identidad del nodo 
 * suscriptor y normaliza eventos amorfos en Intenciones Neurales inmutables.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Omnichannel-Ingestion V3.2.3)
 * @vision Ultra-Holística: Zero-Latency-Reception & Clean-Error-Handling
 */
@Controller('v1/ingest')
export class AppController {
  
  /**
   * @method verifyMetaWebhookSovereignty
   * @description Implementa el protocolo de verificación de Meta (Cloud API). 
   * Resuelve el 'hub.challenge' para validar la propiedad del dominio ante Meta.
   */
  @Get('whatsapp/meta/:tenantId')
  public verifyMetaWebhookSovereignty(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Param('tenantId') tenantId: string,
  ): string {
    const apparatusName = 'WebhookGatewayController';
    
    OmnisyncTelemetry.verbose(apparatusName, 'meta_handshake_attempt', 
      `Solicitud de verificación para el nodo: ${tenantId}`
    );

    const systemVerifyToken = process.env['META_WEBHOOK_VERIFY_TOKEN'];

    if (mode === 'subscribe' && token === systemVerifyToken) {
      OmnisyncTelemetry.verbose(apparatusName, 'meta_handshake_success', challenge);
      return challenge;
    }

    OmnisyncTelemetry.verbose(apparatusName, 'meta_handshake_failed', 'Token de verificación inválido.');
    return 'OS-SEC-403: UNAUTHORIZED_HANDSHAKE';
  }

  /**
   * @method receiveWhatsAppMetaTraffic
   * @description Capta los eventos de mensajes y multimedia de WhatsApp Oficial.
   * 
   * @endpoint POST /v1/ingest/whatsapp/meta/:tenantId
   */
  @Post('whatsapp/meta/:tenantId')
  @HttpCode(HttpStatus.OK) 
  public async receiveWhatsAppMetaTraffic(
    @Body() networkPayload: unknown,
    @Param('tenantId') tenantId: string,
  ): Promise<void> {
    const apparatusName = 'WebhookGatewayController';
    const operationName = 'receiveWhatsAppMeta';

    const validatedTenantId = this.validateSovereignIdentity(tenantId);

    await OmnisyncTelemetry.traceExecution(apparatusName, operationName, async () => {
      try {
        await GatewayOrchestrator.executeSovereignStandardization(
          networkPayload,
          'WHATSAPP',
          validatedTenantId
        );
      } catch (criticalIngestionError: unknown) {
        await OmnisyncSentinel.report({
          errorCode: 'OS-INTEG-500',
          severity: 'HIGH',
          apparatus: apparatusName,
          operation: operationName,
          message: 'FAILED_TO_STANDARDIZE_META_TRAFFIC',
          context: { tenantId: validatedTenantId, error: String(criticalIngestionError) },
          isRecoverable: true
        });
      }
    });
  }

  /**
   * @method receiveEvolutionTraffic
   * @description Nodo especializado para la integración con Evolution API.
   * 
   * @endpoint POST /v1/ingest/whatsapp/evolution/:tenantId
   */
  @Post('whatsapp/evolution/:tenantId')
  @HttpCode(HttpStatus.CREATED)
  public async receiveEvolutionTraffic(
    @Body() networkPayload: unknown,
    @Param('tenantId') tenantId: string,
  ): Promise<void> {
    const apparatusName = 'WebhookGatewayController';
    const operationName = 'receiveEvolution';

    const validatedTenantId = this.validateSovereignIdentity(tenantId);

    await OmnisyncTelemetry.traceExecution(apparatusName, operationName, async () => {
      try {
        await GatewayOrchestrator.executeSovereignStandardization(
          networkPayload,
          'WHATSAPP',
          validatedTenantId
        );
      } catch (criticalIngestionError: unknown) {
        await OmnisyncSentinel.report({
          errorCode: 'OS-INTEG-501',
          severity: 'MEDIUM',
          apparatus: apparatusName,
          operation: operationName,
          message: 'EVOLUTION_INGESTION_FAILURE',
          context: { tenantId: validatedTenantId, error: String(criticalIngestionError) },
          isRecoverable: true
        });
      }
    });
  }

  /**
   * @method receiveWebChatInquiry
   * @description Ingesta de consultas directas desde el Widget Web.
   * 
   * @endpoint POST /v1/ingest/webchat/:tenantId
   */
  @Post('webchat/:tenantId')
  @HttpCode(HttpStatus.ACCEPTED)
  public async receiveWebChatInquiry(
    @Body() networkPayload: unknown,
    @Param('tenantId') tenantId: string,
  ): Promise<void> {
    const apparatusName = 'WebhookGatewayController';
    const validatedTenantId = this.validateSovereignIdentity(tenantId);
    
    await OmnisyncTelemetry.traceExecution(apparatusName, 'receiveWebChat', async () => {
      await GatewayOrchestrator.executeSovereignStandardization(
        networkPayload,
        'WEB_CHAT',
        validatedTenantId
      );
    });
  }

  /**
   * @method validateSovereignIdentity
   * @private
   * @description Valida que el identificador de la URL cumpla con el ADN de TenantId.
   * RESOLUCIÓN LINT: Se omite la variable del catch para evitar 'unused-vars'.
   */
  private validateSovereignIdentity(rawId: string) {
    try {
      return TenantIdSchema.parse(rawId);
    } catch {
      throw new BadRequestException('OS-SEC-400: Identificador de nodo inválido.');
    }
  }
}