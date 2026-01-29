/** libs/tools/internal-scripts/src/lib/schemas/library-integrity-auditor.schema.ts */

import { z } from 'zod';

/**
 * @name LibraryFindingSchema
 * @description Define el hallazgo técnico de una librería individual.
 */
export const LibraryFindingSchema = z
  .object({
    /** Ruta física del archivo tsconfig.lib.json */
    libraryPath: z.string(),
    /** Indica si la librería cumple con los estándares OEDP */
    isCompliant: z.boolean(),
    /** Lista de violaciones detectadas (ej: INVALID_TARGET) */
    anomalies: z.array(z.string()),
    /** Instrucción técnica para la corrección del ADN */
    remediationHint: z.string(),
  })
  .readonly();

/**
 * @name LibraryIntegritySeedSchema
 * @description Contrato maestro para la semilla de integridad de librerías LEGO.
 *
 * @protocol OEDP-Level: Elite (Metadata Sovereignty)
 */
export const LibraryIntegritySeedSchema = z
  .object({
    /** Identificador único del reporte */
    reportId: z.string().uuid(),
    /** Fecha y hora de la auditoría */
    timestamp: z.string().datetime(),
    /** Total de librerías escaneadas en el workspace */
    totalLibrariesAudited: z.number().nonnegative(),
    /** Puntuación de cumplimiento global (0-100) */
    complianceScore: z.number().min(0).max(100),
    /** Colección detallada de hallazgos por librería */
    findings: z.array(LibraryFindingSchema),
    /** Contexto interpretativo para el cerebro neural */
    aiContext: z.object({
      summary: z.string(),
      criticalViolationsCount: z.number().nonnegative(),
    }),
  })
  .readonly();

/**
 * @type ILibraryIntegritySeed
 * @description Representación tipada e inmutable de la auditoría de librerías.
 */
export type ILibraryIntegritySeed = z.infer<typeof LibraryIntegritySeedSchema>;
export type ILibraryFinding = z.infer<typeof LibraryFindingSchema>;
