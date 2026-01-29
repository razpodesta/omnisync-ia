/** apps/admin-dashboard/src/components/hero-section.apparatus.tsx */

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion, Variants } from 'framer-motion';

/**
 * @name HeroSection
 * @description Aparato de impacto visual primario del ecosistema Omnisync-AI. 
 * Orquesta la narrativa inicial del usuario mediante tipografía de grado 
 * arquitectónico y animaciones coreografiadas. Implementa la estética 
 * Obsidian & Milk bajo el protocolo OEDP.
 *
 * @protocol OEDP-Level: Elite (Visual Impact & Motion)
 */
export const HeroSection: React.FC = () => {
  /**
   * @section Internacionalización
   * Se consume el namespace 'common' para el ADN de marca global.
   */
  const translations = useTranslations('common');

  /**
   * @section Configuración de Animaciones (Motion Canvas)
   * Definición de variantes para una entrada fluida y profesional.
   */
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative py-48 px-10 text-center flex flex-col items-center justify-center overflow-hidden"
    >
      {/* 1. Indicador de Soberanía Técnica (Badge) */}
      <motion.div variants={itemVariants} className="mb-12">
        <div className="flex items-center gap-4 px-6 py-2 border border-border rounded-full bg-neutral-50/50 dark:bg-neutral-900/30 backdrop-blur-sm">
          <div className="w-1.5 h-1.5 bg-foreground rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-foreground/40 italic">
            {translations('status')}
          </span>
        </div>
      </motion.div>

      {/* 2. Headline Maestro (Obsidian & Milk Typography) */}
      <motion.h1 
        variants={itemVariants}
        className="text-[10vw] md:text-8xl font-light tracking-tighter leading-[0.9] text-foreground italic max-w-6xl"
      >
        Mentes <br className="md:hidden" />
        <span className="font-black not-italic decoration-1 underline-offset-[12px]">
          Descentralizadas.
        </span>
      </motion.h1>

      {/* 3. Subtexto de Proposición de Valor */}
      <motion.div variants={itemVariants} className="mt-16 max-w-2xl">
        <p className="text-[13px] md:text-sm font-light leading-relaxed opacity-50 uppercase tracking-[0.4em]">
          {translations('welcome')} <span className="opacity-20 mx-2">//</span> {translations('hero_description')}
        </p>
      </motion.div>

      {/* 4. Llamada a la Acción (CTA de Grado Elite) */}
      <motion.div variants={itemVariants} className="mt-20">
        <button 
          className="group relative bg-foreground text-background px-16 py-6 text-[10px] font-black uppercase tracking-[0.8em] transition-all hover:scale-105 active:scale-95 hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_20px_50px_rgba(255,255,255,0.05)]"
        >
          <span className="relative z-10">{translations('explore_infrastructure')}</span>
          <div className="absolute inset-0 bg-background opacity-0 group-hover:opacity-10 transition-opacity" />
        </button>
      </motion.div>

      {/* 5. Elementos Decorativos de Grid (Manus.io Signature) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-border to-transparent opacity-20 -z-10" />
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent opacity-20 -z-10" />
    </motion.section>
  );
};