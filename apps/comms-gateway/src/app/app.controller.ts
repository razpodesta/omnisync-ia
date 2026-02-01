/** apps/comms-gateway/src/app/app.controller.ts */

import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  Param, 
  Headers, 
  HttpCode, 
  HttpStatus, 
  BadRequestException 
} from '@nestjs/common';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { TenantIdSchema } from '@omnisync/core-contracts';
import { GatewayOrchestrator } from '@omnisync/omnichannel-orchestrator';

/**
 * @name WebhookGatewayController
 * @description Nodo maestro de ingesta perimetral. Orquesta la recepción de señales 
 * omnicanales (WhatsApp, Web, API) extrayendo el ADN de transporte y transformándolo 
 * en Intenciones Neurales enriquecidas. Implementa el triaje de metadatos de red 
 * para la observabilidad holística del HealthEngine.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Enriched-Signal-Ingestion V3.7.5)
 * @vision Ultra-Holística: Ingress-Sovereignty & Device-Fingerprinting
 */
@Controller('v1/ingest')
export class AppController {
  
  /**
   * @method verifyMetaWebhookSovereignty
   * @description Protocolo de Handshake oficial para Meta Cloud API.
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
      `Verificando soberanía de dominio para nodo: ${tenantId}`
    );

    const systemVerifyToken = process.env['META_WEBHOOK_VERIFY_TOKEN'];

    if (mode === 'subscribe' && token === systemVerifyToken) {
      return challenge;
    }

    return 'OS-SEC-403: UNAUTHORIZED_HANDSHAKE';
  }

  /**
   * @method receiveWhatsAppMetaTraffic
   * @description Ingesta multimodal desde Meta Cloud. Captura metadatos de 
   * plataforma para auditoría de latencia oficial.
   */
  @Post('whatsapp/meta/:tenantId')
  @HttpCode(HttpStatus.OK) 
  public async receiveWhatsAppMetaTraffic(
    @Body() networkPayload: unknown,
    @Param('tenantId') tenantId: string,
    @Headers() transportHeaders: Record<string, string>,
  ): Promise<void> {
    const apparatusName = 'WebhookGatewayController';
    const operationName = 'receiveWhatsAppMeta';

    const validatedTenantId = this.validateSovereignIdentity(tenantId);
    const enrichedMetadata = this.constructTransportMetadata(transportHeaders);

    await OmnisyncTelemetry.traceExecution(apparatusName, operationName, async () => {
      try {
        await GatewayOrchestrator.executeSovereignStandardization(
          { ...networkPayload as object, _transport: enrichedMetadata },
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
          context: { tenantId: validatedTenantId, error: String(criticalIngestionError), transport: enrichedMetadata },
          isRecoverable: true
        });
      }
    }, { tenantId: validatedTenantId, platform: enrichedMetadata.platform });
  }

  /**
   * @method receiveEvolutionTraffic
   * @description Ingesta desde Evolution API. Captura firmas de instancia 
   * para monitoreo de salud segmentado.
   */
  @Post('whatsapp/evolution/:tenantId')
  @HttpCode(HttpStatus.CREATED)
  public async receiveEvolutionTraffic(
    @Body() networkPayload: unknown,
    @Param('tenantId') tenantId: string,
    @Headers() transportHeaders: Record<string, string>,
  ): Promise<void> {
    const apparatusName = 'WebhookGatewayController';
    const operationName = 'receiveEvolution';

    const validatedTenantId = this.validateSovereignIdentity(tenantId);
    const enrichedMetadata = this.constructTransportMetadata(transportHeaders);

    await OmnisyncTelemetry.traceExecution(apparatusName, operationName, async () => {
      try {
        await GatewayOrchestrator.executeSovereignStandardization(
          { ...networkPayload as object, _transport: enrichedMetadata },
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
   * @description Ingesta desde el Widget Web. Extrae el ADN del navegador 
   * para optimizar la respuesta neural según capacidades de interfaz.
   */
  @Post('webchat/:tenantId')
  @HttpCode(HttpStatus.ACCEPTED)
  public async receiveWebChatInquiry(
    @Body() networkPayload: unknown,
    @Param('tenantId') tenantId: string,
    @Headers() transportHeaders: Record<string, string>,
  ): Promise<void> {
    const apparatusName = 'WebhookGatewayController';
    const operationName = 'receiveWebChat';
    
    const validatedTenantId = this.validateSovereignIdentity(tenantId);
    const enrichedMetadata = this.constructTransportMetadata(transportHeaders);

    await OmnisyncTelemetry.traceExecution(apparatusName, operationName, async () => {
      try {
        await GatewayOrchestrator.executeSovereignStandardization(
          { ...networkPayload as object, _transport: enrichedMetadata },
          'WEB_CHAT',
          validatedTenantId
        );
      } catch (webChatError: unknown) {
        await OmnisyncSentinel.report({
          errorCode: 'OS-INTEG-701',
          severity: 'MEDIUM',
          apparatus: apparatusName,
          operation: operationName,
          message: 'WEB_CHAT_INGESTION_FAILURE',
          context: { tenantId: validatedTenantId, error: String(webChatError) },
          isRecoverable: true
        });
      }
    });
  }

  /**
   * @method validateSovereignIdentity
   * @private
   */
  private validateSovereignIdentity(rawId: string) {
    try {
      return TenantIdSchema.parse(rawId);
    } catch {
      throw new BadRequestException('OS-SEC-400: Identificador de nodo organizacional inválido.');
    }
  }

  /**
   * @method constructTransportMetadata
   * @private
   * @description Especialista en la construcción de la huella digital de red.
   */
  private constructTransportMetadata(headers: Record<string, string>) {
    return {
      userAgent: headers['user-agent'] || 'unknown_agent',
      ipSource: headers['x-forwarded-for']?.split(',')[0] || headers['x-real-ip'] || 'unknown_ip',
      platform: headers['sec-ch-ua-platform'] || 'generic_platform',
      origin: headers['origin'] || headers['referer'] || 'direct_ingest',
      ingestedAt: new Date().toISOString()
    };
  }
}