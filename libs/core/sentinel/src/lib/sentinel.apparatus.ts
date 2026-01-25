/** libs/core/sentinel/src/lib/sentinel.apparatus.ts */

import { ISentinelReport, SentinelReportSchema, ISentinelSeverity } from './schemas/sentinel.schema';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @name OmnisyncSentinel
 * @description Aparato central para la resiliencia y el manejo inteligente de errores.
 * Actúa como un interceptor de fallos y orquestador de estrategias de recuperación.
 */
export class OmnisyncSentinel {
  /**
   * @method report
   * @description Clasifica, registra y decide el flujo de acción ante un error.
   */
  public static async report(errorPayload: Partial<ISentinelReport>): Promise<void> {
    const report: ISentinelReport = this.hydrateReport(errorPayload);

    // 1. Registro en Telemetría (Persistencia de logs)
    OmnisyncTelemetry.verbose('OmnisyncSentinel', 'report', `Error detected: ${report.errorCode}`, { 
      severity: report.severity,
      isRecoverable: report.isRecoverable 
    });

    // 2. Lógica de Notificación Crítica
    if (report.severity === 'CRITICAL' || report.severity === 'HIGH') {
      await this.dispatchCriticalAlert(report);
    }

    // 3. Validación de Integridad del Reporte
    try {
      SentinelReportSchema.parse(report);
    } catch (schemaError) {
      console.error('[SENTINEL-INTERNAL-FAILURE] Report schema is invalid', schemaError);
    }
  }

  /**
   * @method executeWithResilience
   * @description Patrón Wrapper que aplica reintentos automáticos a operaciones inestables (ej. APIs externas).
   */
  public static async executeWithResilience<T>(
    operation: () => Promise<T>,
    apparatusName: string,
    operationName: string,
    maxRetries: number = 3
  ): Promise<T> {
    let currentAttempt = 0;

    while (currentAttempt < maxRetries) {
      try {
        return await operation();
      } catch (error) {
        currentAttempt++;
        const isLastAttempt = currentAttempt === maxRetries;

        if (isLastAttempt) {
          await this.report({
            errorCode: 'OS-CORE-001', // General Execution Failure
            severity: 'MEDIUM',
            apparatus: apparatusName,
            operation: operationName,
            message: `Operation failed after ${maxRetries} attempts`,
            context: { error: String(error) },
            isRecoverable: false
          });
          throw error;
        }

        // Delay exponencial antes del próximo intento
        const delay = Math.pow(2, currentAttempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Unreachable code in Sentinel Resilience');
  }

  /**
   * @method hydrateReport
   * @private
   */
  private static hydrateReport(payload: Partial<ISentinelReport>): ISentinelReport {
    return {
      errorCode: payload.errorCode ?? 'OS-CORE-999',
      severity: payload.severity ?? 'LOW',
      apparatus: payload.apparatus ?? 'UnknownApparatus',
      operation: payload.operation ?? 'UnknownOperation',
      message: payload.message ?? 'No error message provided',
      context: payload.context ?? {},
      timestamp: new Date().toISOString(),
      isRecoverable: payload.isRecoverable ?? false,
      tenantId: payload.tenantId,
      stackTrace: payload.stackTrace
    };
  }

  /**
   * @method dispatchCriticalAlert
   * @private
   * @description Envía el error a nuestro propio Dashboard de Administración.
   */
  private static async dispatchCriticalAlert(report: ISentinelReport): Promise<void> {
    // Aquí se implementará el webhook hacia apps/admin-dashboard
    console.error(`🚨 [CRITICAL ALERT] ${report.errorCode}: ${report.message}`);
  }
}