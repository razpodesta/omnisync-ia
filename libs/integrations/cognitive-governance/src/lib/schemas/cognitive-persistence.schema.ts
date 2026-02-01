/** libs/integrations/cognitive-governance/src/lib/schemas/cognitive-persistence.schema.ts */

import { z } from 'zod';
import { TenantIdSchema } from '@omnisync/core-contracts';

/**
 * @name CognitivePersistenceHandshakeSchema
 * @description Define el contrato de ignición para la recuperación de conciencia.
 * Incluye parámetros de telemetría y flags de auditoría forense.
 */
export const CognitivePersistenceHandshakeSchema = z.object({
  tenantOrganizationIdentifier: TenantIdSchema,
  performanceOptions: z.object({
    bypassCache: z.boolean().default(false),
    cacheTtlSeconds: z.number().int().positive().default(300),
    enforceIntegrityCheck: z.boolean().default(true),
  }),
  auditTraceId: z.string().uuid().optional(),
}).readonly();

/**
 * @name ConscienceLayerAuditSchema
 * @description Valida el estado de una capa de persistencia individual.
 */
export const ConscienceLayerAuditSchema = z.object({
  layerIdentifier: z.enum(['L0_GENESIS', 'L1_RAM', 'L2_REDIS', 'L3_SQL']),
  latencyMs: z.number().nonnegative(),
  isHealthy: z.boolean(),
  dataFingerprint: z.string().optional(),
}).readonly();

export type ICognitivePersistenceHandshake = z.infer<typeof CognitivePersistenceHandshakeSchema>;
export type IConscienceLayerAudit = z.infer<typeof ConscienceLayerAuditSchema>;