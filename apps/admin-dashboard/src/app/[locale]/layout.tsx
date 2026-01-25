/** apps/admin-dashboard/src/app/[locale]/layout.tsx */

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '../../i18n/routing';
import { notFound } from 'next/navigation';
import React from 'react';
import '../../global.css';

/**
 * @interface LocaleLayoutProperties
 * @description Estructura de propiedades para el layout de internacionalización.
 */
interface LocaleLayoutProperties {
  /** Componentes hijos a renderizar dentro del contexto de idioma */
  readonly children: React.ReactNode;
  /** Parámetros de ruta que contienen el identificador de idioma */
  readonly params: Promise<{ locale: string }>;
}

/**
 * @name LocaleLayout
 * @description Aparato de interfaz de usuario de nivel superior. Configura el entorno 
 * de internacionalización y establece la identidad visual "Obsidian & Milk" (Manus.io Style).
 * Garantiza que el Header, Footer y el contenedor principal sigan las reglas de diseño de élite.
 */
export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProperties): Promise<JSX.Element> {
  const { locale } = await params;

  // Validación de integridad del identificador de idioma (Sustituye al tipo 'any')
  const isValidLocale: boolean = routing.locales.some((supportedLocale) => supportedLocale === locale);

  if (!isValidLocale) {
    notFound();
  }

  const localizedMessages = await getMessages();

  return (
    <html lang={locale} className="selection:bg-black selection:text-white">
      <body className="bg-white dark:bg-black antialiased font-sans text-black dark:text-white overflow-x-hidden">
        <NextIntlClientProvider locale={locale} messages={localizedMessages}>
          <div className="main-wrapper border-x border-border max-w-[1440px] mx-auto min-h-screen flex flex-col transition-opacity duration-1000">
            
            {/* Header de Élite (Manus.io Signature) */}
            <header className="border-b border-border p-8 flex justify-between items-center bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-50">
              <div className="text-xl font-black tracking-tighter uppercase">
                Omnisync <span className="font-thin opacity-50">Neural Hub</span>
              </div>
              <nav className="flex gap-12 text-[10px] font-bold uppercase tracking-[0.3em]">
                <a href={`/${locale}/dashboard`} className="hover:opacity-40 transition-opacity">Dashboard</a>
                <a href={`/${locale}/knowledge`} className="hover:opacity-40 transition-opacity">Knowledge</a>
                <a href="#" className="border border-black dark:border-white px-4 py-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                  Session
                </a>
              </nav>
            </header>
            
            {/* Contenedor de Ejecución de Aplicación */}
            <main className="flex-1 w-full relative">
              {children}
            </main>

            {/* Footer de Élite (Soberanía Técnica) */}
            <footer className="border-t border-border p-12 flex justify-between items-end bg-neutral-50 dark:bg-neutral-900/50">
              <div className="space-y-2">
                <div className="text-[11px] font-black uppercase tracking-[0.4em]">Omnisync-AI v1.0</div>
                <div className="text-[9px] uppercase tracking-widest opacity-30 italic">Developed by MetaShark Tech Cloud Architecture</div>
              </div>
              <div className="text-[9px] font-medium uppercase tracking-[0.2em] opacity-40">
                Florianópolis, BR // © 2026 // No Licensed
              </div>
            </footer>

          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}