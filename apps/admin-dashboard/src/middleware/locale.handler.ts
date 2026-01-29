/** apps/admin-dashboard/src/middleware/locale.handler.ts */

import createMiddleware from 'next-intl/middleware';
import { routing } from '../i18n/routing';

/**
 * @name localeHandler
 * @description Maneja la detección de idioma y redirección de rutas.
 */
export const localeHandler = createMiddleware(routing);
