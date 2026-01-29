/** libs/core/sentinel/src/lib/sentinel.apparatus.ts */

import {
  ISentinelReport,
  SentinelReportSchema,
  ISentinelSeverity,
} from './schemas/sentinel.schema';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @name OmnisyncSentinel
 * @description Aparato maestro de resiliencia. Orquesta la recuperación de fallos
 * y la auditoría de anomalías mediante telemetría y alertas de grado industrial.
 *
 * @protocol OEDP-Level: Elite (Atomized & i18n Ready)
 */
export class OmnisyncSentinel {
  /**
   * @private
   * Configuración de reintentos por defecto.
   */
  private static readonly DEFAULT_MAXIMUM_RETRIES = 3;

  /**
   * @method report
   * @description Clasifica y registra una anomalía. Valida la integridad del reporte
   * sin interrumpir el flujo principal (Failsafe).
   */
  public static async report(
    errorPayload: Partial<ISentinelReport>,
  ): Promise<void> {
    const hydratedReport: ISentinelReport = this.hydrateReport(errorPayload);

    // 1. Registro en Telemetría (Observabilidad de Élite)
    OmnisyncTelemetry.verbose(
      'OmnisyncSentinel',
      'report',
      `sentinel.anomaly_detected`,
      {
        errorCode: hydratedReport.errorCode,
        severity: hydratedReport.severity,
        apparatus: hydratedReport.apparatus,
      },
    );

    // 2. Validación de Contrato con Resiliencia Interna
    const validationResult = SentinelReportSchema.safeParse(hydratedReport);

    if (!validationResult.success) {
      console.error(
        '[SENTINEL-BREACH]: Error report schema violation',
        validationResult.error.format(),
      );
      return;
    }

    // 3. Gestión de Alertas Críticas
    if (this.isCriticalSeverity(hydratedReport.severity)) {
      await this.dispatchCriticalAlert(hydratedReport);
    }
  }

  /**
   * @method executeWithResilience
   * @description Implementación del patrón 'Retry' con retardo exponencial.
   * Atomiza la ejecución de operaciones inestables garantizando trazabilidad.
   */
  public static async executeWithResilience<T>(
    operation: () => Promise<T>,
    apparatusName: string,
    operationName: string,
    maxRetries: number = this.DEFAULT_MAXIMUM_RETRIES,
  ): Promise<T> {
    let currentAttempt = 0;

    while (currentAttempt < maxRetries) {
      try {
        return await operation();
      } catch (executionError: unknown) {
        currentAttempt++;
        const isFinalAttempt = currentAttempt === maxRetries;

        if (isFinalAttempt) {
          await this.report({
            errorCode: 'OS-CORE-001',
            severity: 'HIGH',
            apparatus: apparatusName,
            operation: operationName,
            message: 'sentinel.execution.exhausted_retries',
            context: {
              error: String(executionError),
              attempts: currentAttempt,
            },
            isRecoverable: false,
          });
          throw executionError;
        }

        await this.applyExponentialBackoff(currentAttempt);
      }
    }
    throw new Error('OS-CORE-500: Sentinel Resilience Engine Unreachable');
  }

  /**
   * @method applyExponentialBackoff
   * @private
   * @description Calcula y ejecuta la pausa necesaria antes del siguiente intento.
   */
  private static async applyExponentialBackoff(attempt: number): Promise<void> {
    const delayDuration = Math.pow(2, attempt) * 1000;
    return new Promise((resolve) => setTimeout(resolve, delayDuration));
  }

  /**
   * @method isCriticalSeverity
   * @private
   */
  private static isCriticalSeverity(severity: ISentinelSeverity): boolean {
    return severity === 'CRITICAL' || severity === 'HIGH';
  }

  /**
   * @method hydrateReport
   * @private
   */
  private static hydrateReport(
    payload: Partial<ISentinelReport>,
  ): ISentinelReport {
    return {
      errorCode: payload.errorCode ?? 'OS-CORE-999',
      severity: payload.severity ?? 'LOW',
      apparatus: payload.apparatus ?? 'UnknownApparatus',
      operation: payload.operation ?? 'UnknownOperation',
      message: payload.message ?? 'sentinel.errors.unspecified',
      context: payload.context ?? {},
      timestamp: new Date().toISOString(),
      isRecoverable: payload.isRecoverable ?? false,
      tenantId: payload.tenantId,
      stackTrace: payload.stackTrace,
    };
  }

  /**
   * @method dispatchCriticalAlert
   * @private
   */
  private static async dispatchCriticalAlert(
    report: ISentinelReport,
  ): Promise<void> {
    // Aquí se inyectará el webhook de Vercel/Render en el siguiente ciclo
    console.error(`🚨 [CRITICAL ALERT] ${report.errorCode}: ${report.message}`);
  }
}
