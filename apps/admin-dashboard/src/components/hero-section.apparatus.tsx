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
 * @section Inyección de Aparatos Visuales
 * RESOLUCIÓN TS2307: Se asegura la vinculación con el nodo de gráficos neurales.
 * El archivo debe residir en: src/components/graphics/neural-architecture.graphics.tsx
 */
import { NeuralArchitectureDiagram } from './graphics/neural-architecture.graphics';

/**
 * @name HeroSection
 * @description Aparato de impacto visual primario con narrativa secuencial y diagramación neural.
 * Orquesta la visión holística del ecosistema mediante un slider de alta gama y gráficos 
 * vectoriales dinámicos que reaccionan al estado de la navegación.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Visual-Sovereignty V3.5.1)
 * @vision Ultra-Holística: Kinetic-Narrative & Zero-Layout-Shift
 */
export const HeroSection: React.FC = () => {
  const translations = useTranslations('hero-section');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  /**
   * @section Hidratación de Configuración (SSOT)
   */
  const configuration: IHeroSectionConfiguration = useMemo(() => {
    const rawData: unknown = {
      autoplayInterval: 7000,
      slides: [
        { id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c51', titleKey: 'slides.infra.title', subtitleKey: 'slides.infra.subtitle', ctaKey: 'slides.infra.cta', accentVariant: 'OBSIDIAN' },
        { id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c52', titleKey: 'slides.erp.title', subtitleKey: 'slides.erp.subtitle', ctaKey: 'slides.erp.cta', accentVariant: 'MILK' },
        { id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c53', titleKey: 'slides.rag.title', subtitleKey: 'slides.rag.subtitle', ctaKey: 'slides.rag.cta', accentVariant: 'NEURAL_PULSE' },
      ]
    };
    return OmnisyncContracts.validate(HeroSectionConfigurationSchema, rawData, 'HeroSectionApparatus');
  }, []);

  /**
   * @method nextSlide
   * @description Avanza al siguiente nodo de la narrativa neural.
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
    enter: { opacity: 0, scale: 0.98, y: 10, filter: 'blur(12px)' },
    center: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    },
    exit: { 
      opacity: 0, 
      scale: 1.02, 
      y: -10, 
      filter: 'blur(12px)',
      transition: { duration: 0.6, ease: [0.7, 0, 0.84, 0] }
    }
  };

  /**
   * @section Guardián de Renderizado (Failsafe)
   */
  const activeSlide = configuration.slides[activeSlideIndex] ?? configuration.slides[0];

  return OmnisyncTelemetry.traceExecutionSync('HeroSection', 'render', () => (
    <section 
      className="relative h-[90vh] flex flex-col items-center justify-center overflow-hidden px-10 border-b border-border bg-background transition-colors duration-1000"
      aria-live="polite"
    >
      
      {/* Capa 0: Diagrama Arquitectónico (Efecto de Fondo Vectorial) */}
      <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none">
        <NeuralArchitectureDiagram activeIndex={activeSlideIndex} />
      </div>

      {/* Capa 1: Canvas Narrativo Principal */}
      <div className="max-w-6xl w-full text-center relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="space-y-14"
          >
            <h1 className="text-[8vw] md:text-8xl font-light tracking-tighter leading-[0.9] italic select-none">
              {translations(activeSlide.titleKey).split('.')[0]}
              <span className="font-black not-italic block uppercase tracking-[-0.04em]">
                {translations(activeSlide.titleKey).split('.')[1]}.
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-[10px] md:text-xs font-black uppercase tracking-[0.7em] opacity-30 leading-relaxed">
              {translations(activeSlide.subtitleKey)}
            </p>

            <div className="pt-6">
              <button 
                className="group relative bg-foreground text-background px-20 py-6 text-[10px] font-black uppercase tracking-[0.8em] transition-all hover:scale-[1.03] active:scale-95 overflow-hidden shadow-2xl"
                aria-label={translations(activeSlide.ctaKey)}
              >
                <span className="relative z-10">{translations(activeSlide.ctaKey)}</span>
                <motion.div 
                  className="absolute inset-0 bg-neutral-800" 
                  initial={{ x: '-100%' }} 
                  whileHover={{ x: 0 }} 
                  transition={{ duration: 0.4, ease: 'circOut' }}
                />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Capa 2: Controles de Soberanía (Pagination) */}
      <div className="absolute bottom-20 flex flex-col items-center gap-10">
        <nav className="flex gap-8" aria-label="Slide Navigation">
          {configuration.slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => {
                OmnisyncTelemetry.verbose('HeroSection', 'manual_skip', `Index: ${index}`);
                setActiveSlideIndex(index);
              }}
              className="group relative py-4 outline-none"
              aria-current={index === activeSlideIndex ? 'step' : undefined}
            >
              <div className={`
                h-[1.5px] transition-all duration-700 
                ${index === activeSlideIndex ? 'w-16 bg-foreground' : 'w-6 bg-border group-hover:bg-foreground/40'}
              `} />
            </button>
          ))}
        </nav>
        
        <div className="flex flex-col items-center gap-2">
          <span className="text-[8px] font-mono tracking-[0.5em] opacity-20 uppercase font-bold">
            Neural_Topology_Active // OEDP-v3.5.1
          </span>
          <div className="w-12 h-[1px] bg-border/20" />
        </div>
      </div>

      {/* Elementos Decorativos de Firma Manus.io */}
      <div className="absolute top-0 left-1/4 w-[1px] h-full bg-border/5 -z-20" />
      <div className="absolute top-0 left-3/4 w-[1px] h-full bg-border/5 -z-20" />
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-border/5 -z-20" />
    </section>
  ));
};