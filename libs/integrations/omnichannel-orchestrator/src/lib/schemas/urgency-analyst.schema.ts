/** libs/integrations/omnichannel-orchestrator/src/lib/schemas/urgency-analyst.schema.ts */

import { z } from 'zod';

/**
 * @name UrgencyReportSchema
 * @description Contrato inmutable que define el resultado de la auditoría de criticidad.
 * Proporciona métricas para que el Sentinel y el ERP decidan la prioridad de acción.
 */
export const UrgencyReportSchema = z
  .object({
    /** Indica si se detectó un pulso de urgencia que requiere atención inmediata */
    isUrgent: z.boolean(),
    /** Score matemático de 0 a 100 basado en densidad semántica */
    score: z.number().min(0).max(100),
    /** Taxonomía de prioridad institucional */
    level: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    /** Lista de términos detectados (para auditoría forense) */
    matchedKeywords: z.array(z.string()),
  })
  .readonly();

export type IUrgencyReport = z.infer<typeof UrgencyReportSchema>;
