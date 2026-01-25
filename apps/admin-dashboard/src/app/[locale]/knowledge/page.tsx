/** apps/admin-dashboard/src/app/[locale]/knowledge/page.tsx (Nivelación Final) */

'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { NeuralBridge } from '@omnisync/core-contracts';
import { TenantId } from '@omnisync/core-contracts';

/**
 * @name KnowledgeAdminPage
 * @description Interfaz de alta gama para la inyección de ADN corporativo en el Vector Engine.
 */
export default function KnowledgeAdminPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('knowledge');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const handleIngest = async () => {
    if (!content || !title) return;
    setStatus('processing');

    try {
      await NeuralBridge.request('/v1/neural/ingest', 'current-tenant-id' as TenantId, {
        title,
        rawContent: content,
        category: 'TECHNICAL'
      });
      setStatus('success');
      setContent('');
      setTitle('');
    } catch (error) {
      console.error('Ingestion failed', error);
      setStatus('idle');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-24 px-8 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-muted">Knowledge Base</h2>
        <h1 className="text-5xl font-light tracking-tighter text-black dark:text-white italic">
          Mentes Artificiales, <span className="font-bold">Conocimiento Real.</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-12">
        <div className="space-y-6">
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="TÍTULO DEL MANUAL (EJ: SOPORTE V3)"
            className="w-full bg-transparent border-b border-border py-4 text-sm outline-none uppercase tracking-widest focus:border-black transition-colors"
          />
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-80 bg-neutral-50 dark:bg-neutral-900 border border-border p-8 text-sm leading-relaxed outline-none focus:ring-1 ring-black"
            placeholder="PEGA AQUÍ EL CONTENIDO TÉCNICO..."
          />
        </div>

        <footer className="flex justify-between items-center border-t border-border pt-12">
          <div className="text-[9px] uppercase tracking-[0.3em] font-bold opacity-30">
            {status === 'processing' ? 'Sincronizando con Qdrant Cloud...' : 'Listo para procesar'}
          </div>
          <button 
            onClick={handleIngest}
            disabled={status === 'processing'}
            className="bg-black text-white dark:bg-white dark:text-black px-12 py-4 text-[10px] font-bold uppercase tracking-widest hover:invert transition-all disabled:opacity-20"
          >
            {status === 'success' ? 'DOCUMENTO INDEXADO' : 'INYECTAR CONOCIMIENTO'}
          </button>
        </footer>
      </div>
    </div>
  );
}