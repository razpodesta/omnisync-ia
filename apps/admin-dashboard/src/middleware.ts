/** apps/admin-dashboard/src/middleware.ts */

import { NextRequest } from 'next/server';
import { localeHandler } from './middleware/locale.handler';

/**
 * @name middleware
 * @description Orquestador de peticiones. Ejecuta los handlers atómicos.
 */
export default function middleware(request: NextRequest) {
  // 1. Ejecución del Handler de i18n (Prioridad: Browser Locale)
  return localeHandler(request);
}

export const config = {
  // Matcher de Élite: Ignora archivos estáticos, api y favicons
  matcher: ['/', '/(es|en|pt)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};