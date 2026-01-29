/** libs/tools/internal-scripts/src/lib/schemas/data-snapshot-extractor.schema.ts */

import { z } from 'zod';

/**
 * @name SovereignSnapshotLayerSchema
 * @description Define el estado y métricas de una capa de datos específica durante el volcado.
 */
export const SovereignSnapshotLayerSchema = z
  .object({
    /** Estado de la operación en la capa (SUCCESS/FAILED/PARTIAL) */
    status: z.string(),
    /** Cantidad de registros o llaves capturadas */
    recordsCount: z.number().nonnegative(),
  })
  .readonly();

/**
 * @name SovereignSnapshotSeedSchema
 * @description Contrato maestro para la semilla de integridad de snapshots.
 * Define el ADN necesario para reconstruir o auditar el estado del sistema en un tiempo T.
 *
 * @protocol OEDP-Level: Elite (System DNA Architecture)
 */
export const SovereignSnapshotSeedSchema = z
  .object({
    /** Identificador único universal del snapshot */
    snapshotIdentifier: z.string().uuid(),

    /** Marca de tiempo ISO-8601 del inicio de la extracción */
    timestamp: z.string().datetime(),

    /** Versión del esquema de base de datos capturado */
    schemaVersion: z.string(),

    /** Desglose de capas de persistencia capturadas */
    layers: z.object({
      relational: SovereignSnapshotLayerSchema,
      vectorial: SovereignSnapshotLayerSchema,
      volatile: SovereignSnapshotLayerSchema,
    }),

    /** Firma de integridad para detección de manipulaciones (Hash) */
    checksum: z.string(),
  })
  .readonly();

/**
 * @type ISovereignSnapshotSeed
 * @description Representación tipada e inmutable de la semilla de snapshot.
 */
export type ISovereignSnapshotSeed = z.infer<
  typeof SovereignSnapshotSeedSchema
>;
export type ISovereignSnapshotLayer = z.infer<
  typeof SovereignSnapshotLayerSchema
>;
