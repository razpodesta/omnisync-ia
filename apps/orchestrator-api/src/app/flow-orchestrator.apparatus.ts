/** apps/admin-dashboard/src/app/[locale]/knowledge/page.tsx */

'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { NeuralBridge } from '@omnisync/core-contracts';
import { TenantId } from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @interface KnowledgeAdministrativePageProperties
 * @description Define la estructura de parámetros para la página de gestión de conocimiento.
 */
interface KnowledgeAdministrativePageProperties {
  readonly params: Promise<{ locale: string }>;
}

/**
 * @name KnowledgeAdministrativePage
 * @description Interfaz de alta gama diseñada bajo los principios de Manus.io. 
 * Permite a los administradores del Tenant inyectar manuales técnicos y comerciales 
 * en el motor de búsqueda semántica (RAG), asegurando que la IA posea el contexto 
 * operativo más actualizado.
 */
export default function KnowledgeAdministrativePage({
  params,
}: KnowledgeAdministrativePageProperties): JSX.Element {
  const translations = useTranslations('knowledge');
  
  // Estados de control con tipado estricto
  const [documentContent, setDocumentContent] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [operationStatus, setOperationStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILURE'>('IDLE');

  /**
   * @method handleKnowledgeIngestion
   * @description Orquesta el envío del documento al Neural Hub para su vectorización.
   */
  const handleKnowledgeIngestion = async (): Promise<void> => {
    if (!documentContent || !documentTitle) return;

    setOperationStatus('PROCESSING');

    try {
      // Nota: En fase de hidratación real, el TenantID se recupera de la sesión activa
      const currentTenantIdentifier = '00000000-0000-0000-0000-000000000000' as TenantId;

      await NeuralBridge.request('/v1/neural/ingest', currentTenantIdentifier, {
        documentTitle,
        documentRawContent: documentContent,
        documentCategory: 'TECHNICAL',
      });

      OmnisyncTelemetry.verbose('KnowledgeAdministrativePage', 'ingest', `Documento indexado: ${documentTitle}`);
      
      setOperationStatus('SUCCESS');
      setDocumentContent('');
      setDocumentTitle('');

      // Reset de estado tras éxito
      setTimeout(() => setOperationStatus('IDLE'), 3000);

    } catch (error: unknown) {
      console.error('[KNOWLEDGE_INGESTION_FAILURE]', error);
      setOperationStatus('FAILURE');
      setTimeout(() => setOperationStatus('IDLE'), 5000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-24 px-8 space-y-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* Cabecera de Identidad */}
      <header className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-neutral-400">
            {translations('section_label')}
          </span>
          <div className="h-[1px] w-12 bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <h1 className="text-6xl font-light tracking-tighter leading-tight text-black dark:text-white italic">
          Ingeniería de <span className="font-bold not-italic underline decoration-1 underline-offset-8">Contexto Semántico.</span>
        </h1>
      </header>

      {/* Editor de Ingesta Manus-Style */}
      <div className="grid grid-cols-1 gap-16">
        <section className="space-y-8 group">
          <div className="relative">
            <input 
              value={documentTitle}
              onChange={(event) => setDocumentTitle(event.target.value.toUpperCase())}
              placeholder={translations('title_placeholder')}
              className="w-full bg-transparent border-b border-border py-6 text-sm font-bold outline-none uppercase tracking-[0.2em] focus:border-black dark:focus:border-white transition-all duration-500 placeholder:opacity-20"
            />
            <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-black dark:bg-white group-focus-within:w-full transition-all duration-700" />
          </div>

          <textarea 
            value={documentContent}
            onChange={(event) => setDocumentContent(event.target.value)}
            className="w-full h-[450px] bg-neutral-50 dark:bg-neutral-900/30 border border-border p-10 text-[15px] leading-relaxed font-light outline-none focus:ring-1 ring-neutral-200 dark:ring-neutral-800 transition-all placeholder:opacity-20 scrollbar-hide"
            placeholder={translations('content_placeholder')}
          />
        </section>

        {/* Barra de Acciones y Estado */}
        <footer className="flex justify-between items-center border-t border-border pt-12">
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30">
              {operationStatus === 'PROCESSING' ? translations('status_syncing') : translations('status_ready')}
            </span>
            {operationStatus === 'SUCCESS' && (
              <span className="text-[9px] text-green-500 font-bold uppercase tracking-widest animate-pulse">
                ADN CORPORATIVO ACTUALIZADO
              </span>
            )}
          </div>

          <button 
            onClick={handleKnowledgeIngestion}
            disabled={operationStatus === 'PROCESSING' || !documentContent || !documentTitle}
            className="group relative overflow-hidden bg-black dark:bg-white text-white dark:text-black px-16 py-5 text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-10 disabled:grayscale"
          >
            <span className="relative z-10">
              {operationStatus === 'PROCESSING' ? '...' : translations('ingest_button')}
            </span>
          </button>
        </footer>
      </div>
    </div>
  );
}