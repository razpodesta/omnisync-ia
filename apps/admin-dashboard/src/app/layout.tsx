/** apps/admin-dashboard/src/app/layout.tsx */

import './global.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

/**
 * @name RootLayout
 * @description Layout principal de la aplicación. Configura i18n y el cascarón visual Manus-Style.
 */
export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <div className="main-wrapper">
            <header>
              <div className="text-lg font-bold tracking-tighter">OMNISYNC<span className="font-light">AI</span></div>
              <nav className="flex gap-8 text-[10px] uppercase tracking-widest font-bold">
                <a href="#" className="hover:opacity-50">Docs</a>
                <a href="#" className="hover:opacity-50">Status</a>
                <a href="#" className="border px-2 py-1">Login</a>
              </nav>
            </header>
            
            <main className="p-8">
              {children}
            </main>

            <footer>
              <div>© 2026 MetaShark Tech</div>
              <div className="flex gap-4">
                <span>Florianópolis, BR</span>
                <span>Cloud-Native Infrastructure</span>
              </div>
            </footer>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}