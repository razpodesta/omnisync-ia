import { z } from 'zod';

/**
 * @description Representación de un Partner (Cliente/Contacto) en Odoo
 */
export const OdooPartnerSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    email: z.string().email().nullable(),
    phone: z.string().nullable(),
    mobile: z.string().nullable(),
    comment: z.string().optional(),
  })
  .readonly();

/**
 * @description Representación de un Ticket de Soporte en Odoo
 */
export const OdooTicketSchema = z
  .object({
    id: z.number(),
    name: z.string(), // Asunto
    description: z.string().nullable(),
    partner_id: z.tuple([z.number(), z.string()]).optional(), // [ID, Name]
    priority: z.enum(['0', '1', '2', '3']), // 0: Low, 3: Urgent
    stage_id: z.tuple([z.number(), z.string()]).optional(),
  })
  .readonly();

export type IOdooPartner = z.infer<typeof OdooPartnerSchema>;
export type IOdooTicket = z.infer<typeof OdooTicketSchema>;
