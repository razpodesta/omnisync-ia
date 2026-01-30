/** apps/admin-dashboard/src/components/hero-section.apparatus.tsx */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncContracts } from '@omnisync/core-contracts';

import {
  HeroSectionConfigurationSchema,
  IHeroSectionConfiguration
} from './schemas/hero-section.schema';

/**
 * @name HeroSection
 * @description Aparato de impacto visual primario con sistema de navegación secuencial.
 * Orquesta la narrativa del ecosistema mediante un slider de alta gama Obsidian & Milk.
 *
 * @protocol OEDP-Level: Elite (Kinetic Storytelling)
 */
export const HeroSection: React.FC = () => {
  const translations = useTranslations('hero-section');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  /**
   * @section Configuración del Carrusel
   */
  const configuration: IHeroSectionConfiguration = useMemo(() => {
    const rawData: unknown = {
      autoplayInterval: 6000,
      slides: [
        { id: crypto.randomUUID(), titleKey: 'slides.infra.title', subtitleKey: 'slides.infra.subtitle', ctaKey: 'slides.infra.cta', accentVariant: 'OBSIDIAN' },
        { id: crypto.randomUUID(), titleKey: 'slides.erp.title', subtitleKey: 'slides.erp.subtitle', ctaKey: 'slides.erp.cta', accentVariant: 'MILK' },
        { id: crypto.randomUUID(), titleKey: 'slides.rag.title', subtitleKey: 'slides.rag.subtitle', ctaKey: 'slides.rag.cta', accentVariant: 'NEURAL_PULSE' },
      ]
    };

    return OmnisyncContracts.validate(HeroSectionConfigurationSchema, rawData, 'HeroSectionApparatus');
  }, []);

  /**
   * @method nextSlide
   * @description Avanza cíclicamente al siguiente nodo narrativo.
   */
  const nextSlide = useCallback(() => {
    setActiveSlideIndex((prev) => (prev + 1) % configuration.slides.length);
  }, [configuration.slides.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, configuration.autoplayInterval);
    return () => clearInterval(timer);
  }, [nextSlide, configuration.autoplayInterval]);

  /**
   * @section Coreografía de Transición
   */
  const slideVariants: Variants = {
    enter: { opacity: 0, x: 20, filter: 'blur(10px)' },
    center: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, x: -20, filter: 'blur(10px)' }
  };

  return OmnisyncTelemetry.traceExecutionSync('HeroSection', 'render', () => (
    <section className="relative h-[90vh] flex flex-col items-center justify-center overflow-hidden px-10 border-b border-border">

      {/* 1. Canvas Narrativo (Slider) */}
      <div className="max-w-6xl w-full text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={configuration.slides[activeSlideIndex].id}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-12"
          >
            <h1 className="text-[9vw] md:text-8xl font-light tracking-tighter leading-[0.9] italic">
              {translations(configuration.slides[activeSlideIndex].titleKey).split('.')[0]}
              <span className="font-black not-italic block">
                {translations(configuration.slides[activeSlideIndex].titleKey).split('.')[1]}.
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-sm md:text-base font-light uppercase tracking-[0.4em] opacity-40 leading-relaxed">
              {translations(configuration.slides[activeSlideIndex].subtitleKey)}
            </p>

            <div className="pt-8">
              <button className="bg-foreground text-background px-16 py-6 text-[10px] font-black uppercase tracking-[0.8em] hover:scale-105 transition-all shadow-2xl active:scale-95">
                {translations(configuration.slides[activeSlideIndex].ctaKey)}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. Navegación de Soberanía (Pagination) */}
      <div className="absolute bottom-20 flex gap-4">
        {configuration.slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => {
              OmnisyncTelemetry.verbose('HeroSection', 'manual_nav', `Slide ${index}`);
              setActiveSlideIndex(index);
            }}
            className="group relative p-2 outline-none"
          >
            <div className={`
              h-[2px] transition-all duration-1000
              ${index === activeSlideIndex ? 'w-12 bg-foreground' : 'w-6 bg-border group-hover:bg-foreground/30'}
            `} />
            {index === activeSlideIndex && (
              <motion.div
                layoutId="hero-pill-timer"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: configuration.autoplayInterval / 1000, ease: 'linear' }}
                className="absolute top-2 left-2 h-[2px] bg-foreground/20"
              />
            )}
          </button>
        ))}
      </div>

      {/* 3. Elementos de Firma Manus.io */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[1px] h-full bg-border/20" />
        <div className="absolute top-0 left-3/4 w-[1px] h-full bg-border/20" />
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-border/10" />
      </div>

    </section>
  ));
};
