/** apps/admin-dashboard/src/components/layout/main-header.apparatus.tsx */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '../../i18n/routing';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '../language-switcher.apparatus';
import { ThemeSwitcher } from '../theme-switcher.apparatus';

/**
 * @name MainHeader
 * @description Orquestador de navegación superior y soberanía de estado. 
 * Implementa el diseño Obsidian & Milk con Glassmorphism reactivo y 
 * micro-interacciones coreografiadas por Framer Motion.
 *
 * @protocol OEDP-Level: Elite (Visual Sovereignty)
 */
export const MainHeader: React.FC = () => {
  const translations = useTranslations('widget.header');

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="header-glass px-10 py-6 flex justify-between items-center sticky top-0 z-50 transition-all duration-700"
    >
      {/* 1. Branding: Identidad Neural */}
      <Link
        href="/"
        className="text-2xl font-black tracking-[calc(-0.05em)] uppercase group flex items-center gap-3"
      >
        <div className="relative w-3 h-3">
          <div className="absolute inset-0 bg-foreground rounded-full animate-ping opacity-20" />
          <div className="relative w-3 h-3 bg-foreground rounded-full" />
        </div>
        <span className="group-hover:tracking-[calc(0.1em)] transition-all duration-1000 font-black">
          OMNISYNC <span className="font-thin opacity-30 italic">AI</span>
        </span>
      </Link>

      {/* 2. Navegación e Inyectores de Soberanía */}
      <nav className="flex items-center gap-12">
        <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.4em]">
          <Link
            href="/dashboard"
            className="hover:opacity-40 transition-opacity italic decoration-1 underline-offset-8 hover:underline"
          >
            {translations('nav_dashboard')}
          </Link>

          <Link
            href="/knowledge"
            className="hover:opacity-40 transition-opacity italic decoration-1 underline-offset-8 hover:underline"
          >
            {translations('nav_knowledge')}
          </Link>
        </div>

        {/* 3. Separador Arquitectónico */}
        <div className="h-5 w-[1px] bg-border opacity-20 mx-4" />

        {/* 4. Switchers de Preferencias */}
        <div className="flex items-center gap-6">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </nav>
    </motion.header>
  );
};