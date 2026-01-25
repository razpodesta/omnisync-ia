/** libs/core/telemetry/src/lib/schemas/telemetry.schema.ts */

import { z } from 'zod';

/**
 * @description Niveles de severidad y verbosidad para el ecosistema Omnisync.
 */
export const OmnisyncTelemetryLevelSchema = z.enum([
  'INFORMATION',
  'WARNING',
  'ERROR',
  'PERFORMANCE',
  'VERBOSE' // Para observabilidad ultra-detallada
]);

/**
 * @description Esquema de validación para una entrada de telemetría de élite.
 */
export const OmnisyncTelemetryEntrySchema = z.object({
  timestamp: z.string().datetime(),
  apparatus: z.string().min(2),
  operation: z.string().min(2),
  level: OmnisyncTelemetryLevelSchema,
  messageKey: z.string(),
  durationInMilliseconds: z.string().optional(),
  // Metadata enriquecida para IA (tokens) o ERP (status codes)
  metadata: z.record(z.string(), z.unknown()).optional(),
  // Identificador único para seguimiento de flujo (Distributed Tracing ready)
  traceId: z.string().uuid().optional(),
});

export type IOmnisyncTelemetryLevel = z.infer<typeof OmnisyncTelemetryLevelSchema>;
export type IOmnisyncTelemetryEntry = z.infer<typeof OmnisyncTelemetryEntrySchema>;