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
 * @section Traductores Atómicos
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
 * @description El Cerebro de Comunicaciones Omnicanal (v8.0).
 * Orquesta la transformación de tráfico de red heterogéneo en intenciones neurales
 * inmutables. Implementa una arquitectura de despacho polimórfico y triaje
 * lingüístico dinámico para garantizar la soberanía del mensaje.
 *
 * @protocol OEDP-Level: Elite (Zero-Any & Multimodal-Ready)
 */
export class GatewayOrchestrator {
  /**
   * @private
   * @description Registro inmutable de traductores autorizados.
   * RESOLUCIÓN TS2741: Mapeo uno a uno con la taxonomía de ChannelTypeSchema.
   */
  private static readonly AUTHORIZED_TRANSLATOR_REGISTRY: Record<
    string,
    IOmnichannelTranslator
  > = {
    WHATSAPP: new WhatsAppTranslatorApparatus(),
    WEB_CHAT: new WebChatTranslatorApparatus(),
  };

  /**
   * @method executeSovereignStandardization
   * @description Punto de entrada maestro. Transforma, valida y audita el tráfico omnicanal.
   *
   * @param {unknown} rawNetworkPayload - Datos brutos recibidos por el endpoint (Webhook/Socket).
   * @param {string} channelIdentifier - El vector de origen (ej: 'WHATSAPP').
   * @param {TenantId} tenantOrganizationIdentifier - Sello de soberanía del suscriptor.
   * @returns {Promise<INeuralIntent>} Intención normalizada y lista para el Neural Hub.
   */
  public static async executeSovereignStandardization(
    rawNetworkPayload: unknown,
    channelIdentifier: string,
    tenantOrganizationIdentifier: TenantId,
  ): Promise<INeuralIntent> {
    const apparatusName = 'GatewayOrchestrator';
    const operationName = 'executeSovereignStandardization';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        try {
          /**
           * @section 1. Validación de Soberanía de Frontera
           * Verificamos que el canal esté permitido en el contrato base del ecosistema.
           */
          const validatedChannel = OmnisyncContracts.validate(
            ChannelTypeSchema,
            channelIdentifier.toUpperCase().trim(),
            `${apparatusName}:ChannelValidation`,
          );

          const translator =
            this.AUTHORIZED_TRANSLATOR_REGISTRY[validatedChannel];

          if (!translator) {
            throw new Error(
              `OS-INTEG-404: El traductor para [${validatedChannel}] no está provisionado.`,
            );
          }

          /**
           * @section 2. Resolución de ADN Lingüístico (Triaje)
           * Recuperamos las llaves de urgencia específicas para el Tenant.
           */
          const localizedUrgencyKeys = await this.resolveTenantUrgencyContext(
            tenantOrganizationIdentifier,
          );

          /**
           * @section 3. Ejecución de Traducción Polimórfica
           * El traductor asume la responsabilidad de normalizar según su protocolo (Meta, Web, etc).
           */
          const translationResult: IOmnichannelTranslationResult =
            translator.translate(
              rawNetworkPayload,
              tenantOrganizationIdentifier,
              localizedUrgencyKeys,
            );

          /**
           * @section 4. Consolidación de Intención Neural (SSOT)
           * Sellamos el ADN del mensaje con un identificador único y marca de tiempo.
           */
          const finalizedNeuralIntent: INeuralIntent = NeuralIntentSchema.parse(
            {
              ...translationResult,
              id: crypto.randomUUID(),
              tenantId: tenantOrganizationIdentifier,
              timestamp: new Date().toISOString(),
            },
          );

          /**
           * @section 5. Sincronización Forense Asíncrona (Non-Blocking)
           * Disparamos el volcado a la persistencia dual sin afectar la latencia de respuesta.
           */
          this.executePersistenceSideEffects(finalizedNeuralIntent);

          OmnisyncTelemetry.verbose(
            apparatusName,
            'standardization_complete',
            `Mensaje estandarizado [${finalizedNeuralIntent.id}] desde canal [${validatedChannel}].`,
          );

          return finalizedNeuralIntent;
        } catch (criticalStandardizationError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-500',
            severity: 'HIGH',
            apparatus: apparatusName,
            operation: operationName,
            message: 'integrations.omnichannel.standardization_failure',
            context: {
              targetChannel: channelIdentifier,
              tenantId: tenantOrganizationIdentifier,
              errorDetail: String(criticalStandardizationError),
            },
            isRecoverable: true,
          });

          throw criticalStandardizationError;
        }
      },
    );
  }

  /**
   * @method resolveTenantUrgencyContext
   * @private
   * @description Resuelve el contexto de triaje para el analista lingüístico.
   * NIVELACIÓN V3.0: Preparado para consumir desde el TenantManager.
   */
  private static async resolveTenantUrgencyContext(
    _tenantId: TenantId,
  ): Promise<string[]> {
    /**
     * @note Visión de Futuro
     * En la Fase 3.2, esto consultará la base de datos para obtener palabras clave
     * personalizadas por departamento (Soporte vs Ventas).
     */
    return [
      'urgente',
      'emergencia',
      'falla',
      'error',
      'ayuda',
      'ahora',
      'inmediato',
      'auxilio',
      'roto',
      'problema',
      'urgencia',
      'crítico',
      'no funciona',
      'caído',
    ];
  }

  /**
   * @method executePersistenceSideEffects
   * @private
   * @description Orquesta el registro de auditoría y memoria sin bloquear el flujo principal.
   */
  private static executePersistenceSideEffects(intent: INeuralIntent): void {
    const apparatusName = 'GatewayOrchestrator:SideEffects';

    OmnichannelHistoryOrchestrator.synchronizeIntent(intent).catch(
      async (persistenceError: unknown) => {
        // Si la persistencia falla, el canal sigue vivo, pero reportamos la brecha de auditoría.
        await OmnisyncSentinel.report({
          errorCode: 'OS-CORE-003',
          severity: 'MEDIUM',
          apparatus: apparatusName,
          operation: 'synchronize',
          message: 'integrations.omnichannel.persistence_failure',
          context: { intentId: intent.id, error: String(persistenceError) },
          isRecoverable: true,
        });
      },
    );
  }
}
