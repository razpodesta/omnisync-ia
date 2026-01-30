/** libs/core/auditor/src/lib/ai-usage-auditor.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncContracts, TenantId } from '@omnisync/core-contracts';
import { AIUsageAuditRecordSchema, IAIUsageAuditRecord } from './schemas/ai-usage-auditor.schema';
import { TokenPricingApparatus } from './token-pricing.apparatus';
import { FinancialLedgerApparatus } from './financial-ledger.apparatus';

/**
 * @name AIUsageAuditor
 * @description Nodo maestro de Soberanía Financiera. 
 * Orquesta el triaje de tokens, cálculo de costos y registro legal de consumo.
 * 
 * @protocol OEDP-Level: Elite (Atomized-Financial-Orchestration V3.0)
 */
export class AIUsageAuditor {
  /**
   * @method auditInferenceConsumption
   * @description Punto de entrada para el registro de gastos de IA.
   */
  public static async auditInferenceConsumption(payload: {
    tenantId: TenantId;
    traceId: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
  }): Promise<IAIUsageAuditRecord> {
    const apparatusName = 'AIUsageAuditor';

    return await OmnisyncTelemetry.traceExecution(apparatusName, 'auditConsumption', async () => {
      // 1. Cálculo mediante Especialista
      const cost = TokenPricingApparatus.calculateCost(payload.model, payload.inputTokens, payload.outputTokens);
      
      // 2. Validación de ADN de Auditoría (SSOT)
      const auditRecord: IAIUsageAuditRecord = OmnisyncContracts.validate(AIUsageAuditRecordSchema, {
        id: crypto.randomUUID(),
        tenantId: payload.tenantId,
        traceId: payload.traceId,
        modelIdentifier: payload.model,
        usageMetrics: {
          inputTokens: payload.inputTokens,
          outputTokens: payload.outputTokens,
          totalTokens: payload.inputTokens + payload.outputTokens
        },
        estimatedCostUsd: cost,
        timestamp: new Date().toISOString()
      }, apparatusName);

      // 3. Persistencia mediante Notario SQL
      await FinancialLedgerApparatus.commitUsageRecord(auditRecord);

      OmnisyncTelemetry.verbose(apparatusName, 'billing_confirmed', `Cost: ${cost} USD for Tenant: ${payload.tenantId}`);

      return auditRecord;
    }, { traceId: payload.traceId });
  }
}