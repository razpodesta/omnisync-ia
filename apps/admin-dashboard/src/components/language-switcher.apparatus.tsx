/** apps/admin-dashboard/src/components/language-switcher.apparatus.tsx */

'use client';

import React, { useMemo } from 'react';
import Flag from 'react-world-flags';
import { usePathname, useRouter } from '../i18n/routing';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncContracts } from '@omnisync/core-contracts';

import {
  LanguageSwitcherConfigurationSchema,
  ILanguageSwitcherConfiguration,
  ISupportedLocale
} from './schemas/language-switcher.schema';

/**
 * @name LanguageSwitcher
 * @description Aparato de control de soberanía lingüística.
 * Orquesta la transición semántica entre locales autorizados inyectando
 * iconografía de banderas y estados de activación Obsidian & Milk.
 *
 * @protocol OEDP-Level: Elite (Semantic Transition)
 */
export const LanguageSwitcher: React.FC = () => {
  const translations = useTranslations('language-switcher');
  const router = useRouter();
  const pathname = usePathname();
  const parameters = useParams();

  /**
   * @section Resolución de Local Actual
   */
  const currentLocale = (parameters['locale'] as ISupportedLocale) || 'es';

  /**
   * @section Configuración de Nodos de Idioma
   * Validada bajo contrato SSOT para asegurar integridad visual.
   */
  const configuration: ILanguageSwitcherConfiguration = useMemo(() => {
    const rawData: unknown = {
      locales: [
        { id: 'es', flagCode: 'ES', labelKey: 'locales.es' },
        { id: 'en', flagCode: 'US', labelKey: 'locales.en' },
        { id: 'pt', flagCode: 'BR', labelKey: 'locales.pt' },
      ]
    };

    return OmnisyncContracts.validate(
      LanguageSwitcherConfigurationSchema,
      rawData,
      'LanguageSwitcherApparatus'
    );
  }, []);

  /**
   * @method handleLocaleTransition
   * @description Ejecuta el cambio de idioma y registra la latencia de redirección.
   */
  const handleLocaleTransition = (targetLocale: ISupportedLocale): void => {
    if (targetLocale === currentLocale) return;

    OmnisyncTelemetry.verbose(
      'LanguageSwitcher',
      'transition',
      `Solicitando cambio de soberanía: ${currentLocale} -> ${targetLocale}`
    );

    // Navegación preservando la ruta interna
    router.replace(pathname, { locale: targetLocale });
  };

  return OmnisyncTelemetry.traceExecutionSync('LanguageSwitcher', 'render', () => (
    <nav className="flex items-center gap-6" aria-label={translations('selector_label')}>
      <AnimatePresence mode="wait">
        {configuration.locales.map((localeNode) => {
          const isActive = currentLocale === localeNode.id;

          return (
            <motion.button
              key={localeNode.id}
              onClick={() => handleLocaleTransition(localeNode.id as ISupportedLocale)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`group flex items-center gap-2.5 outline-none transition-all duration-500 ${
                isActive ? 'opacity-100' : 'opacity-30 hover:opacity-100'
              }`}
            >
              {/* Contenedor de Bandera de Élite */}
              <div className={`
                relative w-5 h-5 rounded-full overflow-hidden border transition-all duration-700
                ${isActive
                  ? 'border-foreground shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] grayscale-0'
                  : 'border-border grayscale group-hover:grayscale-0'
                }
              `}>
                <Flag
                  code={localeNode.flagCode}
                  className="w-full h-full object-cover scale-125"
                />
              </div>

              {/* Etiqueta Técnica */}
              <span className={`
                text-[9px] font-black uppercase tracking-[0.3em] transition-all
                ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:tracking-[0.4em]'}
              `}>
                {localeNode.id}
              </span>

              {/* Indicador de Actividad (Manus.io Signature) */}
              {isActive && (
                <motion.div
                  layoutId="active-locale-dot"
                  className="w-1 h-1 bg-foreground rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </AnimatePresence>
    </nav>
  ));
};
