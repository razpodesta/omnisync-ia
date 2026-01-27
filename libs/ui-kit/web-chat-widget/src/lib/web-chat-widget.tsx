/** libs/ui-kit/web-chat-widget/src/lib/web-chat-widget.tsx */

'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { TenantId } from '@omnisync/core-contracts';
import { useNeuralChat } from './hooks/use-neural-chat';

/**
 * @interface WebChatWidgetProperties
 * @description Definición de propiedades para la instancia del widget neural.
 */
interface WebChatWidgetProperties {
  /** Identificador de élite de la organización suscriptora */
  readonly tenantId: TenantId;
}

/**
 * @name WebChatWidget
 * @description Aparato de interfaz de usuario encargado de la interacción omnicanal. 
 * Implementa una estética de alta gama basada en los principios de Manus.io: 
 * paleta Obsidian & Milk, tipografía técnica, bordes de 1px y espaciado institucional.
 * 
 * @param {WebChatWidgetProperties} properties - Configuración del componente.
 * @returns {React.ReactNode} El nodo del widget renderizado.
 */
export const WebChatWidget: React.FC<WebChatWidgetProperties> = ({ tenantId }) => {
  /**
   * @section Internacionalización de Élite
   * Centraliza la comunicación lingüística a través del namespace 'widget'.
   */
  const translations = useTranslations('widget');
  
  const [isWidgetInterfaceOpen, setIsWidgetInterfaceOpen] = useState<boolean>(false);
  const [userTextInputValue, setUserTextInputValue] = useState<string>('');
  
  /** 
   * Consumo de lógica reactiva pura desde el Hook de Aparato.
   * Se extrae el stream de conversación y el estado de inferencia.
   */
  const { 
    conversationMessages, 
    isTyping: isArtificialIntelligenceProcessing, 
    sendNeuralMessage 
  } = useNeuralChat(tenantId);

  /**
   * @method handleMessageSubmission
   * @description Procesa el envío del mensaje y limpia el estado local del input.
   */
  const handleMessageSubmission = (): void => {
    if (!userTextInputValue.trim()) return;
    sendNeuralMessage(userTextInputValue);
    setUserTextInputValue('');
  };

  return (
    <div className="fixed bottom-12 right-12 z-50 flex flex-col items-end font-sans selection:bg-foreground selection:text-background transition-all duration-1000">
      
      {isWidgetInterfaceOpen && (
        <div className="w-[420px] h-[640px] bg-background dark:bg-background border border-border flex flex-col mb-6 shadow-[0_0_80px_-20px_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-bottom-6 duration-500 overflow-hidden">
          
          {/* Cabecera de Identidad: Status & Control */}
          <header className="p-8 border-b border-border flex justify-between items-center bg-background">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground">
                {translations('header')}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-foreground rounded-full animate-pulse opacity-100" />
                <span className="text-[9px] uppercase tracking-widest opacity-40 font-bold">
                  Soberanía Activa
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsWidgetInterfaceOpen(false)} 
              className="text-[9px] font-black uppercase tracking-widest hover:opacity-30 transition-opacity"
            >
              CLOSE
            </button>
          </header>

          {/* Flujo de Conversación Semántica */}
          <div className="flex-1 p-8 overflow-y-auto space-y-10 scrollbar-hide">
            {conversationMessages.length === 0 && (
              <div className="h-full flex items-center justify-center text-center p-12">
                <p className="text-[11px] leading-relaxed opacity-40 font-light italic uppercase tracking-widest">
                  {translations('welcome_message')}
                </p>
              </div>
            )}
            
            {conversationMessages.map((messageEntry, index) => (
              <div 
                key={index} 
                className={`flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-700 ${
                  messageEntry.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <span className="text-[8px] uppercase tracking-widest font-black opacity-20">
                  {messageEntry.role}
                </span>
                <p className={`text-[14px] leading-relaxed max-w-[90%] font-light ${
                  messageEntry.role === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {messageEntry.content}
                </p>
              </div>
            ))}

            {isArtificialIntelligenceProcessing && (
              <div className="text-[9px] uppercase tracking-[0.4em] animate-pulse opacity-40 font-black">
                {translations('ai_typing')}
              </div>
            )}
          </div>

          {/* Área de Entrada Neural: Manus.io Style */}
          <footer className="p-8 border-t border-border bg-neutral-50/50 dark:bg-neutral-900/20">
            <div className="flex items-center gap-6">
              <input 
                autoFocus
                value={userTextInputValue}
                onChange={(event) => setUserTextInputValue(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleMessageSubmission()}
                placeholder={translations('input_placeholder')}
                className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-20 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-[0.2em] font-light"
              />
              <button 
                onClick={handleMessageSubmission}
                className="text-[10px] font-black uppercase tracking-[0.2em] hover:line-through transition-all opacity-80 hover:opacity-100"
              >
                {translations('send')}
              </button>
            </div>
          </footer>
        </div>
      )}

      {/* Disparador de Élite (Obsidian Trigger) */}
      <button 
        onClick={() => setIsWidgetInterfaceOpen(!isWidgetInterfaceOpen)}
        className="group relative w-16 h-16 bg-foreground text-background flex items-center justify-center transition-all duration-700 hover:rotate-180 shadow-2xl active:scale-90"
        aria-label="Toggle Neural Interface"
      >
        <div className="w-5 h-[1px] bg-background absolute" />
        <div className="w-[1px] h-5 bg-background absolute" />
      </button>
    </div>
  );
};