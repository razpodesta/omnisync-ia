/** libs/core/auditor/src/lib/schemas/financial-ledger.schema.ts */

import { z } from 'zod';
import { TenantIdSchema } from '@omnisync/core-contracts';

/**
 * @name FinancialNotarizationSchema
 * @description Contrato maestro para el sellado de transacciones financieras.
 * Sincroniza la telemetría de tokens con el ADN de gobernanza cognitiva.
 */
export const FinancialNotarizationSchema = z.object({
  notarizationId: z.string().uuid(),
  tenantIdentifier: TenantIdSchema,
  traceId: z.string().uuid(),
  
  /** ADN del Consumo */
  ledgerEntry: z.object({
    model: z.string(),
    inputTokens: z.number().int().nonnegative(),
    outputTokens: z.number().int().nonnegative(),
    costUsd: z.number().nonnegative(),
    currency: z.literal('USD').default('USD'),
  }),

  /** Vínculo de Gobernanza (Ojos de Mosca) */
  governanceAnchor: z.object({
    promptChecksum: z.string().min(10), // Hash del prompt generado
    versionTag: z.string(),
  }),

  /** Metadatos de Infraestructura */
  forensicMetadata: z.object({
    engineVersion: z.literal('OEDP-V5.5-ELITE'),
    author: z.string(),
    nodeId: z.string(),
    isHighCostTransaction: z.boolean(),
  }),

  timestamp: z.string().datetime(),
}).readonly();

export type IFinancialNotarization = z.infer<typeof FinancialNotarizationSchema>;