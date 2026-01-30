/** apps/admin-dashboard/src/app/[locale]/unauthorized/page.tsx */

import React from 'react';
import { useTranslations } from 'next-intl';
import { headers } from 'next/headers';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncContracts } from '@omnisync/core-contracts';

import {
  UnauthorizedPageContextSchema,
  IUnauthorizedPageContext
} from './schemas/unauthorized.schema';

/**
 * @name AdministrativeUnauthorizedPage
 * @description Aparato de interfaz para la gestión de excepciones de seguridad geográfica.
 * Implementa la estética Obsidian & Milk bajo el protocolo OEDP V2.0.
 *
 * @protocol OEDP-Level: Elite (Sovereign Security UI)
 */
export default async function AdministrativeUnauthorizedPage(): Promise<React.ReactNode> {
  const translations = useTranslations('unauthorized');

  /**
   * @section Resolución de Contexto Forense
   * Extraemos el país detectado desde las cabeceras de Vercel Edge.
   */
  const requestHeaders = await headers();
  const detectedCountry = requestHeaders.get('x-vercel-ip-country') || 'XX';

  const context: IUnauthorizedPageContext = OmnisyncContracts.validate(
    UnauthorizedPageContextSchema,
    {
      internalErrorCode: 'OS-SEC-403',
      breachCategory: 'GEOFENCING_RESTRICTION',
      detectedRegionCode: detectedCountry,
      isForensicTraceVisible: true
    },
    'UnauthorizedPage'
  );

  return OmnisyncTelemetry.traceExecutionSync('UnauthorizedPage', 'render', () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in duration-1000 bg-background text-foreground">

      {/* Contenedor de Alerta Obsidian & Milk (Manus.io Style) */}
      <section className="max-w-2xl w-full border border-border p-12 md:p-20 space-y-16 bg-background shadow-[0_0_100px_-30px_rgba(0,0,0,0.1)] relative overflow-hidden">

        {/* Marca de Agua de Seguridad (Fondo Decorativo) */}
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
           <span className="text-[100px] font-black tracking-tighter">403</span>
        </div>

        {/* Header de Incidencia */}
        <header className="flex justify-between items-start relative z-10">
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-600">
              {translations('header_label')}
            </span>
            <h1 className="text-5xl md:text-6xl font-light tracking-tighter leading-none italic">
              {translations('title_part_1')} <br/>
              <span className="font-black not-italic decoration-1 underline underline-offset-[12px]">
                {translations('title_part_2')}
              </span>
            </h1>
          </div>
          <div className="text-[10px] font-mono border border-border px-4 py-2 opacity-50 bg-neutral-50 dark:bg-neutral-900">
            {translations('error_code_label')} // {context.internalErrorCode}
          </div>
        </header>

        {/* Cuerpo del Mensaje de Soberanía */}
        <article className="space-y-10 relative z-10">
          <div className="flex items-center gap-6">
            <div className="h-[1px] flex-1 bg-border" />
            <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-80">
              {translations('restricted_region_message', { country: context.detectedRegionCode })}
            </p>
            <div className="h-[1px] flex-1 bg-border" />
          </div>

          <p className="text-sm md:text-base leading-relaxed font-light opacity-50 italic max-w-xl">
            "{translations('legal_notice')}"
          </p>
        </article>

        {/* Acción de Retorno Institucional */}
        <footer className="pt-10 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <a
            href="/"
            className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.5em] border-b-2 border-foreground pb-2 transition-all hover:opacity-40"
          >
            <span className="group-hover:-translate-x-2 transition-transform">←</span>
            {translations('back_to_safe_zone')}
          </a>

          {context.isForensicTraceVisible && (
            <div className="flex flex-col items-end gap-1 opacity-20 font-mono text-[8px] uppercase tracking-widest">
              <span>Trace_ID: {crypto.randomUUID().substring(0, 8)}</span>
              <span>Node_Status: LOCKED</span>
            </div>
          )}
        </footer>
      </section>

      {/* Decoración de Grado Arquitectónico */}
      <div className="mt-16 text-[9px] uppercase tracking-[1em] opacity-20 font-bold">
        {translations('forensic_footer')}
      </div>

    </div>
  ));
}
