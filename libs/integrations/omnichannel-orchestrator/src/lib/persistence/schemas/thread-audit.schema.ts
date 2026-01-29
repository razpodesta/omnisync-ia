/** libs/integrations/omnichannel-orchestrator/src/lib/persistence/schemas/thread-audit.schema.ts */

import { z } from 'zod';
import { TenantIdSchema, ChannelTypeSchema } from '@omnisync/core-contracts';

/**
 * @name ThreadAuditEntrySchema
 * @description Contrato maestro para el registro inmutable de interacciones (Audit Trail).
 * Sincronizado V2.1: Implementa transformación defensiva para la soberanía del rol.
 */
export const ThreadAuditEntrySchema = z
  .object({
    intentIdentifier: z.string().uuid(),
    externalUserIdentifier: z.string().min(5),
    tenantOrganizationIdentifier: TenantIdSchema,
    textualContent: z.string().min(1),
    originChannel: ChannelTypeSchema,
    /**
     * NIVELACIÓN: Transformación automática para garantizar que el autorRole
     * cumpla con el literal del sistema.
     */
    authorRole: z
      .enum(['USER', 'ASSISTANT', 'SYSTEM'])
      .catch('USER') // Fallback automático si el valor de la DB es inválido
      .default('USER'),
    auditMetadata: z.record(z.string(), z.unknown()).default({}),
    createdAt: z.string().datetime().optional(),
  })
  .readonly();

export type IThreadAuditEntry = z.infer<typeof ThreadAuditEntrySchema>;
