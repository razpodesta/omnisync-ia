/** apps/admin-dashboard/src/components/layout/schemas/neural-footer.schema.ts */

import { z } from 'zod';

/**
 * @name NeuralFooterConfigurationSchema
 * @description Contrato maestro para la configuración del footer institucional.
 * Define la estructura de metadatos forenses, enlaces de red y estados de infraestructura.
 */
export const NeuralFooterConfigurationSchema = z.object({
  /** Versión actual del sistema (ej: V2.5.0-ELITE) */
  systemVersion: z.string().min(1),

  /** Identificador de autoría técnica */
  authorTag: z.string().min(2),

  /** Estado de salud de la red neural reflejado en la UI */
  operationalStatus: z.enum(['CORE_OPERATIONAL', 'MAINTENANCE', 'DEGRADED']),

  /** Mapa de navegación granular dividido por categorías */
  navigationSectors: z.array(z.object({
    sectorTitleKey: z.string(),
    links: z.array(z.object({
      labelKey: z.string(),
      href: z.string(),
    }))
  })).min(1),

  /** Datos de geofencing visual */
  locationTrace: z.object({
    city: z.string(),
    countryCode: z.string().length(2),
  })
}).readonly();

/** @type INeuralFooterConfiguration */
export type INeuralFooterConfiguration = z.infer<typeof NeuralFooterConfigurationSchema>;
