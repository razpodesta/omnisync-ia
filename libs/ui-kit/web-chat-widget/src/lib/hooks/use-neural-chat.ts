/** libs/ui-kit/web-chat-widget/src/lib/hooks/use-neural-chat.ts */

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  INeuralIntent,
  INeuralFlowResult,
  TenantId,
  NeuralBridge,
} from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @interface IConversationMessage
 * @description Representación inmutable de un turno de diálogo en la interfaz.
 */
interface IConversationMessage {
  readonly role: 'user' | 'assistant';
  readonly content: string;
}

/**
 * @name useNeuralChat
 * @description Hook de aparato encargado de la gestión de estado, persistencia volátil local
 * y despacho de intenciones neurales hacia el Hub. Implementa protocolos de actualización
 * optimista y recuperación ante fallos de conectividad.
 *
 * @protocol OEDP-Level: Elite (i18n-Ready & Lint-Sanated)
 */
export const useNeuralChat = (tenantOrganizationIdentifier: TenantId) => {
  /**
   * @section Internacionalización
   * Recuperamos llaves del namespace 'widget' definido en la capa core-security.
   */
  const translations = useTranslations('widget');

  const [conversationStream, setConversationStream] = useState<IConversationMessage[]>([]);
  const [isProcessingNeuralInference, setIsProcessingNeuralInference] = useState<boolean>(false);

  /**
   * @method dispatchNeuralInquiry
   * @description Procesa la consulta del usuario, ejecuta la actualización optimista de la UI
   * y orquesta la petición al NeuralBridge.
   *
   * @param {string} userInquiryContent - Contenido textual de la consulta.
   */
  const dispatchNeuralInquiry = useCallback(async (userInquiryContent: string): Promise<void> => {
    const apparatusName = 'useNeuralChat';
    const operationName = 'dispatchNeuralInquiry';

    if (!userInquiryContent.trim() || isProcessingNeuralInference) {
      return;
    }

    // 1. Actualización Optimista (UI Responsiveness)
    setConversationStream((previousStream) => [
      ...previousStream,
      { role: 'user', content: userInquiryContent.trim() }
    ]);

    setIsProcessingNeuralInference(true);

    try {
      /**
       * @section Transmisión Neural
       * Se despacha la intención bajo el contrato SSOT V2.0.
       */
      const neuralFlowResult = await NeuralBridge.request<INeuralFlowResult>(
        '/v1/neural/chat',
        tenantOrganizationIdentifier,
        {
          id: window.crypto.randomUUID(),
          channel: 'WEB_CHAT',
          externalUserId: 'web_anonymous_session',
          tenantId: tenantOrganizationIdentifier,
          payload: {
            type: 'TEXT',
            content: userInquiryContent,
            metadata: {
              originUrl: window.location.href,
              userAgent: window.navigator.userAgent
            }
          },
          timestamp: new Date().toISOString()
        } as INeuralIntent
      );

      // 2. Sincronización de Respuesta Exitosa
      setConversationStream((previousStream) => [
        ...previousStream,
        {
          role: 'assistant',
          content: neuralFlowResult.finalMessage
        }
      ]);

    } catch (neuralCommunicationError: unknown) {
      /**
       * @section Gestión de Anomalías y Resiliencia
       * RESOLUCIÓN ESLINT: Se utiliza el error en telemetría para auditoría forense.
       */
      OmnisyncTelemetry.verbose(
        apparatusName,
        operationName,
        `Incapacidad de comunicación neural: ${String(neuralCommunicationError)}`
      );

      /**
       * @note Failsafe Internacionalizado
       * Se utiliza una llave de traducción en lugar de texto hardcodeado.
       * Llave sugerida en es.json: "widget.errors.system_offline"
       */
      setConversationStream((previousStream) => [
        ...previousStream,
        {
          role: 'assistant',
          content: translations('errors.system_offline')
        }
      ]);

    } finally {
      setIsProcessingNeuralInference(false);
    }
  }, [tenantOrganizationIdentifier, isProcessingNeuralInference, translations]);

  return {
    conversationMessages: conversationStream,
    isArtificialIntelligenceTyping: isProcessingNeuralInference,
    dispatchNeuralInquiry
  };
};
