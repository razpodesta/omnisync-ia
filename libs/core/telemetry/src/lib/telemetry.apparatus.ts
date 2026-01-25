/** libs/core/telemetry/src/lib/telemetry.apparatus.ts */

import { 
    IOmnisyncTelemetryEntry, 
    OmnisyncTelemetryEntrySchema, 
    IOmnisyncTelemetryLevel 
  } from './schemas/telemetry.schema';
  
  /**
   * @name OmnisyncTelemetry
   * @description Aparato de élite para la observabilidad holística del sistema.
   * Proporciona trazas de ejecución, medición de latencia y logs de alta verbosidad.
   */
  export class OmnisyncTelemetry {
    private static readonly IS_VERBOSE_ENABLED: boolean = true; // Puede vincularse a process.env.VERBOSE
  
    /**
     * @method traceExecution
     * @description Envuelve una operación (IA, ERP o lógica) para medir su performance y éxito.
     * @template TReturn Tipo de dato que retorna la operación original.
     */
    public static async traceExecution<TReturn>(
      apparatusName: string,
      operationName: string,
      operation: () => Promise<TReturn>,
      initialMetadata: Record<string, unknown> = {}
    ): Promise<TReturn> {
      const startTimeInMilliseconds: number = performance.now();
      
      try {
        const result: TReturn = await operation();
        const endTimeInMilliseconds: number = performance.now();
        const durationFormatted: string = (endTimeInMilliseconds - startTimeInMilliseconds).toFixed(4);
  
        this.emit({
          timestamp: new Date().toISOString(),
          apparatus: apparatusName,
          operation: operationName,
          level: 'PERFORMANCE',
          messageKey: 'core.telemetry.execution.success',
          durationInMilliseconds: `${durationFormatted}ms`,
          metadata: { ...initialMetadata, status: 'COMPLETED' }
        });
  
        return result;
      } catch (error: unknown) {
        const endTimeInMilliseconds: number = performance.now();
        const durationFormatted: string = (endTimeInMilliseconds - startTimeInMilliseconds).toFixed(4);
  
        this.emit({
          timestamp: new Date().toISOString(),
          apparatus: apparatusName,
          operation: operationName,
          level: 'ERROR',
          messageKey: 'core.telemetry.execution.failure',
          durationInMilliseconds: `${durationFormatted}ms`,
          metadata: {
            ...initialMetadata,
            status: 'FAILED',
            errorMessage: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined
          }
        });
        throw error;
      }
    }
  
    /**
     * @method verbose
     * @description Registra eventos de alta granularidad útiles para debugging en desarrollo o trazabilidad IA.
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
     * @method emit
     * @private
     * @description Valida la integridad de la entrada y realiza la salida hacia el stream correspondiente.
     */
    private static emit(entry: IOmnisyncTelemetryEntry): void {
      try {
        const validatedEntry = OmnisyncTelemetryEntrySchema.parse(entry);
        const outputLine: string = `[${validatedEntry.timestamp}] [${validatedEntry.level}] [${validatedEntry.apparatus} >> ${validatedEntry.operation}]: ${validatedEntry.messageKey} ${validatedEntry.durationInMilliseconds ? `(${validatedEntry.durationInMilliseconds})` : ''}`;
  
        if (validatedEntry.level === 'ERROR') {
          console.error(outputLine, validatedEntry.metadata);
        } else if (validatedEntry.level === 'VERBOSE') {
          console.debug(outputLine, validatedEntry.metadata);
        } else {
          console.log(outputLine);
        }
      } catch (validationError) {
        console.error('[CRITICAL] Telemetry Schema Violation:', validationError);
      }
    }
  }