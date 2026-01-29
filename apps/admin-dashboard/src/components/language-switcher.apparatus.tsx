/** apps/admin-dashboard/src/components/language-switcher.apparatus.tsx */

'use client';

import React from 'react';
import Flag from 'react-world-flags';
import { usePathname, useRouter, routing } from '../i18n/routing';
import { useParams } from 'next/navigation';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @type SupportedLocale
 * @description Inferencia de los idiomas soportados por la arquitectura.
 */
type SupportedLocale = (typeof routing.locales)[number];

/**
 * @name LanguageSwitcher
 * @description Aparato de transición semántica. Orquesta el cambio de idioma
 * en el Edge de Vercel y actualiza el contexto de internacionalización.
 * Implementa la estética Manus.io mediante iconografía reducida y tipografía técnica.
 */
export const LanguageSwitcher: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const parameters = useParams();

  /**
   * @section Resolución de Identidad Lingüística
   * Validamos que el parámetro de la URL pertenezca a los locales soportados.
   */
  const currentLocale: SupportedLocale = routing.locales.includes(
    parameters['locale'] as SupportedLocale,
  )
    ? (parameters['locale'] as SupportedLocale)
    : routing.defaultLocale;

  /**
   * @section Mapeo de Soberanía Territorial
   */
  const localeToCountryMap: Record<SupportedLocale, string> = {
    es: 'ES',
    en: 'US',
    pt: 'BR',
  };

  /**
   * @method handleLanguageTransition
   * @description Ejecuta el cambio de idioma y registra la traza de performance.
   */
  const handleLanguageTransition = (newLocale: SupportedLocale): void => {
    if (newLocale === currentLocale) return;

    OmnisyncTelemetry.verbose(
      'LanguageSwitcher',
      'transition',
      `Sovereignty change: ${currentLocale} -> ${newLocale}`,
    );

    router.replace(pathname, { locale: newLocale });
  };

  return (
    <nav className="flex gap-8 items-center" aria-label="Language Selector">
      {routing.locales.map((localeIdentifier) => (
        <button
          key={localeIdentifier}
          onClick={() => handleLanguageTransition(localeIdentifier)}
          className={`flex items-center gap-2.5 group transition-all duration-700 outline-none ${
            currentLocale === localeIdentifier
              ? 'opacity-100'
              : 'opacity-20 hover:opacity-100'
          }`}
        >
          {/* Contenedor de Bandera Obsidian & Milk */}
          <div
            className={`w-3.5 h-3.5 overflow-hidden rounded-full border border-border transition-all duration-500 ${
              currentLocale === localeIdentifier
                ? 'grayscale-0 scale-110 shadow-sm'
                : 'grayscale group-hover:grayscale-0'
            }`}
          >
            <Flag
              code={localeToCountryMap[localeIdentifier]}
              className="object-cover w-full h-full scale-125"
              alt={`${localeIdentifier} flag`}
            />
          </div>

          <span
            className={`text-[9px] font-black uppercase tracking-[0.3em] ${
              currentLocale === localeIdentifier
                ? 'underline decoration-1 underline-offset-4'
                : 'group-hover:tracking-[0.4em]'
            }`}
          >
            {localeIdentifier}
          </span>
        </button>
      ))}
    </nav>
  );
};
