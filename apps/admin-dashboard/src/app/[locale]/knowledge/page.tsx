/** apps/admin-dashboard/src/app/[locale]/knowledge/page.tsx */

'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { NeuralBridge, TenantId } from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @section Importación de ADN de Validación
 */
import {
  KnowledgeIngestionSchema,
  IKnowledgeIngestion,
} from './schemas/knowledge-ingestion.schema';

/**
 * @name KnowledgeAdministrativePage
 * @description Aparato de interfaz administrativa encargado de la orquestación y
 * envío de ADN técnico corporativo hacia el ecosistema neural.
 * Implementa validación en caliente mediante Zod y telemetría de latencia de red.
 *
 * @protocol OEDP-Level: Elite (UI-Sovereignty)
 */
export default function KnowledgeAdministrativePage(): React.ReactNode {
  const translations = useTranslations('knowledge');

  /**
   * @note Soberanía de Identidad
   * En una fase futura, este identificador se recuperará de la sesión activa
   * mediante el IdentitySessionApparatus.
   */
  const currentTenantOrganizationIdentifier: TenantId =
    '00000000-0000-0000-0000-000000000000' as TenantId;

  /**
   * @section Estado del Aparato
   */
  const [technicalDocumentTitle, setTechnicalDocumentTitle] =
    useState<string>('');
  const [technicalDocumentRawContent, setTechnicalDocumentRawContent] =
    useState<string>('');
  const [operationStatus, setOperationStatus] = useState<
    'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILURE'
  >('IDLE');
  const [validationErrorMessage, setValidationErrorMessage] = useState<
    string | null
  >(null);

  /**
   * @method handleKnowledgeDocumentIngestion
   * @description Orquesta la validación del payload y la transmisión vía NeuralBridge.
   */
  const handleKnowledgeDocumentIngestion =
    useCallback(async (): Promise<void> => {
      const apparatusName = 'KnowledgeAdministrativePage';
      const operationName = 'handleKnowledgeDocumentIngestion';

      setValidationErrorMessage(null);

      /**
       * @section Fase 1: Validación de Integridad (ADN Local)
       */
      const rawPayload: unknown = {
        documentTitle: technicalDocumentTitle,
        documentRawContent: technicalDocumentRawContent,
        documentCategory: 'TECHNICAL',
      };

      const validationResult = KnowledgeIngestionSchema.safeParse(rawPayload);

      if (!validationResult.success) {
        const firstErrorMessage = validationResult.error.issues[0].message;
        setValidationErrorMessage(firstErrorMessage);
        return;
      }

      const validatedPayload: IKnowledgeIngestion = validationResult.data;
      setOperationStatus('PROCESSING');

      /**
       * @section Fase 2: Transmisión Neural Resiliente
       */
      await OmnisyncTelemetry.traceExecution(
        apparatusName,
        operationName,
        async () => {
          try {
            await NeuralBridge.request<void>(
              '/v1/neural/ingest',
              currentTenantOrganizationIdentifier,
              validatedPayload,
            );

            setOperationStatus('SUCCESS');
            setTechnicalDocumentTitle('');
            setTechnicalDocumentRawContent('');

            // Reset de estado tras confirmación visual
            setTimeout(() => setOperationStatus('IDLE'), 4000);
          } catch (criticalTransmissionError: unknown) {
            OmnisyncTelemetry.verbose(
              apparatusName,
              'ingestion_failure',
              String(criticalTransmissionError),
            );
            setOperationStatus('FAILURE');
            setTimeout(() => setOperationStatus('IDLE'), 6000);
          }
        },
        { tenantId: currentTenantOrganizationIdentifier },
      );
    }, [
      technicalDocumentTitle,
      technicalDocumentRawContent,
      currentTenantOrganizationIdentifier,
    ]);

  return (
    <div className="max-w-5xl mx-auto py-24 px-10 space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Cabecera de Identidad Institucional */}
      <header className="space-y-8">
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-black uppercase tracking-[0.7em] text-foreground opacity-30">
            {translations('section_label')}
          </span>
          <div className="h-[1px] flex-1 bg-border opacity-50" />
        </div>
        <h1 className="text-7xl font-light tracking-tighter leading-tight text-foreground italic">
          Ingeniería de{' '}
          <span className="font-bold not-italic underline decoration-1 underline-offset-[12px]">
            Contexto Semántico.
          </span>
        </h1>
      </header>

      {/* Área de Ingesta Neural */}
      <div className="grid grid-cols-1 gap-12">
        <section className="space-y-10 group">
          {/* Título del Documento (Obsidian Style) */}
          <div className="relative">
            <input
              value={technicalDocumentTitle}
              onChange={(event) =>
                setTechnicalDocumentTitle(event.target.value.toUpperCase())
              }
              placeholder={translations('title_placeholder')}
              className="w-full bg-transparent border-b border-border py-8 text-sm font-black outline-none uppercase tracking-[0.3em] focus:border-foreground transition-all duration-700 placeholder:opacity-20"
            />
            <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-foreground group-focus-within:w-full transition-all duration-1000" />
          </div>

          {/* Cuerpo del Conocimiento */}
          <textarea
            value={technicalDocumentRawContent}
            onChange={(event) =>
              setTechnicalDocumentRawContent(event.target.value)
            }
            className="w-full h-[500px] bg-neutral-50/50 dark:bg-neutral-900/20 border border-border p-12 text-[16px] leading-relaxed font-light outline-none focus:ring-1 ring-border transition-all"
            placeholder={translations('content_placeholder')}
          />

          {/* Reporte de Errores de Validación */}
          {validationErrorMessage && (
            <div className="flex items-center gap-3 animate-pulse">
              <div className="w-1 h-4 bg-red-500" />
              <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">
                [ VALIDATION_ERROR ]: {validationErrorMessage}
              </p>
            </div>
          )}
        </section>

        {/* Footer de Acción Operativa */}
        <footer className="flex justify-between items-center border-t border-border pt-16">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  operationStatus === 'PROCESSING'
                    ? 'bg-foreground animate-ping'
                    : operationStatus === 'SUCCESS'
                      ? 'bg-green-500'
                      : 'bg-foreground opacity-20'
                }`}
              />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
                {operationStatus === 'PROCESSING'
                  ? translations('status_syncing')
                  : operationStatus === 'SUCCESS'
                    ? 'Sincronización Exitosa'
                    : translations('status_ready')}
              </span>
            </div>
          </div>

          <button
            onClick={handleKnowledgeDocumentIngestion}
            disabled={
              operationStatus === 'PROCESSING' ||
              !technicalDocumentRawContent.trim()
            }
            className="bg-foreground text-background px-20 py-6 text-[11px] font-black uppercase tracking-[0.4em] hover:scale-[1.03] transition-all disabled:opacity-10 shadow-2xl active:scale-95"
          >
            {operationStatus === 'PROCESSING'
              ? '...'
              : translations('ingest_button')}
          </button>
        </footer>
      </div>
    </div>
  );
}
