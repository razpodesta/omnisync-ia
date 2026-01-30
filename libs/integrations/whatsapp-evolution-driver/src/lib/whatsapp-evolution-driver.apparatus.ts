/** libs/integrations/whatsapp-evolution-driver/src/lib/whatsapp-evolution-driver.apparatus.ts */

import { 
  IWhatsAppDriver, 
  INeuralIntent, 
  TenantId, 
  OmnisyncContracts,
  NeuralIntentSchema
} from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';

/** 
 * @section Sincronización de ADN Local 
 * RESOLUCIÓN LINT: Erradicación de 'any' mediante esquemas de red.
 */
import { 
  EvolutionWebhookPayloadSchema, 
  IEvolutionWebhookPayload,
  EvolutionDriverConfigSchema,
  IEvolutionDriverConfig
} from './schemas/whatsapp-evolution-driver.schema';

/**
 * @name WhatsappEvolutionDriver
 * @description Driver de infraestructura de alta disponibilidad para Evolution API. 
 * Orquesta la comunicación omnicanal permitiendo el envío de mensajes reactivos 
 * y el procesamiento multimodal de eventos. Implementa lógica de "Human Delay" 
 * para preservación de cuentas y validación de doble factor SSOT.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Omnichannel-Sovereignty V3.2)
 * @vision Ultra-Holística: Zero-Any & Anti-Ban-Behavior
 */
export class WhatsappEvolutionDriver implements IWhatsAppDriver {
  public readonly providerName = 'EVOLUTION_COMMUNITY' as const;
  private readonly config: IEvolutionDriverConfig;

  /**
   * @constructor
   * @description Sella la configuración de conexión bajo contrato de integridad.
   */
  constructor(instanceUrl: string, apiKey: string, instanceName: string) {
    this.config = OmnisyncContracts.validate(EvolutionDriverConfigSchema, {
      instanceUrl,
      apiKey,
      instanceName
    }, 'WhatsappEvolutionDriver:Ignition');
  }

  /**
   * @method sendMessage
   * @description Despacha un mensaje de texto reactivo con latencia simulada.
   */
  public async sendMessage(
    recipientPhoneNumber: string,
    textualContent: string,
  ): Promise<{ readonly messageId: string }> {
    const apparatusName = 'WhatsappEvolutionDriver';
    
    return await OmnisyncTelemetry.traceExecution(apparatusName, 'sendMessage', async () => {
      return await OmnisyncSentinel.executeWithResilience(async () => {
        const apiUrl = `${this.config.instanceUrl}/message/sendText/${this.config.instanceName}`;

        const networkResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.config.apiKey
          },
          body: JSON.stringify({
            number: recipientPhoneNumber,
            text: textualContent,
            /** 
             * @note Lógica de Comportamiento Humano 
             * Inyectamos delay para mitigar flags de automatización en WhatsApp.
             */
            delay: 1500, 
            linkPreview: true
          }),
        });

        if (!networkResponse.ok) {
          throw new Error(`EVOLUTION_API_ERROR: ${networkResponse.status}`);
        }

        const responseData = await networkResponse.json() as { key: { id: string } };
        return { messageId: responseData.key.id };
      }, apparatusName, 'dispatch_text');
    });
  }

  /**
   * @method sendTemplate
   * @description Implementación resiliente de plantillas. 
   * RESOLUCIÓN LINT: Uso de prefijo '_' para argumentos de contrato obligatorios no utilizados.
   */
  public async sendTemplate(
    _recipientPhoneNumber: string,
    _templateNameIdentifier: string,
    _languageCode: string,
  ): Promise<void> {
    OmnisyncTelemetry.verbose('WhatsappEvolutionDriver', 'sendTemplate', 
      'Nota: Evolution v2 mapea plantillas como mensajes enriquecidos. Ignorando acción directa.'
    );
  }

  /**
   * @method parseIncomingWebhook
   * @description Nodo traductor de tráfico Evolution a ADN Omnisync. 
   * Realiza un triaje de eventos y extrae el contenido semántico.
   */
  public parseIncomingWebhook(
    networkPayload: unknown,
    tenantId: TenantId,
  ): INeuralIntent[] {
    const apparatusName = 'WhatsappEvolutionDriver:Parser';

    return OmnisyncTelemetry.traceExecutionSync(apparatusName, 'parse', () => {
      /**
       * @section Fase 1: Aduana de Red (Zero-Any)
       * RESOLUCIÓN TS-ANY: Validamos el payload contra el esquema de Evolution.
       */
      const validatedWebhook: IEvolutionWebhookPayload = OmnisyncContracts.validate(
        EvolutionWebhookPayloadSchema,
        networkPayload,
        apparatusName
      );

      // 2. Triaje de Tipo de Evento (Solo procesamos altas de mensajes no-propios)
      if (validatedWebhook.event !== 'messages.upsert') return [];

      const messageData = validatedWebhook.data;
      if (!messageData || messageData.key.fromMe) return [];

      /**
       * @section Fase 3: Normalización a Contrato Neural
       */
      const extractedContent = messageData.message?.conversation || 
                               messageData.message?.extendedTextMessage?.text || 
                               '[NON_TEXT_MEDIA_DETECTED]';

      const intentPayload: unknown = {
        id: crypto.randomUUID(),
        channel: 'WHATSAPP',
        externalUserId: messageData.key.remoteJid.split('@')[0],
        tenantId: tenantId,
        payload: {
          type: 'TEXT',
          content: extractedContent,
          metadata: {
            pushName: messageData.pushName ?? 'Evolution User',
            instance: this.config.instanceName,
            platform: 'EVOLUTION_API_COMMUNITY_V2',
            originalMessageId: messageData.key.id
          }
        },
        timestamp: new Date().toISOString()
      };

      // 4. Sello de Integridad SSOT
      return [OmnisyncContracts.validate(NeuralIntentSchema, intentPayload, apparatusName)];
    });
  }
}