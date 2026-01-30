/** libs/integrations/omnichannel-orchestrator/src/lib/gateway-orchestrator.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import {
  INeuralIntent,
  NeuralIntentSchema,
  TenantId,
  OmnisyncContracts,
  ChannelTypeSchema,
} from '@omnisync/core-contracts';

/**
 * @section Traductores Atómicos (Lego Pieces)
 */
import { WhatsAppTranslatorApparatus } from './translators/whatsapp-translator.apparatus';
import { WebChatTranslatorApparatus } from './translators/web-chat-translator.apparatus';

/**
 * @section Orquestación de Capas Superiores
 */
import { OmnichannelHistoryOrchestrator } from './persistence/apparatus/omnichannel-history.orchestrator';
import {
  IOmnichannelTranslator,
  IOmnichannelTranslationResult,
} from './schemas/omnichannel-translator.schema';

/**
 * @name GatewayOrchestrator
 * @description Nodo maestro de comunicaciones del ecosistema Omnisync-AI. 
 * Orquesta la transformación de tráfico de red heterogéneo en intenciones neurales 
 * inmutables. Implementa una arquitectura de despacho polimórfico y triaje 
 * lingüístico dinámico para garantizar la soberanía del mensaje y la 
 * persistencia forense sin afectar la latencia de respuesta.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Omnichannel-Gateway V3.2)
 * @vision Ultra-Holística: Zero-Latency-Normalization & Resilient-Persistence
 */
export class GatewayOrchestrator {
  /**
   * @private
   * @description Registro inmutable de traductores autorizados. 
   * Mapeo estricto con la taxonomía de ChannelType para despacho polimórfico.
   */
  private static readonly AUTHORIZED_TRANSLATOR_REGISTRY: Readonly<Record<string, IOmnichannelTranslator>> = {
    WHATSAPP: new WhatsAppTranslatorApparatus(),
    WEB_CHAT: new WebChatTranslatorApparatus(),
    /** 
     * @note Extensibilidad 2026
     * Los canales TELEGRAM y VOICE_CALL se añadirán tras la nivelación de sus drivers.
     */
  };

  /**
   * @method executeSovereignStandardization
   * @description Punto de entrada maestro. Transforma tráfico crudo en ADN neural. 
   * Ejecuta el pipeline de validación, traducción y activación de persistencia asíncrona.
   *
   * @param {unknown} rawNetworkPayload - Datos brutos (Webhook/Socket).
   * @param {string} channelIdentifier - Vector de origen (ej: 'WHATSAPP').
   * @param {TenantId} tenantId - Sello de soberanía del suscriptor.
   * @returns {Promise<INeuralIntent>} Intención normalizada bajo contrato SSOT.
   */
  public static async executeSovereignStandardization(
    rawNetworkPayload: unknown,
    channelIdentifier: string,
    tenantId: TenantId,
  ): Promise<INeuralIntent> {
    const apparatusName = 'GatewayOrchestrator';
    const operationName = 'executeSovereignStandardization';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        try {
          /**
           * @section 1. Resolución de Canal y Traductor
           */
          const validatedChannel = OmnisyncContracts.validate(
            ChannelTypeSchema,
            channelIdentifier.toUpperCase().trim(),
            `${apparatusName}:ChannelHandshake`
          );

          const translator = this.AUTHORIZED_TRANSLATOR_REGISTRY[validatedChannel];

          if (!translator) {
            throw new Error(`OS-INTEG-404: El traductor para [${validatedChannel}] no está provisionado.`);
          }

          /**
           * @section 2. Triaje Lingüístico y Normalización
           * Recuperamos el contexto de urgencia y delegamos la traducción al especialista.
           */
          const localizedUrgencyKeys = await this.resolveTenantUrgencyContext(tenantId);

          const translationResult: IOmnichannelTranslationResult = translator.translate(
            rawNetworkPayload,
            tenantId,
            localizedUrgencyKeys,
          );

          /**
           * @section 3. Consolidación de ADN (SSOT)
           * Sellamos la intención con marca de tiempo e ID único para trazabilidad biyectiva.
           */
          const finalizedNeuralIntent: INeuralIntent = OmnisyncContracts.validate(
            NeuralIntentSchema,
            {
              ...translationResult,
              id: crypto.randomUUID(),
              tenantId: tenantId,
              timestamp: new Date().toISOString(),
            },
            `${apparatusName}:FinalSeal`
          );

          /**
           * @section 4. Persistencia Forense No-Bloqueante
           * Disparamos el volcado a la persistencia dual sin añadir latencia a la IA.
           */
          this.triggerAsyncPersistenceSideEffects(finalizedNeuralIntent);

          OmnisyncTelemetry.verbose(
            apparatusName,
            'standardization_complete',
            `Mensaje [${finalizedNeuralIntent.id}] normalizado desde [${validatedChannel}].`
          );

          return finalizedNeuralIntent;
        } catch (criticalStandardizationError: unknown) {
          /**
           * @note Protocolo de Desastre
           * El Sentinel captura fallos de red o de esquema durante la estandarización.
           */
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-500',
            severity: 'HIGH',
            apparatus: apparatusName,
            operation: operationName,
            message: 'tools.orchestrator.standardization_failure',
            context: {
              targetChannel: channelIdentifier,
              tenantId: tenantId,
              errorDetail: String(criticalStandardizationError),
            },
            isRecoverable: true,
          });

          throw criticalStandardizationError;
        }
      },
      { channel: channelIdentifier, tenantId }
    );
  }

  /**
   * @method resolveTenantUrgencyContext
   * @private
   * @description Resuelve el diccionario de triaje lingüístico. 
   * Preparado para integración SQL con el TenantManager en la Fase 3.3.
   */
  private static async resolveTenantUrgencyContext(_tenantId: TenantId): Promise<string[]> {
    return [
      'urgente', 'emergencia', 'falla', 'error', 'ayuda', 'ahora',
      'inmediato', 'auxilio', 'roto', 'problema', 'crítico', 'caído'
    ];
  }

  /**
   * @method triggerAsyncPersistenceSideEffects
   * @private
   * @description Orquesta el registro de auditoría y memoria bajo el patrón "Fire and Forget".
   */
  private static triggerAsyncPersistenceSideEffects(intent: INeuralIntent): void {
    const apparatusName = 'GatewayOrchestrator:PersistencePipe';

    OmnichannelHistoryOrchestrator.synchronizeIntent(intent).catch(
      async (persistenceError: unknown) => {
        await OmnisyncSentinel.report({
          errorCode: 'OS-CORE-003',
          severity: 'MEDIUM',
          apparatus: apparatusName,
          operation: 'async_sync',
          message: 'tools.orchestrator.persistence_leak',
          context: { intentId: intent.id, error: String(persistenceError) },
          isRecoverable: true,
        });
      }
    );
  }
}