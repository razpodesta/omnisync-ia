/** apps/admin-dashboard/src/components/theme-switcher.apparatus.tsx */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Sun, Moon } from 'lucide-react';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @name ThemeSwitcher
 * @description Aparato de control de identidad visual. Orquesta la transición
 * entre los modos Obsidian (#000) y Milk (#FFF) sincronizando las variables
 * del motor Tailwind CSS v4.
 *
 * @protocol OEDP-Level: Elite (Accessible & Traceable)
 */
export const ThemeSwitcher: React.FC = () => {
  const translations = useTranslations('common.accessibility');
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  /**
   * @section Ciclo de Vida de Hidratación
   * Evita discrepancias entre el renderizado del servidor (SSR) y el cliente.
   */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * @method handleThemeTransition
   * @description Ejecuta el cambio de tema y registra la traza de preferencia.
   */
  const handleThemeTransition = useCallback((): void => {
    const targetTheme = theme === 'dark' ? 'light' : 'dark';

    OmnisyncTelemetry.verbose(
      'ThemeSwitcher',
      'transition',
      `Identidad visual actualizada a: ${targetTheme.toUpperCase()}`
    );

    setTheme(targetTheme);
  }, [theme, setTheme]);

  if (!isMounted) {
    return <div className="w-4 h-4" aria-hidden="true" />;
  }

  return (
    <button
      onClick={handleThemeTransition}
      className="hover:scale-110 transition-transform active:rotate-12 focus-visible:ring-1 ring-border outline-none p-1 rounded-sm"
      /**
       * @section Accesibilidad de Élite
       * Se utiliza la llave i18n: 'common.accessibility.toggle_theme'
       */
      aria-label={translations('toggle_theme')}
    >
      {theme === 'dark' ? (
        <Sun size={14} strokeWidth={3} className="text-foreground animate-in zoom-in duration-500" />
      ) : (
        <Moon size={14} strokeWidth={3} className="text-foreground animate-in zoom-in duration-500" />
      )}
    </button>
  );
};
