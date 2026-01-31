/** libs/domain/tenants/src/lib/schemas/identity-resolver.schema.ts */

import { z } from 'zod';
import { CustomerProfileSchema } from '@omnisync/core-contracts';

/**
 * @name IdentityResolutionRequestSchema
 * @description Valida la entrada técnica para la localización de un cliente.
 */
export const IdentityResolutionRequestSchema = z.object({
  userPhoneNumber: z.string().min(8).regex(/^\+?[1-9]\d{1,14}$/, 'Formato E.164 obligatorio'),
}).readonly();

/**
 * @name IdentityResolutionResponseSchema
 * @description Sella el ADN del perfil recuperado para asegurar consistencia en el Hub.
 */
export const IdentityResolutionResponseSchema = CustomerProfileSchema.readonly();

export type IIdentityResolutionRequest = z.infer<typeof IdentityResolutionRequestSchema>;