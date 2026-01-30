/** libs/domain/tenants/src/lib/schemas/tenant-manager.schema.ts */

import { z } from 'zod';

/**
 * @name TenantResolutionContextSchema
 * @description Valida la integridad de los parámetros de búsqueda de nodos.
 * Erradica inyecciones o formatos malformados antes de tocar la persistencia.
 */
export const TenantResolutionContextSchema = z.object({
  /** El slug debe ser minúscula, alfanumérico y con guiones */
  urlSlug: z.string().lowercase().trim().regex(/^[a-z0-9-]+$/).min(3).max(50),
  /** Identificador de rastreo opcional para telemetría */
  traceOrigin: z.string().optional(),
}).readonly();

/**
 * @name TenantOperationalStatusContextSchema
 * @description Contrato para la verificación de salud operativa.
 */
export const TenantOperationalStatusContextSchema = z.object({
  isNodeActive: z.boolean(),
  currentPhase: z.string(),
  lastCheck: z.string().datetime(),
}).readonly();

export type ITenantResolutionContext = z.infer<typeof TenantResolutionContextSchema>;
export type ITenantOperationalStatusContext = z.infer<typeof TenantOperationalStatusContextSchema>;