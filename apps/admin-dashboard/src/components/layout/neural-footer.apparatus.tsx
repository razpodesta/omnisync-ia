/** apps/admin-dashboard/src/components/layout/neural-footer.apparatus.tsx */

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

/**
 * @name NeuralFooter
 * @description Aparato de interfaz de usuario encargado del cierre estructural del Dashboard.
 * Presenta metadatos del sistema, créditos de ingeniería y el estado de la infraestructura Cloud.
 * Implementa la estética "Obsidian & Milk" con un enfoque puramente semántico e internacionalizado.
 *
 * @returns {React.ReactNode} El nodo visual del footer renderizado.
 */
export const NeuralFooter: React.FC = () => {
  /**
   * @section Internacionalización de Élite
   * Se utiliza el namespace 'common.footer' para centralizar las llaves de traducción.
   */
  const translations = useTranslations('common.footer');

  return (
    <footer className="border-t border-border px-12 py-20 flex flex-col md:flex-row justify-between items-center md:items-end gap-12 bg-neutral-50 dark:bg-neutral-900/40 transition-colors duration-1000">
      {/* Identidad de Versión y Créditos */}
      <div className="space-y-4 text-center md:text-left">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-black uppercase tracking-[0.5em] text-foreground">
            {translations('version_label')} // CORE 1.0
          </span>
          <p className="text-[9px] uppercase tracking-[0.3em] opacity-30 font-light italic">
            {translations('credits')}
          </p>
        </div>

        <div className="text-[8px] uppercase tracking-[0.2em] opacity-20 font-medium">
          {translations('rights')} // © 2026 // NO LICENSED
        </div>
      </div>

      {/* Métricas de Infraestructura de Grado Industrial */}
      <div className="flex gap-16 text-[9px] font-bold uppercase tracking-[0.4em] opacity-40">
        <div className="flex flex-col gap-2 items-center md:items-start">
          <span className="text-[8px] font-black opacity-30">
            {translations('latency_label')}
          </span>
          <span className="font-mono text-foreground">12ms (Edge)</span>
        </div>

        <div className="flex flex-col gap-2 items-center md:items-start">
          <span className="text-[8px] font-black opacity-30">
            {translations('region_label')}
          </span>
          <span className="font-mono text-foreground">BR-FLN-01</span>
        </div>
      </div>
    </footer>
  );
};
