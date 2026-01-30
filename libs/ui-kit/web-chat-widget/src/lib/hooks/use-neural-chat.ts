/** libs/ui-kit/web-chat-widget/src/lib/hooks/use-neural-chat.ts */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  INeuralIntent,
  INeuralFlowResult,
  TenantId,
  NeuralBridge,
  OmnisyncContracts,
} from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { 
  DialogueMessageSchema, 
  IDialogueMessage 
} from '../schemas/web-chat-widget.schema';

/**
 * @interface IUseNeuralChat
 * @description Contrato de salida inmutable para el hook de orquestación visual.
 */
interface IUseNeuralChat {
  readonly neuralDialogueStream: readonly IDialogueMessage[];
  readonly isArtificialIntelligenceTyping: boolean;
  readonly operationalStatus: 'ONLINE' | 'OFFLINE';
  readonly dispatchNeuralInquiry: (userInquiryContent: string) => Promise<void>;
}

/**
 * @name useNeuralChat
 * @description Hook de grado industrial encargado de la gestión de estado, 
 * persistencia de identidad y despacho neural. Implementa el protocolo 
 * "Sovereign Fingerprinting" para vincular la sesión física del navegador 
 * con el contexto RAG en el orquestador.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Identity-Sovereignty V3.2)
 * @vision Ultra-Holística: Persistent-Dialogue & Zero-Placeholder
 */
export const useNeuralChat = (tenantId: TenantId): IUseNeuralChat => {
  const translations = useTranslations('widget');
  
  // Capas de Estado Reactivo
  const [neuralDialogueStream, setNeuralDialogueStream] = useState<IDialogueMessage[]>([]);
  const [isProcessingInference, setIsProcessingInference] = useState<boolean>(false);
  const [operationalStatus, setOperationalStatus] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');

  /**
   * @section Gestión de Identidad Soberana (Fingerprinting)
   * Erradica el uso de IDs temporales. La identidad persiste en el almacenamiento 
   * local del suscriptor para asegurar la continuidad de la memoria episódica.
   */
  const [sovereignFingerprint, setSovereignFingerprint] = useState<string>('');

  useEffect(() => {
    /**
     * @note Inicialización de Huella Digital
     * Recuperamos el ID persistente o generamos uno nuevo sellado por el Framework.
     */
    if (typeof window === 'undefined') return;

    const STORAGE_KEY = `os_identity_pulse_${tenantId}`;
    let fingerprint = localStorage.getItem(STORAGE_KEY);

    if (!fingerprint) {
      // Generación de UUID V4 de grado criptográfico
      fingerprint = `os_client_${crypto.randomUUID()}`;
      localStorage.setItem(STORAGE_KEY, fingerprint);
      
      OmnisyncTelemetry.verbose('useNeuralChat', 'identity_genesis', 
        'Nueva huella digital generada para el nodo.', { fingerprint }
      );
    }

    setSovereignFingerprint(fingerprint);
  }, [tenantId]);

  /**
   * @method dispatchNeuralInquiry
   * @description Orquesta la transmisión de la consulta técnica hacia el Neural Hub.
   * Implementa validación de contrato SSOT y triaje de respuesta.
   */
  const dispatchNeuralInquiry = useCallback(async (content: string): Promise<void> => {
    const apparatusName = 'useNeuralChat';
    const operationName = 'dispatchNeuralInquiry';

    const cleanContent = content.trim();
    
    // Guardianes de Ejecución
    if (!cleanContent || isProcessingInference || !sovereignFingerprint) return;

    return await OmnisyncTelemetry.traceExecution(apparatusName, operationName, async () => {
      // 1. Fase de Validación: ADN de Usuario
      const userMessage = OmnisyncContracts.validate(
        DialogueMessageSchema, 
        { role: 'user', content: cleanContent }, 
        `${apparatusName}:UserMessage`
      );

      setNeuralDialogueStream((prev) => [...prev, userMessage]);
      setIsProcessingInference(true);

      try {
        /**
         * @section Construcción de Intención Neural (Sovereign Dispatch)
         * Inyectamos la huella digital persistente como ID de usuario externo.
         */
        const neuralIntent: INeuralIntent = {
          id: crypto.randomUUID(),
          channel: 'WEB_CHAT',
          externalUserId: sovereignFingerprint, 
          tenantId: tenantId,
          payload: {
            type: 'TEXT',
            content: cleanContent,
            metadata: {
              originUrl: window.location.href,
              userAgent: navigator.userAgent,
              fingerprintVersion: 'V3.2-ELITE'
            }
          },
          timestamp: new Date().toISOString()
        };

        const result = await NeuralBridge.request<INeuralFlowResult>(
          '/v1/neural/chat',
          tenantId,
          neuralIntent
        );

        setOperationalStatus('ONLINE');

        // 2. Fase de Validación: ADN de Inteligencia Artificial
        const assistantResponse = OmnisyncContracts.validate(
          DialogueMessageSchema,
          { role: 'assistant', content: result.finalMessage },
          `${apparatusName}:AssistantResponse`
        );

        setNeuralDialogueStream((prev) => [...prev, assistantResponse]);

      } catch (error: unknown) {
        /**
         * @section Gestión de Fallo de Red (Failsafe)
         */
        setOperationalStatus('OFFLINE');
        
        OmnisyncTelemetry.verbose(apparatusName, 'transmission_error', String(error));

        setNeuralDialogueStream((prev) => [...prev, {
          role: 'assistant',
          content: translations('errors.system_offline')
        }]);
      } finally {
        setIsProcessingInference(false);
      }
    });
  }, [tenantId, isProcessingInference, translations, sovereignFingerprint]);

  return useMemo(() => ({
    neuralDialogueStream,
    isArtificialIntelligenceTyping: isProcessingInference,
    operationalStatus,
    dispatchNeuralInquiry
  }), [neuralDialogueStream, isProcessingInference, operationalStatus, dispatchNeuralInquiry]);
};