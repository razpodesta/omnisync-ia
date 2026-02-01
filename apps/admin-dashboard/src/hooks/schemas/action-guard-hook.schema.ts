/** apps/admin-dashboard/src/hooks/schemas/action-guard-hook.schema.ts */

import { z } from 'zod';

/**
 * @name PendingActionEntrySchema
 * @description Contrato para una acción suspendida en la cola de aprobación.
 * Refleja el ADN del modelo físico ActionApprovalQueue para la capa UI.
 */
export const PendingActionEntrySchema = z.object({
  identifier: z.string().uuid(),
  tenantIdentifier: z.string().uuid(),
  originalIntentIdentifier: z.string(),
  actionCategory: z.enum(['ERP_TICKET_CREATE', 'CRM_LEAD_UPDATE', 'FINANCIAL_TRANSACTION']),
  proposedPayload: z.record(z.string(), z.unknown()),
  suspensionReason: z.string(),
  riskScore: z.number().min(0).max(100),
  createdAt: z.string().datetime(),
}).readonly();

/**
 * @name ActionDecisionSchema
 * @description Valida la intención de resolución del administrador.
 */
export const ActionDecisionSchema = z.object({
  actionIdentifier: z.string().uuid(),
  decision: z.enum(['APPROVED', 'REJECTED']),
  adminNote: z.string().max(500).optional(),
}).readonly();

/** @type IPendingActionEntry */
export type IPendingActionEntry = z.infer<typeof PendingActionEntrySchema>;
/** @type IActionDecision */
export type IActionDecision = z.infer<typeof ActionDecisionSchema>;