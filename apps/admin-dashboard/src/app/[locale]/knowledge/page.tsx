/** apps/admin-dashboard/src/app/[locale]/knowledge/page.tsx */

'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { NeuralBridge, TenantId } from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
// Ruta nivelada según estándar OEDP
import { KnowledgeIngestionSchema, IKnowledgeIngestion } from './schemas/knowledge-ingestion.schema';

/**
 * @name KnowledgeAdministrativePage
 * @description Aparato de interfaz para la gestión de ADN técnico corporativo.
 */
export default function KnowledgeAdministrativePage(): React.ReactNode {
  const translations = useTranslations('knowledge');

  const currentTenantIdentifier: TenantId = '00000000-0000-0000-0000-000000000000' as TenantId;

  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [documentContent, setDocumentContent] = useState<string>('');
  const [operationStatus, setOperationStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILURE'>('IDLE');
  const [validationErrorMessage, setValidationErrorMessage] = useState<string | null>(null);

  const handleKnowledgeDocumentIngestion = useCallback(async (): Promise<void> => {
    setValidationErrorMessage(null);

    const rawPayload = {
      documentTitle,
      documentRawContent: documentContent,
      documentCategory: 'TECHNICAL'
    };

    const validationResult = KnowledgeIngestionSchema.safeParse(rawPayload);

    if (!validationResult.success) {
      setValidationErrorMessage(validationResult.error.issues[0].message);
      return;
    }

    const validatedPayload: IKnowledgeIngestion = validationResult.data;
    setOperationStatus('PROCESSING');

    try {
      await NeuralBridge.request<void>(
        '/v1/neural/ingest',
        currentTenantIdentifier,
        validatedPayload
      );

      setOperationStatus('SUCCESS');
      setDocumentTitle('');
      setDocumentContent('');
      setTimeout(() => setOperationStatus('IDLE'), 4000);

    } catch (criticalError: unknown) {
      OmnisyncTelemetry.verbose('KnowledgePage', 'failure', String(criticalError));
      setOperationStatus('FAILURE');
      setTimeout(() => setOperationStatus('IDLE'), 6000);
    }
  }, [documentTitle, documentContent, currentTenantIdentifier]);

  return (
    <div className="max-w-5xl mx-auto py-24 px-10 space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <header className="space-y-8">
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-black uppercase tracking-[0.7em] text-foreground opacity-30">
            {translations('section_label')}
          </span>
          <div className="h-[1px] flex-1 bg-border opacity-50" />
        </div>
        <h1 className="text-7xl font-light tracking-tighter leading-tight text-foreground italic">
          Ingeniería de <span className="font-bold not-italic underline decoration-1 underline-offset-[12px]">Contexto Semántico.</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-12">
        <section className="space-y-10 group">
          <div className="relative">
            <input
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value.toUpperCase())}
              placeholder={translations('title_placeholder')}
              className="w-full bg-transparent border-b border-border py-8 text-sm font-black outline-none uppercase tracking-[0.3em] focus:border-foreground transition-all duration-700 placeholder:opacity-20"
            />
            <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-foreground group-focus-within:w-full transition-all duration-1000" />
          </div>

          <textarea
            value={documentContent}
            onChange={(e) => setDocumentContent(e.target.value)}
            className="w-full h-[500px] bg-neutral-50/50 dark:bg-neutral-900/20 border border-border p-12 text-[16px] leading-relaxed font-light outline-none focus:ring-1 ring-border transition-all"
            placeholder={translations('content_placeholder')}
          />

          {validationErrorMessage && (
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
              [ VALIDATION_ERROR ]: {validationErrorMessage}
            </p>
          )}
        </section>

        <footer className="flex justify-between items-center border-t border-border pt-16">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                operationStatus === 'PROCESSING' ? 'bg-foreground animate-ping' : 'bg-foreground opacity-20'
              }`} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
                {operationStatus === 'PROCESSING' ? translations('status_syncing') : translations('status_ready')}
              </span>
            </div>
          </div>

          <button
            onClick={handleKnowledgeDocumentIngestion}
            disabled={operationStatus === 'PROCESSING' || !documentContent.trim()}
            className="bg-foreground text-background px-20 py-6 text-[11px] font-black uppercase tracking-[0.4em] hover:scale-[1.03] transition-all disabled:opacity-10 shadow-2xl"
          >
            {operationStatus === 'PROCESSING' ? '...' : translations('ingest_button')}
          </button>
        </footer>
      </div>
    </div>
  );
}
