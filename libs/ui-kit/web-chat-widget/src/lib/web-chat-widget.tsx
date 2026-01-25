/** libs/ui-kit/web-chat-widget/src/lib/web-chat-widget.tsx */

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { TenantId } from '@omnisync/core-contracts';
import { useNeuralChat } from './hooks/use-neural-chat';

/**
 * @interface WebChatWidgetProps
 */
interface WebChatWidgetProps {
  /** Identificador de élite del suscriptor */
  readonly tenantId: TenantId;
}

/**
 * @name WebChatWidget
 * @description Interfaz neural omnicanal. Sigue los principios de Manus.io: 
 * Tipografía Inter, tracking amplio, bordes de 1px y paleta Obsidian (#000) & Milk (#FFF).
 */
export const WebChatWidget: React.FC<WebChatWidgetProps> = ({ tenantId }) => {
  const t = useTranslations('widget');
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { messages, isTyping, sendMessage } = useNeuralChat(tenantId);

  const handleSubmit = () => {
    sendMessage(inputValue);
    setInputValue('');
  };

  return (
    <div className="fixed bottom-12 right-12 z-50 flex flex-col items-end font-sans selection:bg-black selection:text-white">
      {isOpen && (
        <div className="w-[420px] h-[640px] bg-white dark:bg-black border border-border flex flex-col mb-6 shadow-[0_0_50px_-12px_rgba(0,0,0,0.12)] animate-in fade-in slide-in-from-bottom-6 duration-500">
          
          {/* Header Minimalista */}
          <div className="p-8 border-b border-border flex justify-between items-center bg-white dark:bg-black">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('header')}</span>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full animate-pulse" />
                <span className="text-[9px] uppercase tracking-widest opacity-40">System Active</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-xs hover:opacity-30 transition-opacity">CLOSE</button>
          </div>

          {/* Chat Stream */}
          <div className="flex-1 p-8 overflow-y-auto space-y-8 scrollbar-hide">
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center text-center p-12">
                <p className="text-xs leading-relaxed opacity-40 font-light italic">{t('welcome_message')}</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <span className="text-[8px] uppercase tracking-widest font-bold opacity-30">{msg.role}</span>
                <p className={`text-[13px] leading-relaxed max-w-[85%] ${msg.role === 'user' ? 'font-medium' : 'font-light'}`}>
                  {msg.content}
                </p>
              </div>
            ))}
            {isTyping && (
              <div className="text-[9px] uppercase tracking-[0.3em] animate-pulse opacity-40">{t('ai_typing')}</div>
            )}
          </div>

          {/* Neural Input Area */}
          <div className="p-8 border-t border-border">
            <div className="flex items-center gap-4">
              <input 
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder={t('input_placeholder')}
                className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-30 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
              />
              <button 
                onClick={handleSubmit}
                className="text-[10px] font-bold uppercase tracking-widest hover:line-through transition-all"
              >
                {t('send')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Obsidian Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group relative w-14 h-14 bg-black dark:bg-white flex items-center justify-center transition-all duration-500 hover:rotate-90"
      >
        <div className="w-4 h-[1px] bg-white dark:bg-black absolute" />
        <div className="w-[1px] h-4 bg-white dark:bg-black absolute" />
      </button>
    </div>
  );
};