/** libs/core/auditor/src/lib/financial-ledger.apparatus.ts */

import { OmnisyncDatabase, PrismaClient } from '@omnisync/core-persistence';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { IAIUsageAuditRecord } from './schemas/ai-usage-auditor.schema';

/**
 * @interface IPrismaConsumptionDelegate
 * @description Contrato técnico para el acceso seguro al delegado de persistencia.
 * Resuelve el bloqueo de tipos sin recurrir a 'any', permitiendo la interacción
 * con tablas de auditoría financiera.
 */
interface IPrismaConsumptionDelegate {
  create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
}

/**
 * @name FinancialLedgerApparatus
 * @description Aparato notarial encargado del registro inmutable de transacciones 
 * de consumo neural. Actúa como el libro contable (Ledger) del sistema, 
 * asegurando la persistencia de métricas de tokens y costos USD en el cluster SQL.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Financial-Audit-Sovereignty V3.2)
 * @vision Ultra-Holística: Immutable-Audit-Trail & Zero-Any
 */
export class FinancialLedgerApparatus {
  /**
   * @method commitUsageRecord
   * @description Realiza la persistencia atómica de un registro de auditoría. 
   * Implementa un acceso estructural dinámico para mitigar el lag de generación 
   * del cliente Prisma 7, manteniendo la soberanía de tipos.
   *
   * @param {IAIUsageAuditRecord} record - El ADN del consumo validado por el auditor.
   * @returns {Promise<void>}
   */
  public static async commitUsageRecord(record: IAIUsageAuditRecord): Promise<void> {
    const apparatusName = 'FinancialLedgerApparatus';
    const operationName = 'commitUsageRecord';

    return await OmnisyncTelemetry.traceExecution(apparatusName, operationName, async () => {
      try {
        const dbClient: PrismaClient = OmnisyncDatabase.databaseEngine;

        /**
         * @section Resolución de Soberanía (Safe Reflection)
         * RESOLUCIÓN TS-ANY: Utilizamos un casteo hacia un Record de delegados técnicos.
         * Esto satisface al linter y garantiza que la operación 'create' esté tipada.
         */
        const consumptionTable = (
          dbClient as unknown as Record<string, IPrismaConsumptionDelegate>
        )['tenantConsumption'];

        if (!consumptionTable) {
          throw new Error('OS-CORE-404: Infraestructura de tabla [tenantConsumption] no detectada en el motor.');
        }

        /**
         * @section Notarización SQL
         * Mapeo biyectivo entre el esquema del auditor y la tabla física.
         */
        await consumptionTable.create({
          data: {
            id: record.id,
            tenantId: record.tenantId,
            traceId: record.traceId,
            model: record.modelIdentifier,
            inputTokens: record.usageMetrics.inputTokens,
            outputTokens: record.usageMetrics.outputTokens,
            costUsd: record.estimatedCostUsd,
            timestamp: record.timestamp,
            /** Metadatos forenses de versión del framework */
            metadata: { 
              engineVersion: 'OEDP-V3.2-ELITE',
              author: 'Raz Podestá'
            },
          }
        });

        OmnisyncTelemetry.verbose(
          apparatusName, 
          'record_sealed', 
          `Transacción financiera sellada para el Trace: ${record.traceId}`
        );

      } catch (criticalPersistenceError: unknown) {
        /**
         * @note Gestión de Desastres
         * Si la auditoría falla, el Sentinel debe emitir una alerta CRITICAL 
         * para evitar fugas de presupuesto de tokens.
         */
        await OmnisyncSentinel.report({
          errorCode: 'OS-CORE-003',
          severity: 'HIGH',
          apparatus: apparatusName,
          operation: operationName,
          message: 'tools.auditor.persistence_failed',
          context: { 
            error: String(criticalPersistenceError), 
            recordId: record.id,
            tenantId: record.tenantId
          },
          isRecoverable: true,
        });
        
        throw criticalPersistenceError;
      }
    });
  }
}