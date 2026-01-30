/** libs/integrations/erp-orchestrator/src/lib/schemas/erp-orchestrator.schema.ts */

import { z } from 'zod';
import { ERPTicketSchema } from '@omnisync/core-contracts';

/**
 * @name ERPTicketProvisioningContextSchema
 * @description Valida el contexto necesario para aprovisionar un ticket.
 */
export const ERPTicketProvisioningContextSchema = ERPTicketSchema.readonly();

/**
 * @name IdentityVerificationContextSchema
 * @description Valida la entrada para la verificación de soberanía de identidad.
 */
export const IdentityVerificationContextSchema = z.object({
  customerPhoneNumberIdentifier: z.string().min(8).regex(/^\+?[1-9]\d{1,14}$/),
}).readonly();

export type IERPTicketProvisioningContext = z.infer<typeof ERPTicketProvisioningContextSchema>;
export type IIdentityVerificationContext = z.infer<typeof IdentityVerificationContextSchema>;