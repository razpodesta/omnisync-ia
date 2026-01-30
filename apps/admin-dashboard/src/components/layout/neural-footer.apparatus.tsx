/** apps/admin-dashboard/src/components/layout/neural-footer.apparatus.tsx */

'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncContracts } from '@omnisync/core-contracts';

import {
  NeuralFooterConfigurationSchema,
  INeuralFooterConfiguration
} from './schemas/neural-footer.schema';

/**
 * @name NeuralFooter
 * @description Aparato de cierre estructural de grado profesional.
 * Orquesta la visualización de metadatos técnicos, estados de red y navegación legal.
 * Implementa una arquitectura de rejilla basada en Manus.io con Obsidian & Milk.
 *
 * @protocol OEDP-Level: Elite (Forensic UX)
 */
export const NeuralFooter: React.FC = () => {
  const translations = useTranslations('footer');

  /**
   * @section Configuración de Soberanía Técnica
   * Hidratamos el contrato del footer validando cada propiedad.
   */
  const footerConfiguration: INeuralFooterConfiguration = useMemo(() => {
    const rawData: unknown = {
      systemVersion: 'V2.6.0-ELITE',
      authorTag: 'Raz Podestá',
      operationalStatus: 'CORE_OPERATIONAL',
      locationTrace: {
        city: 'Florianópolis',
        countryCode: 'BR'
      },
      navigationSectors: [
        {
          sectorTitleKey: 'sectors.ecosystem',
          links: [
            { labelKey: 'links.network', href: '#' },
            { labelKey: 'links.sovereignty', href: '#' },
            { labelKey: 'links.sentinel', href: '#' },
          ]
        },
        {
          sectorTitleKey: 'sectors.company',
          links: [
            { labelKey: 'links.metashark', href: '#' },
            { labelKey: 'links.labs', href: '#' },
          ]
        }
      ]
    };

    return OmnisyncContracts.validate(
      NeuralFooterConfigurationSchema,
      rawData,
      'NeuralFooterApparatus'
    );
  }, []);

  return OmnisyncTelemetry.traceExecutionSync('NeuralFooter', 'render', () => (
    <footer className="border-t border-border bg-background transition-colors duration-1000 selection:bg-foreground selection:text-background">

      {/* Sección Superior: Impacto Tipográfico & Nav */}
      <div className="max-w-[1440px] mx-auto px-10 py-24 border-x border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-end">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <h2 className="text-[10vw] lg:text-7xl font-black tracking-tighter leading-none uppercase">
              {translations('brand_name')}<br />
              <span className="opacity-10 italic font-light">{translations('brand_suffix')}</span>
            </h2>
            <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.5em] opacity-40">
               <span>{translations('version_label')} // {footerConfiguration.systemVersion}</span>
               <span>// {translations('status_label')}</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-12 border-t lg:border-t-0 border-border pt-16 lg:pt-0">
            {footerConfiguration.navigationSectors.map((sector) => (
              <div key={sector.sectorTitleKey} className="flex flex-col gap-6">
                <span className="text-[9px] font-bold opacity-30 uppercase tracking-[0.3em]">
                  {translations(sector.sectorTitleKey)}
                </span>
                <nav className="flex flex-col gap-3 text-[11px] font-medium uppercase tracking-widest">
                  {sector.links.map((link) => (
                    <a key={link.labelKey} href={link.href} className="hover:opacity-40 transition-opacity italic">
                      {translations(link.labelKey)}
                    </a>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sección Inferior: Forensic Trace & Geofencing */}
      <div className="border-t border-border bg-neutral-50 dark:bg-neutral-900/40">
        <div className="max-w-[1440px] mx-auto px-10 py-10 border-x border-border flex flex-col md:flex-row justify-between items-center gap-8">

          <div className="text-[10px] font-black uppercase tracking-[0.4em] flex flex-col md:flex-row items-center gap-4">
            <span className="text-foreground">{footerConfiguration.authorTag} <span className="opacity-20">//</span> METASHARK TECH</span>
            <span className="opacity-20 hidden md:inline">|</span>
            <span className="opacity-40 italic font-light">
              {footerConfiguration.locationTrace.city}, {footerConfiguration.locationTrace.countryCode}
            </span>
          </div>

          <div className="flex items-center gap-12 text-[9px] font-bold opacity-30 uppercase tracking-[0.3em]">
             <span>© 2026 {translations('brand_name')}</span>
             <span>{translations('rights_reserved')}</span>
          </div>

          {/* Infrastructure Pulse (Efecto Visual de Próxima Generación) */}
          <div className="flex items-center gap-3 px-4 py-1.5 border border-border rounded-sm bg-background shadow-sm">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
             <span className="text-[8px] font-mono tracking-[0.2em]">LATENCY // 12MS</span>
          </div>

        </div>
      </div>
    </footer>
  ));
};
