/** libs/core/contracts/src/lib/contracts.apparatus.ts */

import { z, ZodSchema } from 'zod';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @name OmnisyncContracts
 * @description Aparato fundamental para la validación de integridad del ADN del dato (SSOT).
 * Actúa como el guardián de entrada de todos los aparatos del ecosistema, garantizando
 * que ningún dato corrupto procese lógicas de negocio o inferencias de IA.
 *
 * @protocol OEDP-Level: Elite (Atomized & Immutable)
 */
export class OmnisyncContracts {
  /**
   * @method validate
   * @description Realiza una validación estricta de una entidad única.
   * Si el contrato se viola, reporta al Sentinel con severidad HIGH.
   *
   * @template T - Tipo esperado del esquema.
   * @param {ZodSchema<T>} schema - Esquema de validación Zod.
   * @param {unknown} data - Datos a inspeccionar.
   * @param {string} contextName - Identificador del aparato consumidor para trazabilidad.
   * @returns {Readonly<T>} Datos validados y marcados como inmutables.
   */
  public static validate<T>(
    schema: ZodSchema<T>,
    data: unknown,
    contextName: string
  ): Readonly<T> {
    return OmnisyncTelemetry.traceExecutionSync(
      'OmnisyncContracts',
      `validate:${contextName}`,
      () => {
        try {
          return schema.parse(data) as Readonly<T>;
        } catch (error: unknown) {
          this.reportViolation(error, data, contextName);
          throw error;
        }
      }
    );
  }

  /**
   * @method validateCollection
   * @description Variante optimizada para la validación de arrays de datos.
   * Útil para resultados de búsqueda vectorial o listados de ERP.
   */
  public static validateCollection<T>(
    schema: ZodSchema<T>,
    dataCollection: unknown[],
    contextName: string
  ): ReadonlyArray<T> {
    return OmnisyncTelemetry.traceExecutionSync(
      'OmnisyncContracts',
      `validateCollection:${contextName}`,
      () => {
        const collectionSchema = z.array(schema);
        try {
          return collectionSchema.parse(dataCollection) as ReadonlyArray<T>;
        } catch (error: unknown) {
          this.reportViolation(error, `Collection[${dataCollection.length}]`, contextName);
          throw error;
        }
      }
    );
  }

  /**
   * @method safeValidate
   * @description Variante de alto rendimiento para validaciones en caliente (Middlewares/Edge).
   * No lanza excepciones ni dispara reportes al Sentinel.
   */
  public static safeValidate<T>(
    schema: ZodSchema<T>,
    data: unknown
  ): { readonly success: boolean; readonly data?: Readonly<T>; readonly error?: z.ZodError } {
    const result = schema.safeParse(data);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data as Readonly<T> };
  }

  /**
   * @method reportViolation
   * @private
   * @description Centraliza la comunicación con el Sentinel ante fallos de integridad.
   */
  private static reportViolation(error: unknown, data: unknown, context: string): void {
    if (error instanceof z.ZodError) {
      OmnisyncSentinel.report({
        errorCode: 'OS-CORE-400',
        severity: 'HIGH',
        apparatus: 'OmnisyncContracts',
        operation: `violation_at:${context}`,
        message: 'core.contracts.error.ssot_violation',
        context: {
          apparatusContext: context,
          validationIssues: error.issues,
          payloadSnapshot: String(data).substring(0, 250)
        },
        isRecoverable: false
      });
    }
  }
}
