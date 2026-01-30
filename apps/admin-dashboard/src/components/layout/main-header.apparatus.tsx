/** apps/admin-dashboard/src/components/layout/main-header.apparatus.tsx */

'use client';

import React, { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { Link } from '../../i18n/routing';
import { useTranslations } from 'next-intl';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncContracts } from '@omnisync/core-contracts';

import { LanguageSwitcher } from '../language-switcher.apparatus';
import { ThemeSwitcher } from '../theme-switcher.apparatus';
import { MainHeaderConfigurationSchema, IMainHeaderConfiguration } from './schemas/main-header.schema';

/**
 * @name MainHeader
 * @description Orquestador de navegación superior.
 * Implementa el estándar Obsidian & Milk con carga dinámica de fragmentos.
 */
export const MainHeader: React.FC = () => {
  // El namespace 'header' se deriva del nombre del archivo JSON procesado.
  const translations = useTranslations('header');

  const headerConfiguration: IMainHeaderConfiguration = useMemo(() => {
    const rawData: unknown = {
      brandName: translations('brand_name'),
      brandSuffix: translations('brand_suffix'),
      isGlassy: true,
      navigationItems: [
        { translationKey: 'nav.dashboard', routePath: '/dashboard' },
        { translationKey: 'nav.knowledge', routePath: '/knowledge' },
      ]
    };

    return OmnisyncContracts.validate(MainHeaderConfigurationSchema, rawData, 'MainHeaderApparatus');
  }, [translations]);

  const headerVariants: Variants = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  return OmnisyncTelemetry.traceExecutionSync('MainHeader', 'render', () => (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      className="header-glass px-10 py-6 flex justify-between items-center sticky top-0 z-50 transition-all duration-700 select-none backdrop-blur-xl"
    >
      <Link href="/" className="text-2xl font-black tracking-tighter uppercase group flex items-center gap-3 outline-none">
        <div className="relative w-3.5 h-3.5">
          <div className="absolute inset-0 bg-foreground rounded-full animate-ping opacity-10" />
          <div className="relative w-3.5 h-3.5 bg-foreground rounded-full" />
        </div>
        <span className="group-hover:tracking-widest transition-all duration-1000 font-black">
          {headerConfiguration.brandName} <span className="font-thin opacity-30 italic">{headerConfiguration.brandSuffix}</span>
        </span>
      </Link>

      <nav className="flex items-center gap-12">
        <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.5em]">
          {headerConfiguration.navigationItems.map((item) => (
            <Link key={item.routePath} href={item.routePath} className="hover:opacity-40 transition-opacity italic">
              {translations(item.translationKey)}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-8 pl-8 border-l border-border/30">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </nav>
    </motion.header>
  ));
};
