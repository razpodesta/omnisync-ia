/** apps/admin-dashboard/src/components/sections/schemas/health-monitor.schema.ts */

import { z } from 'zod';
import { TenantIdSchema } from '@omnisync/core-contracts';

/**
 * @name HealthMonitorConfigurationSchema
 * @description Define la estructura de propiedades para el aparato visual de salud.
 * Garantiza que el monitor reciba un TenantId válido y configuraciones de visibilidad.
 */
export const HealthMonitorConfigurationSchema = z.object({
  /** Identificador de soberanía del suscriptor */
  tenantId: TenantIdSchema,
  /** Permite ocultar/mostrar trazas técnicas para perfiles no-técnicos */
  isForensicViewEnabled: z.boolean().default(true),
  /** Variante estética para integración en diferentes layouts */
  layoutVariant: z.enum(['GRID', 'COMPACT', 'DETAILED']).default('GRID'),
}).readonly();

/** @type IHealthMonitorConfiguration */
export type IHealthMonitorConfiguration = z.infer<typeof HealthMonitorConfigurationSchema>;