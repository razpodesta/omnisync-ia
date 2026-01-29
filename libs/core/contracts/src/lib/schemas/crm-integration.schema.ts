/** libs/core/contracts/src/lib/schemas/crm-integration.schema.ts */

import { z } from 'zod';

/**
 * @name CustomerProfileSchema
 * @description Esquema de validación para el perfil normalizado del cliente.
 */
export const CustomerProfileSchema = z
  .object({
    externalId: z.string(),
    name: z.string(),
    email: z.string().email().optional(),
    phone: z.string(),
    tier: z.enum(['BASIC', 'GOLD', 'PLATINUM']).default('BASIC'),
    activeTickets: z.number().default(0),
    metadata: z.record(z.string(), z.unknown()),
  })
  .readonly();

/** @type ICustomerProfile */
export type ICustomerProfile = z.infer<typeof CustomerProfileSchema>;

/**
 * @name ICRMAdapter
 * @description Interfaz de contrato para adaptadores de CRM.
 * Define el estándar de comunicación con bases de datos de clientes externas o internas.
 */
export interface ICRMAdapter {
  readonly providerName: string;

  /**
   * @method getCustomerByPhone
   * @description Localiza a un cliente en el sistema CRM mediante su número telefónico.
   */
  getCustomerByPhone(phoneNumber: string): Promise<ICustomerProfile | null>;
}
