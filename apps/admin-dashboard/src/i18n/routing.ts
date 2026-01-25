/** apps/admin-dashboard/src/i18n/routing.ts */

import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

/**
 * @name routing
 * @description Configuración central de rutas para el ecosistema Omnisync.
 */
export const routing = defineRouting({
  locales: ['es', 'en', 'pt'],
  defaultLocale: 'es',
  localePrefix: 'always', // Fuerza el locale en la URL para SEO y claridad
  localeDetection: true   // Activa la detección automática por navegador
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);