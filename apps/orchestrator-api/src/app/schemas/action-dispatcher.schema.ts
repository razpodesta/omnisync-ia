/** apps/orchestrator-api/src/app/schemas/action-dispatcher.schema.ts */

import { z } from 'zod';
import { TenantIdSchema, ERPTaskPrioritySchema } from '@omnisync/core-contracts';

/**
 * @name DigitalSanctionSchema
 * @description Sello de autoridad humana para mutaciones ERP.
 * Implementa el enlace biyectivo con el ADN instruccional.
 */
export const DigitalSanctionSchema = z.object({
  adminIdentifier: z.string().min(5),
  signatureHash: z.string().min(64), // Hash de la firma digital
  /** 
   * @section Sello Biyectivo V5.5
   * approvedPayloadHash: SHA-256 del contenido sugerido por la IA.
   * governanceVersionSeal: Sello de la versión de prompt (vX.X.X) utilizada.
   */
  approvedPayloadHash: z.string().min(64),
  governanceVersionSeal: z.string().min(3),
  sanctionTimestamp: z.string().datetime(),
}).readonly();

/**
 * @name ActionRiskAssessmentSchema
 * @description Resultado del triaje multifocal "Ojos de Mosca".
 */
export const ActionRiskAssessmentSchema = z.object({
  riskScore: z.number().min(0).max(100),
  riskLevel: z.enum(['SAFE', 'CAUTION', 'CRITICAL_BLOCK']),
  mitigationStrategy: z.enum(['AUTO_EXECUTE', 'WAIT_FOR_HUMAN', 'HARD_REJECT']),
  /** Visión Financiera */
  financialImpactUsd: z.number().nonnegative(),
  /** Latencia Proyectada */
  estimatedLatencyMs: z.number().nonnegative(),
}).readonly();

export const ActionDispatchContextSchema = z.object({
  tenantId: TenantIdSchema,
  intentId: z.string().uuid(),
  category: z.enum(['ERP_TICKET_CREATE', 'CRM_LEAD_UPDATE', 'FINANCIAL_TRANSACTION']),
  payload: z.record(z.string(), z.unknown()),
  sanction: DigitalSanctionSchema.optional(),
  priority: ERPTaskPrioritySchema.default('MEDIUM'),
  auditTraceId: z.string().uuid(),
}).readonly();

export type IDigitalSanction = z.infer<typeof DigitalSanctionSchema>;
export type IActionRiskAssessment = z.infer<typeof ActionRiskAssessmentSchema>;
export type IActionDispatchContext = z.infer<typeof ActionDispatchContextSchema>;