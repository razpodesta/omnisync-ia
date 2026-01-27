/** apps/admin-dashboard/src/components/hero-section.apparatus.tsx */

import React from 'react';
import { useTranslations } from 'next-intl';

/**
 * @name HeroSection
 * @description Aparato de impacto visual. Utiliza tipografía itálica y pesos
 * extremos para comunicar la sofisticación de la arquitectura neural.
 */
export const HeroSection: React.FC = () => {
  const t = useTranslations('common');

  return (
    <section className="py-32 px-10 text-center space-y-12 animate-in fade-in zoom-in-95 duration-1000">
      <div className="flex flex-col items-center gap-6">
        <span className="text-[10px] font-black uppercase tracking-[1em] opacity-30 italic">
          {t('status')}
        </span>
      </div>
      <h1 className="text-8xl font-light tracking-tighter leading-none text-foreground italic">
        Mentes <span className="font-bold not-italic">Descentralizadas.</span>
      </h1>
      <p className="text-[12px] font-light leading-relaxed opacity-50 max-w-xl mx-auto uppercase tracking-[0.3em]">
        {t('welcome')} — {t('hero_description')}
      </p>
    </section>
  );
};
