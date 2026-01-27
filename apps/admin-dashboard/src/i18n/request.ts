/** apps/admin-dashboard/src/i18n/request.ts */

import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

/**
 * @type SupportedLocale
 * @description Inferencia del conjunto de idiomas autorizados por la arquitectura.
 */
type SupportedLocale = (typeof routing.locales)[number];

/**
 * @name getRequestConfig
 * @description Aparato de configuración de peticiones para internacionalización.
 * Orquesta la carga dinámica de diccionarios basados en la soberanía lingüística
 * detectada por el middleware.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  /**
   * @section Resolución de Identidad Lingüística
   */
  let localeIdentifier = await requestLocale;

  // Validación de integridad: Si el locale no está soportado, se degrada al valor por defecto.
  if (!localeIdentifier || !routing.locales.includes(localeIdentifier as SupportedLocale)) {
    localeIdentifier = routing.defaultLocale;
  }

  return {
    locale: localeIdentifier,
    /**
     * @note Carga Dinámica de ADN Lingüístico
     * Los diccionarios se importan desde la capa core de seguridad (SSOT).
     */
    messages: (
      await import(
        `../../../../libs/core/security/src/lib/i18n/${localeIdentifier}.json`
      )
    ).default,
  };
});
