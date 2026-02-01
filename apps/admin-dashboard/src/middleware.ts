/** apps/admin-dashboard/src/middleware.ts */

import { NextRequest, NextResponse } from 'next/server';
import { localeHandler } from './middleware/locale.handler';
import { geoFencingSecurityHandler } from './middleware/geofencing.handler';

/**
 * @name orchestrateAdministrativeDashboardTraffic
 * @description Orquestador maestro de peticiones en el Edge Runtime de Vercel. 
 * Implementa un pipeline secuencial de validación soberana: 
 * 1. Filtrado de Assets -> 2. Seguridad Geográfica -> 3. Resolución Lingüística.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Edge-Orchestration-Pipeline V3.6.4)
 * @vision Ultra-Holística: Zero-Latency-Filtering & Triage-Sovereignty
 */
export default function orchestrateAdministrativeDashboardTraffic(
  incomingRequest: NextRequest,
): NextResponse {
  const { pathname } = incomingRequest.nextUrl;

  /**
   * @section 1. Salvaguarda de Infraestructura (Early Exit)
   * Omitimos el procesamiento neural para archivos estáticos y rutas internas de Next.js.
   * Esto preserva la capacidad de cómputo del Edge para interacciones reales.
   */
  const isInternalRoute = pathname.startsWith('/_next') || pathname.startsWith('/api');
  const isStaticAsset = pathname.includes('.') || pathname.endsWith('/favicon.ico');

  if (isInternalRoute || isStaticAsset) {
    return NextResponse.next();
  }

  /**
   * @section 2. Fase de Seguridad Territorial (Geofencing)
   * El controlador de geofencing valida la IP del usuario contra la lista de regiones autorizadas.
   * Si se detecta una violación de soberanía, retorna una redirección a /unauthorized.
   */
  const securityResponse: NextResponse | null =
    geoFencingSecurityHandler(incomingRequest);

  // Si la seguridad emite un bloqueo (redirección), cortamos la cadena inmediatamente.
  if (securityResponse) {
    return securityResponse;
  }

  /**
   * @section 3. Fase de Resolución Semántica (Locales)
   * Si el acceso es autorizado, el localeHandler determina el idioma óptimo 
   * basándose en la URL o las cabeceras del navegador (Accept-Language).
   */
  return localeHandler(incomingRequest);
}

/**
 * @description Configuración de Matcher para el motor de Next.js.
 * Define las fronteras de ejecución del Middleware.
 */
export const config = {
  matcher: [
    /**
     * Captura todas las rutas excepto:
     * - api (rutas de servidor)
     * - _next/static (assets compilados)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, sitemap.xml, robots.txt (metadatos)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};