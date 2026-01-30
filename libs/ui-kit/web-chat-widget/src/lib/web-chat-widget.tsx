/** libs/ui-kit/web-chat-widget/src/lib/web-chat-widget.tsx */

'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { TenantId, OmnisyncContracts } from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @section Sincronización de Lógica y Contratos
 * Importación de la lógica pura y el ADN estructural.
 */
import { useNeuralChat } from './hooks/use-neural-chat';
import {
  WebChatConfigurationSchema,
  IWebChatConfiguration,
  IDialogueMessage
} from './schemas/web-chat-widget.schema';

/**
 * @interface WebChatWidgetProperties
 * @description Contrato de entrada inmutable para el componente raíz.
 */
interface WebChatWidgetProperties {
  readonly tenantId: TenantId;
}

/**
 * @name WebChatWidget
 * @description Aparato de interfaz neural de alta gama. Orquesta la comunicación visual 
 * entre el usuario y la infraestructura RAG bajo el estándar Obsidian & Milk. 
 * Implementa scroll reactivo, triaje de estados de red y micro-animaciones cinéticas.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Visual-Sovereignty V3.2)
 * @vision Ultra-Holística: Responsive-Inference & Fluid-UX
 */
export const WebChatWidget: React.FC<WebChatWidgetProperties> = ({ tenantId }) => {
  const translations = useTranslations('widget');
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const chatScrollReference = useRef<HTMLDivElement>(null);

  /**
   * @section Hidratación de Configuración Sempiterna (SSOT)
   * Validamos los parámetros del widget garantizando que el diseño no sangre.
   */
  const configuration: IWebChatConfiguration = useMemo(() => {
    return OmnisyncContracts.validate(WebChatConfigurationSchema, {
      tenantId,
      initialAutoExpand: false,
      visualSovereignty: 'OBSIDIAN'
    }, 'WebChatWidget:Configuration');
  }, [tenantId]);

  /**
   * @section Orquestación de Lógica Neural
   * RESOLUCIÓN TS2339: Sincronización con el hook soberano useNeuralChat.
   */
  const {
    neuralDialogueStream,
    isArtificialIntelligenceTyping,
    dispatchNeuralInquiry,
    operationalStatus
  } = useNeuralChat(configuration.tenantId);

  /**
   * @method handleSubmission
   * @description Valida y despacha la consulta técnica al pipeline de inferencia.
   */
  const handleSubmission = useCallback(() => {
    const trimmedValue = inputValue.trim();
    
    // Bloqueo preventivo de red si el sistema está OFFLINE o procesando.
    if (!trimmedValue || isArtificialIntelligenceTyping || operationalStatus === 'OFFLINE') {
      return;
    }

    dispatchNeuralInquiry(trimmedValue);
    setInputValue('');
  }, [inputValue, dispatchNeuralInquiry, isArtificialIntelligenceTyping, operationalStatus]);

  /**
   * @section Efecto de Atención Focal (Auto-scroll)
   * Garantiza que la última inferencia sea siempre visible para el usuario.
   */
  useEffect(() => {
    if (chatScrollReference.current) {
      chatScrollReference.current.scrollTo({
        top: chatScrollReference.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [neuralDialogueStream, isArtificialIntelligenceTyping]);

  return OmnisyncTelemetry.traceExecutionSync('WebChatWidget', 'render', () => (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end font-sans selection:bg-foreground selection:text-background">

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98, filter: 'blur(15px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 30, scale: 0.98, filter: 'blur(15px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-[440px] h-[680px] bg-background border border-border flex flex-col mb-6 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] overflow-hidden"
          >
            {/* Header Institucional Obsidian & Milk */}
            <header className="p-8 border-b border-border flex justify-between items-center bg-background/90 backdrop-blur-xl z-20">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">{translations('header')}</span>
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${operationalStatus === 'ONLINE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest italic">
                    {operationalStatus === 'ONLINE' ? translations('status_active') : 'infrastructure_offline'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[9px] font-black uppercase tracking-[0.3em] hover:line-through transition-all"
              >
                {translations('close')}
              </button>
            </header>

            {/* Canvas de Diálogo Neural (RAG Context) */}
            <div
              ref={chatScrollReference}
              className="flex-1 p-10 overflow-y-auto space-y-12 bg-neutral-50/5 dark:bg-neutral-900/5 scroll-smooth scrollbar-hide"
            >
              {neuralDialogueStream.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="h-full flex items-center justify-center text-center px-12"
                >
                  <p className="text-[11px] leading-relaxed uppercase tracking-[0.6em] font-light opacity-20 italic">
                    {translations('welcome_message')}
                  </p>
                </motion.div>
              )}

              {/**
               * RESOLUCIÓN TS7006: Tipado estricto de los parámetros del iterador
               * para erradicar el 'any' implícito y garantizar soberanía de datos.
               */}
              {neuralDialogueStream.map((message: IDialogueMessage, index: number) => (
                <motion.div
                  key={`${index}-${message.role}`}
                  initial={{ opacity: 0, x: message.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex flex-col gap-4 ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[8px] font-black uppercase opacity-10 tracking-[0.4em]">
                    // {message.role === 'user' ? 'sovereign_identity' : 'neural_engine_v3'}
                  </span>
                  <div className={`
                    max-w-[85%] p-6 text-[14px] leading-relaxed font-light tracking-tight
                    ${message.role === 'user' 
                      ? 'bg-foreground text-background rounded-sm' 
                      : 'border-l-2 border-border pl-6 italic opacity-80'}
                  `}>
                    {message.content}
                  </div>
                </motion.div>
              ))}

              {isArtificialIntelligenceTyping && (
                <div className="flex gap-2 items-center pt-4">
                  <div className="w-1 h-1 bg-foreground animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1 h-1 bg-foreground animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1 h-1 bg-foreground animate-bounce" />
                  <span className="text-[9px] uppercase tracking-[0.6em] opacity-40 font-black italic ml-4">
                    {translations('ai_typing')}
                  </span>
                </div>
              )}
            </div>

            {/* Input de Inferencia Sincronizada */}
            <footer className="p-8 border-t border-border bg-background">
              <div className="flex items-center gap-6 group">
                <input
                  autoFocus
                  value={inputValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSubmission()}
                  placeholder={translations('input_placeholder')}
                  disabled={isArtificialIntelligenceTyping || operationalStatus === 'OFFLINE'}
                  className="flex-1 bg-transparent text-[13px] outline-none placeholder:opacity-10 font-light disabled:opacity-20 uppercase tracking-widest"
                />
                <button
                  onClick={handleSubmission}
                  disabled={isArtificialIntelligenceTyping || !inputValue.trim() || operationalStatus === 'OFFLINE'}
                  className="text-[10px] font-black uppercase tracking-[0.4em] hover:scale-110 transition-all disabled:opacity-0"
                >
                  {translations('send')}
                </button>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Atómico (The Neural Node) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-foreground text-background flex items-center justify-center shadow-2xl relative overflow-hidden focus:outline-none"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }} className="relative w-6 h-6 flex items-center justify-center">
              <div className="w-6 h-[1px] bg-background rotate-45 absolute" />
              <div className="w-6 h-[1px] bg-background -rotate-45 absolute" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex flex-col gap-1.5 items-end">
              <div className="w-7 h-[2px] bg-background" />
              <div className="w-4 h-[2px] bg-background" />
              <div className="w-6 h-[2px] bg-background" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  ));
};