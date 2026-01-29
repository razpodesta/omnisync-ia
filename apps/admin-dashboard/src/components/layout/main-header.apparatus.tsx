/** apps/admin-dashboard/src/components/layout/main-header.apparatus.tsx */

'use client';

import React from 'react';
import { Link } from '../../i18n/routing';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '../language-switcher.apparatus';
import { ThemeSwitcher } from '../theme-switcher.apparatus';

/**
 * @name MainHeader
 * @description Orquestador de navegación superior y soberanía de estado (Idioma/Tema).
 * Implementa el diseño Manus.io con efecto de cristal esmerilado y tipografía técnica.
 *
 * @returns {React.ReactNode} El nodo visual de la cabecera.
 */
export const MainHeader: React.FC = () => {
  const translations = useTranslations('widget.header');

  return (
    <header className="border-b border-border px-10 py-8 flex justify-between items-center bg-background/80 backdrop-blur-2xl sticky top-0 z-50 transition-colors duration-500">
      {/* Branding de Identidad Corporativa */}
      <Link
        href="/"
        className="text-xl font-black tracking-tighter uppercase group flex items-center gap-3"
      >
        <div className="w-2.5 h-2.5 bg-foreground rounded-full animate-pulse" />
        <span className="group-hover:tracking-widest transition-all duration-700 font-black">
          OMNISYNC <span className="font-thin opacity-40">AI</span>
        </span>
      </Link>

      {/* Navegación y Controles de Preferencias */}
      <nav className="flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.4em]">
        <Link
          href="/dashboard"
          className="hover:opacity-40 transition-opacity italic"
        >
          {translations('nav_dashboard')}
        </Link>

        <Link
          href="/knowledge"
          className="hover:opacity-40 transition-opacity italic"
        >
          {translations('nav_knowledge')}
        </Link>

        {/* Separador de Grado Arquitectónico */}
        <div className="h-4 w-[1px] bg-border opacity-20 mx-2" />

        <LanguageSwitcher />
        <ThemeSwitcher />
      </nav>
    </header>
  );
};
