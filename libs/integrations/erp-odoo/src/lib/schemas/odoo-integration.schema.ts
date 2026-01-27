/** libs/integrations/erp-odoo/src/lib/schemas/odoo-integration.schema.ts */

import { z } from 'zod';

/**
 * @name OdooTechnicalIdentifier
 * @description Branded type para identificadores numéricos nativos de Odoo.
 */
export type OdooTechnicalIdentifier = number & { readonly __brand: 'OdooTechnicalIdentifier' };

/**
 * @name OdooConnectionConfigurationSchema
 * @description Esquema de validación para la infraestructura de conexión con Odoo Online.
 */
export const OdooConnectionConfigurationSchema = z.object({
  baseUrl: z.string().url({ message: 'URL de instancia Odoo inválida.' }),
  databaseName: z.string().min(1, { message: 'Nombre de base de datos requerido.' }),
  userLoginEmail: z.string().email({ message: 'Email de autenticación inválido.' }),
  secretApiKey: z.string().min(1, { message: 'Odoo API Key es obligatoria.' }),
}).readonly();

/**
 * @name OdooTicketProvisioningSchema
 * @description Estructura para la creación de helpdesk.ticket alineada al ERP.
 */
export const OdooTicketProvisioningSchema = z.object({
  subject: z.string().min(10),
  description: z.string().min(20),
  partnerIdentifier: z.number().int().positive().optional(),
  priority: z.enum(['0', '1', '2', '3']).default('1'), // 0: Low, 3: Urgent
  teamIdentifier: z.number().int().optional(),
}).readonly();

export type IOdooConnectionConfiguration = z.infer<typeof OdooConnectionConfigurationSchema>;
export type IOdooTicketProvisioning = z.infer<typeof OdooTicketProvisioningSchema>;
