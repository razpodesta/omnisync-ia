/** libs/core/contracts/src/lib/schemas/erp-integration.schema.ts */

import { z } from 'zod';
import { UserIdSchema } from './core-contracts.schema';

/**
 * @description Estado de sincronización entre Omnisync y el ERP.
 */
export const ERPSyncStatusSchema = z.enum(['SYNCED', 'PENDING', 'FAILED_RETRYING', 'MANUAL_INTERVENTION']);

/**
 * @description Interfaz que debe implementar cualquier adaptador de ERP.
 */
export interface IERPAdapter {
  readonly providerName: string;
  createTicket(data: unknown): Promise<{ externalId: string; status: string }>;
  validateCustomer(phone: string): Promise<{ exists: boolean; externalId?: string }>;
}

/**
 * @description Respuesta estandarizada tras una acción en el ERP.
 */
export const ERPActionResponseSchema = z.object({
  success: z.boolean(),
  externalId: z.string().optional(),
  syncStatus: ERPSyncStatusSchema,
  messageKey: z.string(),
  latencyInMilliseconds: z.number(),
}).readonly();

export type IERPActionResponse = z.infer<typeof ERPActionResponseSchema>;