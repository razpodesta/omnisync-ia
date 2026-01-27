/** libs/core/telemetry/src/lib/telemetry.apparatus.ts */

import {
  IOmnisyncTelemetryEntry,
  OmnisyncTelemetryEntrySchema
} from './schemas/telemetry.schema';

/**
 * @name OmnisyncTelemetry
 * @description Aparato de élite para la observabilidad holística del sistema.
 * Orquesta la captura de trazas de ejecución, medición de latencia quirúrgica
 * y registros de alta verbosidad. Diseñado bajo el principio de "Impacto Cero",
 * permitiendo monitorear flujos neurales, operativos y de persistencia.
 *
 * @protocol OEDP-Level: Elite
 */
export class OmnisyncTelemetry {
  /**
   * @private
   * @description Determina si el flujo de verbosidad está habilitado en el entorno.
   */
  private static readonly IS_VERBOSE_ENABLED = true;

  /**
   * @method traceExecution
   * @description Envuelve una operación asíncrona (IA, ERP, DB) para medir su performance.
   * Proporciona un contexto inmutable del éxito o fracaso de la operación.
   *
   * @template TReturn - El tipo de dato esperado del retorno de la operación.
   * @param {string} apparatusName - Identificador del aparato que ejecuta la acción.
   * @param {string} operationName - Nombre de la operación específica.
   * @param {() => Promise<TReturn>} operation - Función asíncrona a ejecutar.
   * @param {Record<string, unknown>} initialMetadata - Datos adicionales para enriquecer la traza.
   * @returns {Promise<TReturn>} El resultado original de la operación.
   */
  public static async traceExecution<TReturn>(
    apparatusName: string,
    operationName: string,
    operation: () => Promise<TReturn>,
    initialMetadata: Record<string, unknown> = {}
  ): Promise<TReturn> {
    const startTimeInMilliseconds = performance.now();

    try {
      const result: TReturn = await operation();
      this.logCompletion(apparatusName, operationName, startTimeInMilliseconds, initialMetadata);
      return result;
    } catch (error: unknown) {
      this.logFailure(apparatusName, operationName, startTimeInMilliseconds, error, initialMetadata);
      throw error;
    }
  }

  /**
   * @method traceExecutionSync
   * @description Variante síncrona para medir latencia en operaciones de CPU (Validación, Mapping).
   *
   * @template TReturn - El tipo de dato esperado.
   */
  public static traceExecutionSync<TReturn>(
    apparatusName: string,
    operationName: string,
    operation: () => TReturn,
    initialMetadata: Record<string, unknown> = {}
  ): TReturn {
    const startTimeInMilliseconds = performance.now();

    try {
      const result: TReturn = operation();
      this.logCompletion(apparatusName, operationName, startTimeInMilliseconds, initialMetadata);
      return result;
    } catch (error: unknown) {
      this.logFailure(apparatusName, operationName, startTimeInMilliseconds, error, initialMetadata);
      throw error;
    }
  }

  /**
   * @method verbose
   * @description Registra eventos de granularidad fina para auditoría interna y debug neural.
   */
  public static verbose(
    apparatusName: string,
    operationName: string,
    messageKey: string,
    metadata: Record<string, unknown> = {}
  ): void {
    if (!this.IS_VERBOSE_ENABLED) return;

    this.emit({
      timestamp: new Date().toISOString(),
      apparatus: apparatusName,
      operation: operationName,
      level: 'VERBOSE',
      messageKey,
      metadata
    });
  }

  /**
   * @section Métodos Privados de Consolidación
   */

  private static logCompletion(
    apparatus: string,
    operation: string,
    start: number,
    meta: Record<string, unknown>
  ): void {
    // NIVELACIÓN: Inferencia implícita de string para mayor limpieza
    const duration = `${(performance.now() - start).toFixed(4)}ms`;

    this.emit({
      timestamp: new Date().toISOString(),
      apparatus,
      operation,
      level: 'PERFORMANCE',
      messageKey: 'core.telemetry.execution.success',
      durationInMilliseconds: duration,
      metadata: { ...meta, status: 'COMPLETED' }
    });
  }

  private static logFailure(
    apparatus: string,
    operation: string,
    start: number,
    error: unknown,
    meta: Record<string, unknown>
  ): void {
    // NIVELACIÓN: Inferencia implícita de string
    const duration = `${(performance.now() - start).toFixed(4)}ms`;

    this.emit({
      timestamp: new Date().toISOString(),
      apparatus,
      operation,
      level: 'ERROR',
      messageKey: 'core.telemetry.execution.failure',
      durationInMilliseconds: duration,
      metadata: {
        ...meta,
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    });
  }

  /**
   * @method emit
   * @private
   * @description Punto único de salida de datos. Valida la integridad de la entrada
   * contra el esquema SSOT antes de enviarlo a la consola institucional.
   */
  private static emit(entry: IOmnisyncTelemetryEntry): void {
    try {
      const validatedEntry = OmnisyncTelemetryEntrySchema.parse(entry);

      // NIVELACIÓN: Inferencia implícita de string en template literal
      const outputLine = `[${validatedEntry.timestamp}] [${validatedEntry.level}] [${validatedEntry.apparatus} >> ${validatedEntry.operation}]: ${validatedEntry.messageKey} ${validatedEntry.durationInMilliseconds ? `(${validatedEntry.durationInMilliseconds})` : ''}`;

      if (validatedEntry.level === 'ERROR') {
        console.error(outputLine, validatedEntry.metadata);
      } else if (validatedEntry.level === 'VERBOSE') {
        console.debug(outputLine, validatedEntry.metadata);
      } else {
        console.log(outputLine);
      }
    } catch (validationError) {
      console.error('[CRITICAL-TELEMETRY-FAILURE] Violación de esquema detectada:', validationError);
    }
  }
}
