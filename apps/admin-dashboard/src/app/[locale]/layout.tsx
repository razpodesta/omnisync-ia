/** apps/admin-dashboard/src/app/[locale]/layout.tsx */

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '../../i18n/routing';
import { notFound } from 'next/navigation';
import React from 'react';
import { ThemeProvider } from '../../components/providers/theme-provider.apparatus';
import { MainHeader } from '../../components/layout/main-header.apparatus';
import { NeuralFooter } from '../../components/layout/neural-footer.apparatus';
import '../../global.css';

interface LocaleLayoutProperties {
  readonly children: React.ReactNode;
  readonly params: Promise<{ locale: string }>;
}

/**
 * @name LocaleLayout
 * @description Orquestador maestro de la interfaz. Implementa la arquitectura 
 * de inyección de contexto para Idioma (next-intl) y Tema (next-themes).
 */
export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProperties): Promise<React.ReactNode> {
  const { locale } = await params;

  // Validación de Soberanía Lingüística
  const supportedLanguageLocales: ReadonlyArray<string> = routing.locales;
  if (!supportedLanguageLocales.includes(locale)) {
    notFound();
  }

  const localizedMessages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className="border-foreground">
      <body className="bg-background dark:bg-background antialiased font-sans text-foreground overflow-x-hidden min-h-screen">
        <NextIntlClientProvider locale={locale} messages={localizedMessages}>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="system" 
            enableSystem 
            disableTransitionOnChange
          >
            <div className="main-wrapper transition-opacity duration-1000">
              <MainHeader />
              
              <main className="flex-1 w-full relative flex flex-col">
                {children}
              </main>

              <NeuralFooter />
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}