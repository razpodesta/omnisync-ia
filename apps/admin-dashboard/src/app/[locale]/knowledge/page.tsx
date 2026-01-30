/** apps/admin-dashboard/src/app/[locale]/knowledge/page.tsx */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { NeuralBridge, TenantId, OmnisyncContracts } from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @section Importación de ADN de Validación
 * NIVELACIÓN: Se utiliza IKnowledgeIngestion para tipado fuerte en la constante de datos.
 */
import {
  KnowledgeIngestionSchema,
  IKnowledgeIngestion,
} from './schemas/knowledge-ingestion.schema';

/**
 * @name KnowledgeAdministrativePage
 * @description Orquestador de ingesta de conocimiento para la arquitectura RAG.
 * Implementa una interfaz de alta gama para la carga y clasificación de ADN corporativo.
 *
 * @protocol OEDP-Level: Elite (Lint-Sanated & Forensic)
 */
export default function KnowledgeAdministrativePage(): React.ReactNode {
  const translations = useTranslations('knowledge');

  /**
   * @note Soberanía de Identidad
   * Identificador nominal del nodo (Placeholder para integración de sesión V3).
   */
  const currentTenantOrganizationIdentifier: TenantId =
    '00000000-0000-0000-0000-000000000000' as TenantId;

  /**
   * @section Estado del Aparato
   */
  const [technicalDocumentTitle, setTechnicalDocumentTitle] = useState('');
  const [technicalDocumentRawContent, setTechnicalDocumentRawContent] = useState('');
  const [semanticCategory, setSemanticCategory] = useState<'TECHNICAL' | 'LEGAL' | 'ADMINISTRATIVE' | 'COMMERCIAL'>('TECHNICAL');
  const [operationStatus, setOperationStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILURE'>('IDLE');
  const [validationErrorMessage, setValidationErrorMessage] = useState<string | null>(null);

  /**
   * @section Métricas de Densidad (Live Analytics)
   */
  const contentMetrics = useMemo(() => ({
    characterCount: technicalDocumentRawContent.length,
    estimatedVectorialChunks: Math.ceil(technicalDocumentRawContent.length / 1000)
  }), [technicalDocumentRawContent]);

  /**
   * @method handleKnowledgeDocumentIngestion
   * @description Orquesta la validación del payload y la transmisión vía NeuralBridge.
   */
  const handleKnowledgeDocumentIngestion = useCallback(async (): Promise<void> => {
    const apparatusName = 'KnowledgeAdministrativePage';
    const operationName = 'handleKnowledgeDocumentIngestion';

    setValidationErrorMessage(null);

    return await OmnisyncTelemetry.traceExecution(apparatusName, operationName, async () => {
      const rawPayload: unknown = {
        documentTitle: technicalDocumentTitle,
        documentRawContent: technicalDocumentRawContent,
        documentCategory: semanticCategory,
      };

      /**
       * @section Fase 1: Validación de Integridad (SSOT)
       */
      const validationResult = OmnisyncContracts.safeValidate(KnowledgeIngestionSchema, rawPayload);

      if (!validationResult.success) {
        const firstError = validationResult.error?.issues[0].message || 'Validation Failure';
        setValidationErrorMessage(firstError);
        return;
      }

      // Uso de IKnowledgeIngestion para garantizar pureza de tipos en el envío
      const validatedData: IKnowledgeIngestion = validationResult.data as IKnowledgeIngestion;
      setOperationStatus('PROCESSING');

      /**
       * @section Fase 2: Transmisión Neural Resiliente
       */
      try {
        await NeuralBridge.request(
          '/v1/neural/ingest',
          currentTenantOrganizationIdentifier,
          validatedData
        );

        setOperationStatus('SUCCESS');
        setTechnicalDocumentTitle('');
        setTechnicalDocumentRawContent('');

        setTimeout(() => setOperationStatus('IDLE'), 4000);
      } catch (criticalTransmissionError: unknown) {
        /**
         * @section Resolución de Anomalía ESLint
         * Se captura el error y se inyecta en la telemetría para auditoría forense.
         */
        OmnisyncTelemetry.verbose(
          apparatusName,
          'ingestion_failure',
          `Incapacidad de sincronización: ${String(criticalTransmissionError)}`
        );

        setOperationStatus('FAILURE');
        setTimeout(() => setOperationStatus('IDLE'), 6000);
      }
    });
  }, [technicalDocumentTitle, technicalDocumentRawContent, semanticCategory, currentTenantOrganizationIdentifier]);

  return (
    <div className="max-w-6xl mx-auto py-32 px-10 space-y-24 animate-in fade-in slide-in-from-bottom-10 duration-1000">

      {/* Header Institucional Obsidian & Milk */}
      <header className="space-y-10">
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-black uppercase tracking-[0.8em] text-foreground/30">{translations('section_label')}</span>
          <div className="h-[1px] flex-1 bg-border/50" />
        </div>
        <h1 className="text-7xl font-light tracking-tighter leading-[0.8] italic">
          {translations('title').split(' ').slice(0, 2).join(' ')}<br/>
          <span className="font-black not-italic decoration-1 underline-offset-[16px] underline">
            {translations('title').split(' ').slice(2).join(' ')}.
          </span>
        </h1>
      </header>

      {/* Editor de ADN Técnico */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

        {/* Lógica de Control (Lateral) */}
        <aside className="lg:col-span-4 space-y-12 border-l border-border pl-10">
          <div className="space-y-6">
            <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">{translations('categories.label')}</span>
            <div className="flex flex-col gap-3">
              {(['TECHNICAL', 'LEGAL', 'ADMINISTRATIVE', 'COMMERCIAL'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSemanticCategory(cat)}
                  className={`text-[11px] text-left uppercase tracking-[0.3em] transition-all ${semanticCategory === cat ? 'font-black opacity-100' : 'font-light opacity-20 hover:opacity-50'}`}
                >
                  // {translations(`categories.${cat}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-10 space-y-6 border-t border-border/50">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold opacity-30 uppercase">{translations('metrics.characters')}</span>
              <span className="text-xs font-mono">{contentMetrics.characterCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold opacity-30 uppercase">{translations('metrics.estimated_chunks')}</span>
              <span className="text-xs font-mono">{contentMetrics.estimatedVectorialChunks}</span>
            </div>
          </div>
        </aside>

        {/* Input de Datos (Principal) */}
        <main className="lg:col-span-8 space-y-12">
          <div className="relative group">
            <input
              value={technicalDocumentTitle}
              onChange={(e) => setTechnicalDocumentTitle(e.target.value.toUpperCase())}
              placeholder={translations('title_placeholder')}
              className="w-full bg-transparent border-b border-border py-6 text-sm font-black outline-none uppercase tracking-[0.4em] focus:border-foreground transition-all placeholder:opacity-10"
            />
            <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-foreground group-focus-within:w-full transition-all duration-700" />
          </div>

          <textarea
            value={technicalDocumentRawContent}
            onChange={(e) => setTechnicalDocumentRawContent(e.target.value)}
            placeholder={translations('content_placeholder')}
            className="w-full h-[450px] bg-neutral-50/30 dark:bg-neutral-900/10 border border-border p-10 text-[15px] font-light leading-relaxed outline-none focus:ring-1 ring-border transition-all scrollbar-hide"
          />

          <AnimatePresence>
            {validationErrorMessage && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 text-red-500">
                <div className="w-1 h-4 bg-red-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">[ VALIDATION_ERROR ]: {validationErrorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <footer className="flex justify-between items-center pt-10 border-t border-border">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${operationStatus === 'PROCESSING' ? 'bg-foreground animate-ping' : operationStatus === 'SUCCESS' ? 'bg-green-500' : 'bg-foreground/20'}`} />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">
                {translations(`status_${operationStatus.toLowerCase()}`)}
              </span>
            </div>

            <button
              onClick={handleKnowledgeDocumentIngestion}
              disabled={operationStatus === 'PROCESSING' || technicalDocumentRawContent.length < 100}
              className="bg-foreground text-background px-16 py-5 text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl disabled:opacity-5 transition-all hover:scale-[1.02]"
            >
              {operationStatus === 'PROCESSING' ? '...' : translations('ingest_button')}
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
