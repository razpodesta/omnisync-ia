/** libs/integrations/erp-odoo/src/lib/schemas/odoo-integration.schema.ts */

import { z } from 'zod';

/**
 * @name OdooConnectionConfigurationSchema
 * @description Define los requisitos de infraestructura para el cluster Odoo Online.
 */
export const OdooConnectionConfigurationSchema = z.object({
  baseUrl: z.string().url({ message: 'URL de instancia Odoo inválida.' }),
  databaseName: z.string().min(1, { message: 'Nombre de base de datos requerido.' }),
  userLoginEmail: z.string().email({ message: 'Email de autenticación inválido.' }),
  secretApiKey: z.string().min(1, { message: 'Odoo API Key es obligatoria.' }),
}).readonly();

/**
 * @name OdooTicketPayloadSchema
 * @description Contrato inmutable para la estructura 'helpdesk.ticket' en Odoo.
 * Utiliza los nombres de campos técnicos del ORM de Odoo (v16-v18).
 */
export const OdooTicketPayloadSchema = z.object({
  name: z.string().min(5),
  description: z.string().min(10),
  partner_id: z.union([z.number(), z.boolean()]),
  priority: z.enum(['0', '1', '2', '3']),
  team_id: z.number().optional(),
}).readonly();

export type IOdooConnectionConfiguration = z.infer<typeof OdooConnectionConfigurationSchema>;
export type IOdooTicketPayload = z.infer<typeof OdooTicketPayloadSchema>;
