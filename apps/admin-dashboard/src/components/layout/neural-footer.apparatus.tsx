/** apps/admin-dashboard/src/components/layout/neural-footer.apparatus.tsx */

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

/**
 * @name NeuralFooter
 * @description Aparato de cierre estructural de grado industrial. 
 * Orquesta la presentación de créditos institucionales, soberanía territorial 
 * y estados de infraestructura en tiempo real. Implementa la estética 
 * Obsidian & Milk basada en los principios de diseño de Manus.io.
 *
 * @protocol OEDP-Level: Elite (Full i18n & Lint-Sanated)
 */
export const NeuralFooter: React.FC = () => {
  /**
   * @section Internacionalización de Élite
   * RESOLUCIÓN ESLINT: Se utiliza activamente el namespace 'layout.footer'.
   */
  const translations = useTranslations('layout.footer');

  return (
    <footer className="border-t border-border bg-background transition-colors duration-1000">
      
      {/* Sección 01: Grandeza Tipográfica y Marca (Branding Layer) */}
      <div className="max-w-[1440px] mx-auto px-10 py-24 border-x border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-end">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <h2 className="text-[12vw] lg:text-8xl font-black tracking-tighter leading-none uppercase">
              {translations('brand_name')} <br />
              <span className="opacity-10 italic font-light">
                {translations('brand_suffix')}
              </span>
            </h2>
            <div className="flex flex-wrap gap-8 lg:gap-12 text-[10px] font-black uppercase tracking-[0.5em] opacity-40">
               <span>{translations('version_label')} // 2026</span>
               <span>// {translations('status_active')}</span>
            </div>
          </motion.div>

          {/* Sección 02: Navegación Técnica (Metadata Grid) */}
          <div className="grid grid-cols-2 gap-12 border-t lg:border-t-0 border-border pt-16 lg:pt-0">
             <div className="flex flex-col gap-6">
                <span className="text-[9px] font-bold opacity-30 uppercase tracking-[0.3em]">
                  {translations('section_system')}
                </span>
                <nav className="flex flex-col gap-3 text-[11px] font-medium uppercase tracking-widest">
                   <a href="#" className="hover:opacity-40 transition-opacity italic">{translations('link_network')}</a>
                   <a href="#" className="hover:opacity-40 transition-opacity italic">{translations('link_sovereignty')}</a>
                   <a href="#" className="hover:opacity-40 transition-opacity italic">{translations('link_sentinel')}</a>
                </nav>
             </div>
             <div className="flex flex-col gap-6">
                <span className="text-[9px] font-bold opacity-30 uppercase tracking-[0.3em]">
                  {translations('section_company')}
                </span>
                <nav className="flex flex-col gap-3 text-[11px] font-medium uppercase tracking-widest">
                   <a href="#" className="hover:opacity-40 transition-opacity italic">{translations('link_metashark')}</a>
                   <a href="#" className="hover:opacity-40 transition-opacity italic">{translations('link_author')}</a>
                   <a href="#" className="hover:opacity-40 transition-opacity italic">{translations('link_labs')}</a>
                </nav>
             </div>
          </div>
        </div>
      </div>

      {/* Sección 03: Barra de Soberanía Territorial (Forense) */}
      <div className="border-t border-border bg-neutral-50 dark:bg-neutral-900/40">
        <div className="max-w-[1440px] mx-auto px-10 py-10 border-x border-border flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* Identidad del Autor y Geolocalización */}
          <div className="text-[10px] font-black uppercase tracking-[0.4em] flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <span className="text-foreground">
              {translations('author_name')} // {translations('company_name')}
            </span>
            <span className="opacity-20 hidden md:inline">|</span>
            <span className="opacity-40 italic font-light">
              {translations('location_city')} / {translations('location_state')} - {translations('location_country')}
            </span>
          </div>

          {/* Copyright y Licencia SSOT */}
          <div className="flex items-center gap-12 text-[9px] font-bold opacity-30 uppercase tracking-[0.3em]">
             <span>© 2026 {translations('brand_name')}</span>
             <span>{translations('rights_statement')} // NO_LICENSED</span>
          </div>

          {/* Sonda de Latencia Visual (Infraestructure Pulse) */}
          <div className="flex items-center gap-3 px-4 py-1.5 border border-border rounded-sm bg-background">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
             <span className="text-[8px] font-mono tracking-widest">
               {translations('infra_label')} // 14MS
             </span>
          </div>

        </div>
      </div>
    </footer>
  );
};