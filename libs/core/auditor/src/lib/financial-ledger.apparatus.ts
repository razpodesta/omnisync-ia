/** libs/core/auditor/src/lib/financial-ledger.apparatus.ts */

import { OmnisyncDatabase, Prisma } from '@omnisync/core-persistence';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncContracts } from '@omnisync/core-contracts';

/** @section Sincronización de ADN Local */
import { 
  FinancialNotarizationSchema, 
  IFinancialNotarization 
} from './schemas/financial-ledger.schema';
import { IAIUsageAuditRecord } from './schemas/ai-usage-auditor.schema';

/**
 * @name FinancialLedgerApparatus
 * @description Nodo maestro de Notarización Financiera (Fase 5.5).
 * Orquesta la persistencia inmutable de transacciones de consumo neural.
 * Implementa la visión "Ojos de Mosca": monitoriza simultáneamente el gasto, 
 * la integridad de la directiva y la salud del cluster SQL.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Sovereign-Financial-Audit V5.5)
 */
export class FinancialLedgerApparatus {
  private static readonly apparatusName = 'FinancialLedgerApparatus';
  private static readonly CRITICAL_COST_THRESHOLD_USD = 0.50;

  /**
   * @method commitUsageRecord
   * @description Ejecuta el protocolo de sellado financiero. 
   * Valida, audita y persiste el ADN del consumo bajo contrato SSOT.
   * 
   * @param {IAIUsageAuditRecord} record - Rastro de tokens proveniente del auditor.
   * @param {string} promptChecksum - Firma de integridad de la directiva utilizada.
   */
  public static async commitUsageRecord(
    record: IAIUsageAuditRecord, 
    promptChecksum: string = 'LEGACY_UNKNOWN'
  ): Promise<void> {
    const operationName = 'commitUsageRecord';

    return await OmnisyncTelemetry.traceExecution(this.apparatusName, operationName, async () => {
      // 1. HIDRATACIÓN DEL ADN DE NOTARIZACIÓN (Visión Ojos de Mosca)
      const isHighCost = record.estimatedCostUsd >= this.CRITICAL_COST_THRESHOLD_USD;
      
      const notarizationPayload: IFinancialNotarization = {
        notarizationId: crypto.randomUUID(),
        tenantIdentifier: record.tenantId,
        traceId: record.traceId,
        ledgerEntry: {
          model: record.modelIdentifier,
          inputTokens: record.usageMetrics.inputTokens,
          outputTokens: record.usageMetrics.outputTokens,
          costUsd: record.estimatedCostUsd,
          currency: 'USD'
        },
        governanceAnchor: {
          promptChecksum,
          versionTag: 'PROD-V5'
        },
        forensicMetadata: {
          engineVersion: 'OEDP-V5.5-ELITE',
          author: 'Raz Podestá',
          nodeId: process.env['RENDER_INSTANCE_ID'] || 'LOCAL_NODE',
          isHighCostTransaction: isHighCost
        },
        timestamp: new Date().toISOString()
      };

      // 2. ADUANA DE INTEGRIDAD
      const validatedNotarization = OmnisyncContracts.validate(
        FinancialNotarizationSchema,
        notarizationPayload,
        this.apparatusName
      );

      try {
        /**
         * @section Persistencia Relacional Blindada
         * Handshake directo con Prisma 7 sin casting amorfos.
         */
        await OmnisyncDatabase.databaseEngine.tenantConsumption.create({
          data: {
            id: validatedNotarization.notarizationId,
            tenantId: validatedNotarization.tenantIdentifier,
            traceId: validatedNotarization.traceId,
            model: validatedNotarization.ledgerEntry.model,
            inputTokens: validatedNotarization.ledgerEntry.inputTokens,
            outputTokens: validatedNotarization.ledgerEntry.outputTokens,
            costUsd: validatedNotarization.ledgerEntry.costUsd,
            /** 
             * @note Inyección de ADN Biyectivo
             * Guardamos el checksum del prompt como prueba legal de la inferencia.
             */
            metadata: {
              ...validatedNotarization.forensicMetadata,
              promptAnchor: validatedNotarization.governanceAnchor.promptChecksum
            } as Prisma.InputJsonValue,
            timestamp: new Date(validatedNotarization.timestamp)
          }
        });

        // 3. ALERTA DE OJOS DE MOSCA: Detección de anomalía de costo
        if (isHighCost) {
          this.triggerHighCostAlert(validatedNotarization);
        }

        OmnisyncTelemetry.verbose(this.apparatusName, 'transaction_notarized', 
          `Fiscalizado: $${validatedNotarization.ledgerEntry.costUsd} USD | Tenant: ${validatedNotarization.tenantIdentifier}`
        );

      } catch (criticalPersistenceError: unknown) {
        return await this.handleNotarialColapse(validatedNotarization, criticalPersistenceError);
      }
    }, { tenantId: record.tenantId });
  }

  /**
   * @method triggerHighCostAlert
   * @private
   */
  private static triggerHighCostAlert(notarization: IFinancialNotarization): void {
    OmnisyncTelemetry.verbose(this.apparatusName, 'high_cost_warning', 
      `Alerta: Inferencia de alto costo detectada ($${notarization.ledgerEntry.costUsd}).`,
      { traceId: notarization.traceId }
    );
    
    // Notificamos al Sentinel sin bloquear el flujo
    OmnisyncSentinel.report({
      errorCode: 'OS-CORE-003',
      severity: 'LOW',
      apparatus: this.apparatusName,
      operation: 'budget_surveillance',
      message: 'financial.auditor.high_cost_transaction',
      context: { notarization }
    });
  }

  /**
   * @method handleNotarialColapse
   * @private
   */
  private static async handleNotarialColapse(
    dna: IFinancialNotarization, 
    error: unknown
  ): Promise<void> {
    await OmnisyncSentinel.report({
      errorCode: 'OS-CORE-003',
      severity: 'CRITICAL',
      apparatus: this.apparatusName,
      operation: 'persist_ledger',
      message: 'Fallo crítico en la notarización de consumo. Fuga financiera detectada.',
      context: { 
        errorTrace: String(error), 
        dna_backup: dna // Preservamos el ADN en el rastro del Sentinel
      },
      isRecoverable: true
    });
    
    // Inyectamos en Telemetría Forense de Emergencia para recuperación manual
    console.error(`[FATAL_FINANCIAL_LOSS]: ${JSON.stringify(dna)}`);
    throw error;
  }
}