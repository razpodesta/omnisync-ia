/** libs/core/contracts/src/lib/contracts.apparatus.ts */

import { z, ZodSchema } from 'zod';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @name OmnisyncContracts
 * @description Aparato guardián de la integridad del ADN del dato (SSOT).
 * Actúa como el motor de validación centralizado del framework, garantizando 
 * que solo información íntegra y tipada circule por las venas del sistema.
 * 
 * @protocol OEDP-Level: Elite (Full-Sovereign Validation V3.0)
 */
export class OmnisyncContracts {
  /**
   * @method validate
   * @description Realiza una validación estricta y sella la inmutabilidad del objeto.
   * Si detecta una violación de contrato, orquesta un reporte forense al Sentinel.
   * 
   * @template T - Interfaz del contrato esperada.
   * @param {ZodSchema<T>} schema - Esquema Zod de validación.
   * @param {unknown} data - ADN crudo a inspeccionar.
   * @param {string} apparatusContext - Identificador del aparato que invoca la aduana.
   * @returns {Readonly<T>} Datos validados bajo estándar Readonly.
   */
  public static validate<T>(
    schema: ZodSchema<T>,
    data: unknown,
    apparatusContext: string,
  ): Readonly<T> {
    const operationName = `validate:${apparatusContext}`;

    return OmnisyncTelemetry.traceExecutionSync(
      'OmnisyncContracts',
      operationName,
      () => {
        try {
          /**
           * @section Ejecución de Aduana
           * El parseo de Zod garantiza que las transformaciones (trim, lowercase)
           * se apliquen antes de entregar el dato validado.
           */
          return schema.parse(data) as Readonly<T>;
        } catch (criticalValidationError: unknown) {
          this.reportSovereignViolation(criticalValidationError, data, apparatusContext);
          throw criticalValidationError;
        }
      },
    );
  }

  /**
   * @method validateCollection
   * @description Especialista en la validación de lotes de datos (Batch Validation).
   * Vital para procesos RAG donde se recuperan múltiples fragmentos semánticos.
   */
  public static validateCollection<T>(
    schema: ZodSchema<T>,
    dataCollection: unknown[],
    apparatusContext: string,
  ): ReadonlyArray<T> {
    const operationName = `validateCollection:${apparatusContext}`;

    return OmnisyncTelemetry.traceExecutionSync(
      'OmnisyncContracts',
      operationName,
      () => {
        const collectionSchema = z.array(schema);
        try {
          return collectionSchema.parse(dataCollection) as ReadonlyArray<T>;
        } catch (criticalCollectionError: unknown) {
          this.reportSovereignViolation(
            criticalCollectionError,
            `Collection[Length: ${dataCollection.length}]`,
            apparatusContext,
          );
          throw criticalCollectionError;
        }
      },
    );
  }

  /**
   * @method safeValidate
   * @description Variante reactiva de alta performance. 
   * Diseñada para validaciones en el Edge o Middlewares donde no se desea lanzar excepciones.
   */
  public static safeValidate<T>(
    schema: ZodSchema<T>,
    data: unknown,
  ): {
    readonly success: boolean;
    readonly data?: Readonly<T>;
    readonly error?: z.ZodError;
  } {
    const result = schema.safeParse(data);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data as Readonly<T> };
  }

  /**
   * @method reportSovereignViolation
   * @private
   * @description Transforma errores de esquema en reportes diagnósticos para el Sentinel.
   */
  private static reportSovereignViolation(
    errorInstance: unknown,
    payloadSnapshot: unknown,
    contextIdentifier: string,
  ): void {
    if (errorInstance instanceof z.ZodError) {
      OmnisyncSentinel.report({
        errorCode: 'OS-CORE-400',
        severity: 'HIGH',
        apparatus: 'OmnisyncContracts',
        operation: `integrity_breach_at:${contextIdentifier}`,
        message: 'core.contracts.error.ssot_violation',
        context: {
          invokingApparatus: contextIdentifier,
          validationIssues: errorInstance.issues,
          // Truncamos el snapshot para no saturar la telemetría
          dnaPreview: String(JSON.stringify(payloadSnapshot)).substring(0, 300),
        },
        isRecoverable: false,
      });
    }
  }
}