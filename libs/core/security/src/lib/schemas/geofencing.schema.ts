/** libs/core/security/src/lib/schemas/geofencing.schema.ts */

import { z } from 'zod';

/**
 * @name GeoFencingConfigurationSchema
 * @description Esquema de validación para la configuración de soberanía territorial.
 * Define las fronteras legales y operativas de acceso al ecosistema.
 */
export const GeoFencingConfigurationSchema = z.object({
  /** Lista de códigos de país ISO 3166-1 alpha-2 autorizados */
  allowedCountryCodes: z.array(z.string().length(2).toUpperCase()),
  /** Interruptor de seguridad para entornos locales de ingeniería */
  enforceInDevelopment: z.boolean().default(false),
  /** Ruta de redirección institucional para accesos denegados */
  redirectionPath: z.string().optional(),
}).readonly();

/** Tipo inferido para consumo en el Middleware y Orquestadores */
export type IGeoFencingConfiguration = z.infer<typeof GeoFencingConfigurationSchema>;