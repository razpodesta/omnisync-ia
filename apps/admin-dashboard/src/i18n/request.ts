/** apps/admin-dashboard/src/i18n/request.ts */

import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

/**
 * @name getRequestConfig
 * @description Carga dinámica de mensajes basada en el locale de la petición.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../../../libs/core/security/src/lib/i18n/${locale}.json`)).default
  };
});