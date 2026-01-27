/** apps/admin-dashboard/src/app/[locale]/page.tsx */

import React from 'react';
import { MainHeader } from '../../components/main-header.apparatus';
import { HeroSection } from '../../components/hero-section.apparatus';
import { NeuralFooter } from '../../components/neural-footer.apparatus';
import { WebChatWidget } from '@omnisync/web-chat-ui';
import { TenantId } from '@omnisync/core-contracts';

/**
 * @name HomePage
 * @description Orquestador de nivel de página. Compone los aparatos atómicos
 * para construir la experiencia de usuario completa bajo visión ultra-holística.
 */
export default async function HomePage(): Promise<React.ReactNode> {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <MainHeader />

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        <HeroSection />

        {/* Espacio para el Widget de Prueba Interactivo */}
        <section className="w-full max-w-5xl px-10 pb-32">
           <div className="border border-border p-20 text-center italic opacity-20 text-xs tracking-widest uppercase">
             [ Neural Interface Placeholder ]
           </div>
        </section>

        {/* Decorativos de Grid Manus.io */}
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-border/40 -z-10" />
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-border/40 -z-10" />
      </main>

      <WebChatWidget tenantId={'00000000-0000-0000-0000-000000000000' as TenantId} />
      <NeuralFooter />
    </div>
  );
}
