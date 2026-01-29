/** apps/admin-dashboard/src/app/[locale]/page.tsx */

import React from 'react';
import { Metadata } from 'next';
import { WebChatWidget } from '@omnisync/web-chat-ui';
import { TenantId } from '@omnisync/core-contracts';

/**
 * @section Inyección de Aparatos de Interfaz (Lego Pieces)
 * Se corrigen las rutas según la estructura física del monorepo.
 */
import { MainHeader } from '../../components/layout/main-header.apparatus';
import { NeuralFooter } from '../../components/layout/neural-footer.apparatus';
import { HeroSection } from '../../components/hero-section.apparatus';

/**
 * @section Nuevos Aparatos de Grado Industrial
 * (Se asume su creación en los siguientes pasos del Lote 04)
 */
// import { NeuralMetrics } from '../../components/sections/neural-metrics.apparatus';
// import { IntegrationCarousel } from '../../components/sections/integration-carousel.apparatus';
// import { DashboardCTA } from '../../components/sections/dashboard-cta.apparatus';

/**
 * @description Metadatos de Soberanía para SEO y Redes Sociales.
 */
export const metadata: Metadata = {
  title: 'Omnisync-AI | Neural Enterprise Infrastructure',
  description: 'Orquestación neural para comunicaciones inteligentes e integración ERP de élite.',
};

/**
 * @name HomePage
 * @description Nodo maestro de la Landing Page. Orquesta la narrativa visual
 * del ecosistema Omnisync-AI aplicando principios de diseño Manus.io.
 *
 * @protocol OEDP-Level: Elite (Full-Sovereign Orchestration)
 */
export default async function HomePage(): Promise<React.ReactNode> {
  /**
   * @note Identificador de Prueba
   * Se utiliza un ID neutro para la demostración de la interfaz.
   */
  const demoTenantIdentifier = '00000000-0000-0000-0000-000000000000' as TenantId;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">

      {/* Capa 01: Navegación Global */}
      <MainHeader />

      <main className="flex-1 relative overflow-x-hidden">

        {/* Capa 02: Impacto Cognitivo (Hero) */}
        <HeroSection />

        {/* Capa 03: Evidencia de Rendimiento (Metrics/Graphs Placeholder) */}
        <section className="py-24 border-y border-border bg-neutral-50/30 dark:bg-neutral-900/10">
          <div className="max-w-7xl mx-auto px-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="space-y-4">
                <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.5em]">Latencia_Core</span>
                <p className="text-4xl font-light italic tracking-tighter">0.42<span className="text-sm not-italic opacity-40 font-bold ml-2">ms</span></p>
              </div>
              <div className="space-y-4">
                <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.5em]">Inferencia_RAG</span>
                <p className="text-4xl font-light italic tracking-tighter">98.2<span className="text-sm not-italic opacity-40 font-bold ml-2">% Accuracy</span></p>
              </div>
              <div className="space-y-4">
                <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.5em]">Nodos_Activos</span>
                <p className="text-4xl font-light italic tracking-tighter">1,204<span className="text-sm not-italic opacity-40 font-bold ml-2">Global</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* Capa 04: Explicación Semántica (Features) */}
        <section className="py-40 px-10 max-w-5xl mx-auto space-y-32">
           <article className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                <h2 className="text-5xl font-light leading-tight tracking-tighter italic">
                  Memoria <span className="font-bold not-italic">Semántica Inyectada.</span>
                </h2>
                <p className="text-[13px] leading-relaxed opacity-50 uppercase tracking-widest font-medium">
                  Nuestra arquitectura RAG permite que la IA Gemini consuma sus manuales técnicos en tiempo real, erradicando alucinaciones y garantizando respuestas con base legal y técnica.
                </p>
              </div>
              <div className="aspect-square border border-border p-8 flex items-center justify-center bg-neutral-50/50 dark:bg-black">
                 <div className="w-full h-full border border-border/50 border-dashed animate-pulse flex items-center justify-center">
                    <span className="text-[8px] font-bold opacity-20 uppercase tracking-[1em]">Neural_Grid_Active</span>
                 </div>
              </div>
           </article>
        </section>

        {/* Capa 05: Acceso Administrativo (Dashboard Gateway) */}
        <section className="py-40 bg-foreground text-background">
          <div className="max-w-7xl mx-auto px-10 text-center space-y-12">
            <h2 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-none">
              Control <br/> <span className="opacity-30 italic font-light">Absoluto.</span>
            </h2>
            <div className="pt-10">
               <a
                href={`/es/dashboard`}
                className="inline-block border-2 border-background px-16 py-6 text-xs font-black uppercase tracking-[0.6em] hover:bg-background hover:text-foreground transition-all duration-700"
               >
                 Entrar al Dashboard
               </a>
            </div>
          </div>
        </section>

        {/* Decorativos de Grado Arquitectónico (Manus.io Signature) */}
        <div className="absolute top-0 left-1/4 w-[1px] h-full bg-border/20 -z-10" />
        <div className="absolute top-0 left-3/4 w-[1px] h-full bg-border/20 -z-10" />
      </main>

      {/* Capa 06: Soporte Neural Reactivo */}
      <WebChatWidget tenantId={demoTenantIdentifier} />

      {/* Capa 07: Cierre Estructural */}
      <NeuralFooter />
    </div>
  );
}
