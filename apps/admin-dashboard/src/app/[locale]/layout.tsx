/** apps/admin-dashboard/src/app/[locale]/layout.tsx */

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '../../i18n/routing';
import { notFound } from 'next/navigation';
import React from 'react';

/**
 * @section Inyección de Aparatos de Infraestructura UI
 */
import { ThemeProvider } from '../../components/providers/theme-provider.apparatus';
import { MainHeader } from '../../components/layout/main-header.apparatus';
import { NeuralFooter } from '../../components/layout/neural-footer.apparatus';

import '../../global.css';

/**
 * @interface ILocaleLayoutProperties
 * @description Definición de contrato para el orquestador maestro de página.
 * En Next.js 15+, 'params' es una Promesa que debe ser resuelta explícitamente.
 */
interface ILocaleLayoutProperties {
  readonly children: React.ReactNode;
  readonly params: Promise<{ locale: string }>;
}

/**
 * @name LocaleLayout
 * @description Orquestador maestro de la interfaz administrativa.
 * Implementa la inyección de contextos de soberanía lingüística (next-intl)
 * y cromática (next-themes), asegurando la coherencia del ADN visual
 * Obsidian & Milk en todo el árbol de componentes.
 *
 * @protocol OEDP-Level: Elite (Async Sovereignty V2.5)
 */
export default async function LocaleLayout(
  properties: ILocaleLayoutProperties
): Promise<React.ReactNode> {
  // 1. Resolución de Parámetros de Ruta (Next.js 15/16 Protocol)
  const { locale: localeIdentifier } = await properties.params;

  // 2. Validación de Soberanía Lingüística
  const supportedLocales: string[] = [...routing.locales];
  if (!supportedLocales.includes(localeIdentifier)) {
    notFound();
  }

  // 3. Hidratación de Diccionarios SSOT
  const localizedMessages = await getMessages();

  return (
    <html lang={localeIdentifier} suppressHydrationWarning className="border-foreground">
      <body className="bg-background dark:bg-background antialiased font-sans text-foreground overflow-x-hidden min-h-screen">

        {/**
         * @section Provisión de Contexto Internacionalizado
         * RESOLUCIÓN TS2322: Se asegura la entrega de 'children' bajo el estándar React 19.
         */}
        <NextIntlClientProvider locale={localeIdentifier} messages={localizedMessages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="main-wrapper transition-opacity duration-1000">
              {/* Bloque Superior Institucional */}
              <MainHeader />

              {/* Área de Ejecución de Vistas */}
              <main className="flex-1 w-full relative flex flex-col">
                {properties.children}
              </main>

              {/* Cierre Estructural y Telemetría Visual */}
              <NeuralFooter />
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>

      </body>
    </html>
  );
}
