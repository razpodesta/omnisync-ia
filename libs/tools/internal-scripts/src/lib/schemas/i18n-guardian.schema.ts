/** libs/tools/internal-scripts/src/lib/schemas/i18n-guardian.schema.ts */

import { z } from 'zod';

export const I18nAnomalyTypeSchema = z.enum([
  'MISSING_FILE', 
  'KEY_MISMATCH', 
  'EMPTY_CONTENT', 
  'INVALID_JSON'
]);

export const I18nAnomalySchema = z.object({
  apparatusIdentifier: z.string(),
  targetLocale: z.string(),
  namespace: z.string(),
  severity: z.enum(['CRITICAL', 'WARNING']),
  anomalyType: I18nAnomalyTypeSchema,
  technicalDetails: z.string(),
}).readonly();

export const I18nIntegrityReportSchema = z.object({
  reportIdentifier: z.string().uuid(),
  timestamp: z.string().datetime(),
  isSymmetric: z.boolean(),
  auditedNamespacesCount: z.number(),
  anomalies: z.array(I18nAnomalySchema),
  aiContext: z.object({
    summary: z.string(),
    remediationPath: z.string()
  })
}).readonly();

export type II18nAnomaly = z.infer<typeof I18nAnomalySchema>;
export type II18nIntegrityReport = z.infer<typeof I18nIntegrityReportSchema>;