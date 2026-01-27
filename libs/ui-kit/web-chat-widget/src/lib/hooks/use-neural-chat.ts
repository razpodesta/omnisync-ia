/** libs/ui-kit/web-chat-widget/src/lib/hooks/use-neural-chat.ts */

import { useState } from 'react';
import {
  INeuralIntent,
  INeuralFlowResult,
  TenantId,
  NeuralBridge
} from '@omnisync/core-contracts';

interface IConversationMessage {
  readonly role: 'user' | 'assistant';
  readonly content: string;
}

export const useNeuralChat = (tenantOrganizationIdentifier: TenantId) => {
  const [conversationStream, setConversationStream] = useState<IConversationMessage[]>([]);
  const [isProcessingInference, setIsProcessingInference] = useState<boolean>(false);

  const sendNeuralMessage = async (userMessageContent: string): Promise<void> => {
    if (!userMessageContent || isProcessingInference) return;

    setConversationStream((previousStream) => [
      ...previousStream,
      { role: 'user', content: userMessageContent }
    ]);

    setIsProcessingInference(true);

    try {
      const neuralFlowResult = await NeuralBridge.request<INeuralFlowResult>(
        '/v1/neural/chat',
        tenantOrganizationIdentifier,
        {
          id: window.crypto.randomUUID(),
          channel: 'WEB_CHAT',
          /**
           * CORRECCIÓN DE ELITE:
           * Se usa 'externalUserId' (Nombre exacto del esquema)
           * y se añade 'metadata' para cumplir con el contrato SSOT.
           */
          externalUserId: 'anonymous_cloud_session',
          tenantId: tenantOrganizationIdentifier,
          payload: {
            type: 'TEXT',
            content: userMessageContent,
            metadata: {} // Requerido por NeuralIntentSchema
          },
          timestamp: new Date().toISOString()
        } as INeuralIntent
      );

      setConversationStream((previousStream) => [
        ...previousStream,
        { role: 'assistant', content: neuralFlowResult.finalMessage }
      ]);

    } catch (communicationError: unknown) {
      console.error('[NEURAL_BRIDGE_ERROR]', communicationError);
      setConversationStream((previousStream) => [
        ...previousStream,
        { role: 'assistant', content: 'SISTEMA_TEMPORALMENTE_FUERA_DE_LINEA.' }
      ]);
    } finally {
      setIsProcessingInference(false);
    }
  };

  return {
    conversationMessages: conversationStream,
    isTyping: isProcessingInference,
    sendNeuralMessage
  };
};
