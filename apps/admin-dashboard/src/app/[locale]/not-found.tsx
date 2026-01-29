/** apps/admin-dashboard/src/app/[locale]/not-found.tsx */

import React from 'react';
import { useTranslations } from 'next-intl';

/**
 * @name LocaleNotFound
 * @description Aparato de resiliencia para errores 404 dentro del contexto de idioma.
 */
export default function LocaleNotFound() {
  const translations = useTranslations('security.exceptions');

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-20 animate-in fade-in duration-1000">
      <section className="text-center space-y-8">
        <span className="text-[10px] font-black uppercase tracking-[0.8em] opacity-30">
          Error 404
        </span>
        <h1 className="text-6xl font-light tracking-tighter italic">
          Nodo <span className="font-bold not-italic">Inexistente.</span>
        </h1>
        <p className="text-[11px] uppercase tracking-widest opacity-50 max-w-md mx-auto">
          {translations('page_not_found_description')}
        </p>
        <div className="pt-12">
          <a
            href="/"
            className="text-[10px] font-bold uppercase tracking-[0.4em] border-b border-foreground pb-2 hover:opacity-50 transition-opacity"
          >
            Return to Genesis
          </a>
        </div>
      </section>
    </div>
  );
}
