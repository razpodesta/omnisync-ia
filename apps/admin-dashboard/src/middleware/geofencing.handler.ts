/** apps/admin-dashboard/src/middleware/geofencing.handler.ts */

import { NextRequest, NextResponse } from 'next/server';
import {
  GeoFencingConfigurationSchema,
  IGeoFencingConfiguration,
} from '@omnisync/core-security';

/**
 * @name geoFencingSecurityHandler
 * @description Aparato de protección territorial ejecutado en el borde (Edge).
 * Orquesta la validación de soberanía geográfica para proteger los recursos
 * cognitivos y operativos del ecosistema.
 *
 * @protocol OEDP-Level: Elite (Edge-Sovereignty V2.6)
 */
export const geoFencingSecurityHandler = (
  incomingRequest: NextRequest,
): NextResponse | null => {
  const { pathname } = incomingRequest.nextUrl;

  /**
   * @section Salvaguarda de Infraestructura
   * Permitimos el acceso a la página de error y assets para evitar bucles infinitos
   * o fallos de renderizado en la vista de bloqueo.
   */
  if (
    pathname.includes('/unauthorized') || 
    pathname.includes('.') || 
    pathname.startsWith('/_next')
  ) {
    return null;
  }

  // 1. Hidratación de Configuración desde el Entorno Cloud
  const configurationRaw: unknown = {
    allowedCountryCodes: (process.env['ALLOWED_COUNTRY_CODES'] || 'ES,BR,US,AR,MX,CO').split(','),
    enforceInDevelopment: process.env['ENFORCE_GEOFENCING_DEV'] === 'true',
  };

  // 2. Validación de ADN de Seguridad (SSOT)
  const securityConfiguration: IGeoFencingConfiguration =
    GeoFencingConfigurationSchema.parse(configurationRaw);

  /**
   * @section Resolución de Ubicación
   * Extraemos el código de país inyectado por el proxy de Vercel.
   */
  const detectedCountry: string =
    incomingRequest.headers.get('x-vercel-ip-country') ?? 'XX';

  // Bypass para ingeniería local si la configuración lo permite
  if (
    process.env['NODE_ENV'] === 'development' &&
    !securityConfiguration.enforceInDevelopment
  ) {
    return null;
  }

  const isAccessGranted: boolean =
    securityConfiguration.allowedCountryCodes.includes(detectedCountry);

  if (!isAccessGranted) {
    /**
     * @section Protocolo de Bloqueo Inteligente
     * Si la petición espera HTML (navegación), redirigimos a la UI de bloqueo.
     * Si es una petición de datos (fetch/API), retornamos el error 403 semántico.
     */
    const acceptsHtml = incomingRequest.headers.get('accept')?.includes('text/html');

    if (acceptsHtml) {
      // Intentamos preservar el locale actual o degradamos a español
      const locale = pathname.split('/')[1] || 'es';
      const unauthorizedUrl = new URL(`/${locale}/unauthorized`, incomingRequest.url);
      
      return NextResponse.redirect(unauthorizedUrl);
    }

    return new NextResponse(
      JSON.stringify({
        errorCode: 'OS-SEC-403',
        regionDetected: detectedCountry,
        message: 'Acceso denegado: Violación de soberanía territorial.',
        traceId: crypto.randomUUID().substring(0, 8),
      }),
      { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      },
    );
  }

  return null;
};