/** apps/admin-dashboard/src/middleware.ts */

import { NextRequest, NextResponse } from 'next/server';
import { localeHandler } from './middleware/locale.handler';
import { geoFencingSecurityHandler } from './middleware/geofencing.handler';

/**
 * @name orchestrateAdministrativeDashboardTraffic
 * @description Orquestador maestro de peticiones en el Edge. Implementa un pipeline
 * secuencial de validación: Seguridad Geográfica -> Resolución Lingüística.
 *
 * @param {NextRequest} incomingRequest - La petición capturada por el motor de Next.js.
 */
export default function orchestrateAdministrativeDashboardTraffic(
  incomingRequest: NextRequest
): NextResponse {

  // 1. Fase de Seguridad: Geofencing
  // Bloquea el consumo de tokens si la IP no es de una región autorizada.
  const securityResponse: NextResponse | null = geoFencingSecurityHandler(incomingRequest);
  if (securityResponse) return securityResponse;

  // 2. Fase de Localización: Locale Resolution
  // Si la seguridad permite el paso, resolvemos el idioma.
  return localeHandler(incomingRequest);
}

export const config = {
  matcher: [
    '/',
    '/(es|en|pt)/:path*',
    /* Excluye archivos internos y assets estáticos */
    '/((?!api|_next|_vercel|[\\w-]+\\.\\w+).*)'
  ]
};
