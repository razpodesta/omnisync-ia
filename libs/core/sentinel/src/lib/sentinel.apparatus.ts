/** libs/core/sentinel/src/lib/sentinel.apparatus.ts */

import {
  ISentinelReport,
  SentinelReportSchema,
  ISentinelSeverity,
} from './schemas/sentinel.schema';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @name OmnisyncSentinel
 * @description Aparato maestro de resiliencia del ecosistema Omnisync-AI.
 * Orquesta la recuperación de fallos, auditoría de anomalías y despacho de alertas.
 * Actúa como el núcleo de autosanación del ADN del sistema.
 *
 * @protocol OEDP-Level: Elite (Resilience Orchestration V2.6)
 */
export class OmnisyncSentinel {
  /**
   * @private
   * Configuración de reintentos por defecto para operaciones inestables.
   */
  private static readonly DEFAULT_MAXIMUM_RETRIES = 3;

  /**
   * @method report
   * @description Clasifica, valida y registra una anomalía en la infraestructura.
   * Implementa un flujo 'Failsafe' que no interrumpe el proceso principal ante errores de reporte.
   * 
   * @param {Readonly<Partial<ISentinelReport>>} errorPayload - Datos brutos de la incidencia.
   */
  public static async report(
    errorPayload: Readonly<Partial<ISentinelReport>>,
  ): Promise<void> {
    const hydratedReport: ISentinelReport = this.hydrateReport(errorPayload);

    // 1. Registro en Telemetría de Alta Verbosidad
    OmnisyncTelemetry.verbose(
      'OmnisyncSentinel',
      'report',
      `sentinel.anomaly_detected:${hydratedReport.errorCode}`,
      {
        severity: hydratedReport.severity,
        apparatus: hydratedReport.apparatus,
        isRecoverable: hydratedReport.isRecoverable,
      },
    );

    // 2. Validación de Contrato Estructural (SSOT)
    const validationResult = SentinelReportSchema.safeParse(hydratedReport);

    if (!validationResult.success) {
      /**
       * @section Alerta de Integridad de Sentinel
       * Si el reporte mismo es inválido, registramos la brecha de datos en consola.
       */
      console.error(
        '[SENTINEL-INTERNAL-BREACH]: Fallo de esquema en reporte de error.',
        validationResult.error.format(),
      );
      return;
    }

    // 3. Gestión de Alertas de Alta Prioridad
    if (this.isCriticalSeverity(hydratedReport.severity)) {
      await this.dispatchCriticalAlert(hydratedReport);
    }
  }

  /**
   * @method executeWithResilience
   * @description Patrón de reintento atómico con backoff exponencial.
   * Envuelve operaciones críticas (APIs, DB) para mitigar fallos transitorios.
   *
   * @template T - Tipo de retorno de la operación.
   * @param {() => Promise<T>} operation - Función asíncrona a proteger.
   * @param {string} apparatusName - Identificador del componente ejecutor.
   * @param {string} operationName - Nombre de la acción para telemetría.
   * @param {number} maxRetries - Límite de intentos (Default: 3).
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
          /**
           * @section Agotamiento de Reintentos
           * Reportamos la anomalía definitiva al Sentinel antes de propagar la excepción.
           */
          await this.report({
            errorCode: 'OS-CORE-001',
            severity: 'HIGH',
            apparatus: apparatusName,
            operation: operationName,
            message: 'sentinel.execution.exhausted_retries',
            context: {
              error: String(executionError),
              attemptsMade: currentAttempt,
              serviceName: apparatusName
            },
            isRecoverable: false,
          });
          throw executionError;
        }

        // Aplicación de pausa calculada antes del próximo Handshake
        await this.applyExponentialBackoff(currentAttempt);
      }
    }
    throw new Error('OS-CORE-500: Sentinel Pipeline Breach');
  }

  /**
   * @method applyExponentialBackoff
   * @private
   * @description Calcula y ejecuta una espera de 2^intento segundos.
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
   * @description Provee valores por defecto para asegurar que el reporte sea procesable.
   */
  private static hydrateReport(
    payload: Readonly<Partial<ISentinelReport>>,
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
   * @description Canaliza alertas críticas hacia el Admin Dashboard (Fase 4).
   */
  private static async dispatchCriticalAlert(
    report: Readonly<ISentinelReport>,
  ): Promise<void> {
    // NIVELACIÓN: Placeholder forense con formato de consola Manus.io
    console.error(`🚨 [CRITICAL_SYSTEM_ALERT] [${report.errorCode}]: ${report.message}`, {
      apparatus: report.apparatus,
      timestamp: report.timestamp
    });
  }
}