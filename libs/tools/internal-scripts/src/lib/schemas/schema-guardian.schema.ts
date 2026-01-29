/** libs/tools/internal-scripts/src/lib/schemas/schema-guardian.schema.ts */

import { z } from 'zod';

/**
 * @name SchemaViolationTypeSchema
 * @description Define la naturaleza del incumplimiento del contrato estructural.
 */
export const SchemaViolationTypeSchema = z.enum([
  'MISSING_FILE',
  'EMPTY_CONTRACT',
]);

/**
 * @name SchemaOrphanSchema
 * @description Define la estructura de un hallazgo de orfandad (Aparato sin esquema).
 */
export const SchemaOrphanSchema = z
  .object({
    /** Nombre físico del archivo del aparato */
    apparatusName: z.string(),
    /** Ruta absoluta en el monorepo */
    apparatusPath: z.string(),
    /** Ruta donde el sistema esperaba localizar el contrato */
    expectedSchemaPath: z.string(),
    /** Categoría de la violación detectada */
    violationType: SchemaViolationTypeSchema,
  })
  .readonly();

/**
 * @name SchemaIntegritySeedSchema
 * @description Contrato maestro para la semilla de integridad de contratos.
 * Utilizado para alimentar la base de conocimientos de la IA y el Dashboard de control.
 *
 * @protocol OEDP-Level: Elite (Atomic Metadata)
 */
export const SchemaIntegritySeedSchema = z
  .object({
    /** Identificador único universal del reporte */
    reportId: z.string().uuid(),

    /** Marca de tiempo ISO-8601 del momento de la auditoría */
    timestamp: z.string().datetime(),

    /** Estadísticas consolidadas de salud estructural */
    statistics: z.object({
      totalApparatusFound: z.number().nonnegative(),
      compliantApparatusCount: z.number().nonnegative(),
      integrityPercentage: z.number().min(0).max(100),
    }),

    /** Lista detallada de componentes que sangran (no cumplen el estándar) */
    orphans: z.array(SchemaOrphanSchema),

    /** Contexto semántico para la interpretación del sistema de IA */
    aiContext: z.object({
      isSystemCompromised: z.boolean(),
      remediationHint: z.string(),
    }),
  })
  .readonly();

/**
 * @type ISchemaIntegritySeed
 * @description Representación tipada e inmutable de la auditoría de esquemas.
 */
export type ISchemaIntegritySeed = z.infer<typeof SchemaIntegritySeedSchema>;
export type ISchemaOrphan = z.infer<typeof SchemaOrphanSchema>;
