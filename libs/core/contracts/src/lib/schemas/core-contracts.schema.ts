/** libs/core/contracts/src/lib/schemas/core-contracts.schema.ts */

import { z } from 'zod';

/**
 * @section Branded Types (Tipado Nominal de Élite)
 * Evita errores lógicos al intercambiar identificadores.
 */
export const TenantIdSchema = z.string().uuid().brand<'TenantId'>();
export type TenantId = z.infer<typeof TenantIdSchema>;

export const UserIdSchema = z.string().min(5).brand<'UserId'>();
export type UserId = z.infer<typeof UserIdSchema>;

/**
 * @section Contratos de Identidad (Base)
 */
export const OmnisyncUserSchema = z
  .object({
    id: UserIdSchema,
    tenantId: TenantIdSchema,
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Formato E.164 obligatorio'),
    email: z.string().email().toLowerCase().trim(),
    metadata: z.record(z.string(), z.unknown()).default({}),
  })
  .readonly();

export type IOmnisyncUser = z.infer<typeof OmnisyncUserSchema>;

/**
 * @section Contratos de Inteligencia (IA/Gemini)
 */
export const AIResolutionStatusSchema = z.enum([
  'RESOLVED',
  'NEED_HUMAN',
  'NEED_MORE_INFO',
  'ESCALATED_TO_ERP',
]);

export const AIResponseSchema = z
  .object({
    conversationId: z.string().uuid(),
    suggestion: z.string().min(1),
    status: AIResolutionStatusSchema,
    confidenceScore: z.number().min(0).max(1),
    sourceManuals: z.array(z.string()).default([]),
  })
  .readonly();

export type IAIResponse = z.infer<typeof AIResponseSchema>;

/**
 * @section Contratos de Acción (ERP Integration)
 */
export const ERPTaskPrioritySchema = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
]);

export const ERPTicketSchema = z
  .object({
    externalId: z.string().optional(), // ID en el sistema del cliente
    userId: UserIdSchema,
    subject: z.string().min(10).max(200),
    description: z.string().min(20),
    priority: ERPTaskPrioritySchema.default('MEDIUM'),
    createdAt: z.string().datetime(),
  })
  .readonly();

export type IERPTicket = z.infer<typeof ERPTicketSchema>;
