/** libs/ui-kit/web-chat-widget/src/lib/hooks/use-neural-chat.ts */

import { useState } from 'react';
import { INeuralIntent, INeuralFlowResult, TenantId } from '@omnisync/core-contracts';

/**
 * @name useNeuralChat
 * @description Aparato de lógica reactiva para gestionar el flujo de conversación con el Neural Hub.
 * @param {TenantId} tenantId - Identificador único de la organización (Branded Type).
 */
export const useNeuralChat = (tenantId: TenantId) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (content: string) => {
    if (!content || isTyping) return;

    // 1. UI State: Optimistic update
    setMessages((prev) => [...prev, { role: 'user', content }]);
    setIsTyping(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/neural/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-omnisync-tenant': tenantId 
        },
        body: JSON.stringify({
          id: window.crypto.randomUUID(),
          channel: 'WEB_CHAT',
          externalUserId: 'anonymous_session', // Se puede nivelar con cookies/sessionStorage
          tenantId,
          payload: { type: 'TEXT', content },
          timestamp: new Date().toISOString()
        } as INeuralIntent)
      });

      const result: INeuralFlowResult = await response.json();
      setMessages((prev) => [...prev, { role: 'ai', content: result.finalMessage }]);
    } catch (error) {
      console.error('[NEURAL_ORCHESTRATOR_FAILURE]', error);
    } finally {
      setIsTyping(false);
    }
  };

  return { messages, isTyping, sendMessage };
};