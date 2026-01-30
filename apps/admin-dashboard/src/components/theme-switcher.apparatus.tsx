/** apps/admin-dashboard/src/components/theme-switcher.apparatus.tsx */

'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncContracts } from '@omnisync/core-contracts';

import {
  ThemeSwitcherConfigurationSchema,
  IThemeSwitcherConfiguration
} from './schemas/theme-switcher.schema';

/**
 * @name ThemeSwitcher
 * @description Aparato de control de fase lumínica.
 * Orquesta la transición entre Obsidian (#000) y Milk (#FFF) mediante un
 * mecanismo de deslizamiento cinético.
 *
 * @protocol OEDP-Level: Elite (Kinetic UI)
 */
export const ThemeSwitcher: React.FC = () => {
  const translations = useTranslations('theme-switcher');
  const {setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  /**
   * @section Ciclo de Hidratación
   * Previene discrepancias de renderizado entre servidor y cliente.
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * @section Configuración de Élite
   */
  const configuration: IThemeSwitcherConfiguration = useMemo(() => {
    return OmnisyncContracts.validate(
      ThemeSwitcherConfigurationSchema,
      { iconSize: 13, transitionDuration: 0.6 },
      'ThemeSwitcherApparatus'
    );
  }, []);

  /**
   * @method handleThemeTransition
   * @description Ejecuta el cambio de identidad visual y registra la traza de performance.
   */
  const handleThemeTransition = useCallback((): void => {
    const targetTheme = resolvedTheme === 'dark' ? 'light' : 'dark';

    OmnisyncTelemetry.verbose(
      'ThemeSwitcher',
      'transition',
      `Fase lumínica actualizada a: ${targetTheme.toUpperCase()}`
    );

    setTheme(targetTheme);
  }, [resolvedTheme, setTheme]);

  if (!mounted) return <div className="w-12 h-6" />;

  const isDark = resolvedTheme === 'dark';

  return OmnisyncTelemetry.traceExecutionSync('ThemeSwitcher', 'render', () => (
    <button
      onClick={handleThemeTransition}
      aria-label={translations('toggle_label')}
      title={isDark ? translations('modes.light') : translations('modes.dark')}
      className="relative flex items-center w-14 h-7 rounded-full border border-border bg-neutral-50 dark:bg-neutral-900 transition-colors duration-700 outline-none group"
    >
      {/* Carril de Desplazamiento */}
      <div className="absolute inset-0 flex justify-between items-center px-2 opacity-20 group-hover:opacity-40 transition-opacity">
        <Sun size={10} strokeWidth={3} />
        <Moon size={10} strokeWidth={3} />
      </div>

      {/* Nodo Cinético (El Desplazador) */}
      <motion.div
        animate={{ x: isDark ? 28 : 4 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
          duration: configuration.transitionDuration
        }}
        className="z-10 flex items-center justify-center w-5 h-5 rounded-full bg-foreground shadow-xl border border-border/50"
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3 }}
            >
              <Moon size={configuration.iconSize} className="text-background fill-current" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3 }}
            >
              <Sun size={configuration.iconSize} className="text-background fill-current" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Sello Manus.io (Borde de Enfoque) */}
      <span className="absolute inset-[-2px] rounded-full border border-foreground/0 group-focus-visible:border-foreground/50 transition-all" />
    </button>
  ));
};
