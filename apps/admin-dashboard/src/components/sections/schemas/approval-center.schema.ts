/** apps/admin-dashboard/src/components/sections/schemas/approval-center.schema.ts */

import { z } from 'zod';
import { TenantIdSchema } from '@omnisync/core-contracts';

/**
 * @name ApprovalCenterConfigurationSchema
 * @description Define las leyes de visualización para la terminal de sanciones.
 */
export const ApprovalCenterConfigurationSchema = z.object({
  tenantId: TenantIdSchema,
  /** Permite filtrar por nivel de riesgo detectado */
  riskFilterThreshold: z.number().min(0).max(100).default(0),
  /** Habilita la visualización de firmas criptográficas */
  isForensicModeActive: z.boolean().default(true),
  /** Tiempo de refresco automático del pulso de la cola */
  refreshIntervalMs: z.number().default(30000),
}).readonly();

export type IApprovalCenterConfiguration = z.infer<typeof ApprovalCenterConfigurationSchema>;