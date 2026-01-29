/** apps/admin-dashboard/src/middleware/geofencing.handler.ts */

import { NextRequest, NextResponse } from 'next/server';
import {
  GeoFencingConfigurationSchema,
  IGeoFencingConfiguration,
} from '@omnisync/core-security';

/**
 * @name geoFencingSecurityHandler
 * @description Aparato de protección territorial. Erradica el consumo innecesario de
 * tokens de IA mediante la validación de la región de origen contra un esquema de soberanía.
 *
 * @param {NextRequest} incomingRequest - Petición capturada por Vercel Edge.
 * @returns {NextResponse | null} Respuesta de bloqueo o null para continuar.
 */
export const geoFencingSecurityHandler = (
  incomingRequest: NextRequest,
): NextResponse | null => {
  // 🛡️ CONFIGURACIÓN DE ÉLITE (En producción, esto se recupera de un Remote Config o Variable de Entorno)
  const configurationRaw: unknown = {
    allowedCountryCodes: ['ES', 'BR', 'US', 'AR', 'MX', 'CO'],
    enforceInDevelopment: false,
  };

  // Validación de Integridad mediante el Esquema Atómico
  const securityConfiguration: IGeoFencingConfiguration =
    GeoFencingConfigurationSchema.parse(configurationRaw);

  const detectedCountry: string =
    incomingRequest.headers.get('x-vercel-ip-country') ?? 'XX';

  // Bypass para desarrollo según configuración del esquema
  if (
    process.env.NODE_ENV === 'development' &&
    !securityConfiguration.enforceInDevelopment
  ) {
    return null;
  }

  const isAccessGranted: boolean =
    securityConfiguration.allowedCountryCodes.includes(detectedCountry);

  if (!isAccessGranted) {
    /**
     * @section Respuesta de Seguridad Inmutable
     * Retorna un error 403 con estructura JSON semántica para que el frontend
     * o la IA consumidora entienda el motivo del rechazo.
     */
    return new NextResponse(
      JSON.stringify({
        errorCode: 'OS-SEC-403',
        regionDetected: detectedCountry,
        message: 'Acceso denegado por políticas de soberanía geográfica.',
      }),
      { status: 403, headers: { 'content-type': 'application/json' } },
    );
  }

  return null;
};
