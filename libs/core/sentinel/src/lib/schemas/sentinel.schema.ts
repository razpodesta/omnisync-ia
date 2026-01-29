/** libs/core/sentinel/src/lib/schemas/sentinel.schema.ts */

import { z } from 'zod';

export const SentinelSeveritySchema = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
]);

/**
 * @description Estructura de reporte de error inteligente.
 */
export const SentinelReportSchema = z.object({
  errorCode: z.string().regex(/^OS-[A-Z]+-\d{3}$/),
  severity: SentinelSeveritySchema,
  apparatus: z.string(),
  operation: z.string(),
  message: z.string(),
  stackTrace: z.string().optional(),
  // Contexto dinámico: Datos del usuario, estado de la IA o payload del ERP
  context: z.record(z.string(), z.unknown()),
  timestamp: z.string().datetime(),
  tenantId: z.string().uuid().optional(),
  isRecoverable: z.boolean().default(false),
});

export type ISentinelSeverity = z.infer<typeof SentinelSeveritySchema>;
export type ISentinelReport = z.infer<typeof SentinelReportSchema>;
