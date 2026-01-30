/** apps/admin-dashboard/src/app/[locale]/unauthorized/schemas/unauthorized.schema.ts */

import { z } from 'zod';

/**
 * @name UnauthorizedPageContextSchema
 * @description Define la estructura de metadatos para la vista de bloqueo geográfico.
 * Sincronizado con el error OS-SEC-403 del Sentinel.
 */
export const UnauthorizedPageContextSchema = z.object({
  /** Código de error institucional */
  internalErrorCode: z.string().default('OS-SEC-403'),
  /** Categoría de la violación de seguridad */
  breachCategory: z.enum(['GEOFENCING_RESTRICTION', 'IP_REPUTATION_BLOCK', 'TOKEN_SOVEREIGNTY']),
  /** Identificador de la región detectada (ISO 3166-1) */
  detectedRegionCode: z.string().length(2).default('XX'),
  /** Interruptor para mostrar trazabilidad técnica */
  isForensicTraceVisible: z.boolean().default(true),
}).readonly();

/** @type IUnauthorizedPageContext */
export type IUnauthorizedPageContext = z.infer<typeof UnauthorizedPageContextSchema>;
