/** libs/tools/internal-scripts/src/lib/schemas/connectivity-integrity.schema.ts */

import { z } from 'zod';

/**
 * @name ConnectivityNodeHealthSchema
 * @description Estructura de diagnóstico para un nodo individual de la red neural.
 */
export const ConnectivityNodeHealthSchema = z
  .object({
    /** Estado operativo según el handshake físico */
    status: z.string(),
    /** Latencia de respuesta medida en milisegundos */
    latencyInMilliseconds: z.number().optional(),
    /** Proveedor de infraestructura (ej: Supabase, Upstash) */
    provider: z.string(),
    /** Descripción del error en caso de fallo crítico */
    error: z.string().optional(),
    /** Sugerencia técnica para la auto-sanación del sistema */
    remediationHint: z.string().optional(),
  })
  .readonly();

/**
 * @name ConnectivityReportSchema
 * @description Contrato maestro para el reporte de salud de la infraestructura Cloud.
 * Optimizado para el consumo por motores de IA y telemetría avanzada.
 *
 * @protocol OEDP-Level: Elite (Atomic Triage)
 */
export const ConnectivityReportSchema = z
  .object({
    /** Identificador único del evento de auditoría */
    reportId: z.string().uuid(),
    /** Marca de tiempo ISO-8601 de la ejecución */
    timestamp: z.string().datetime(),
    /** Entorno de ejecución (Production/Development) */
    environment: z.string(),
    /** Estado de salud consolidado del ecosistema */
    overallStatus: z.enum(['HEALTHY', 'DEGRADED', 'FAILING']),
    /** Mapa de nodos auditados: persistencia, memoria y vectores */
    nodes: z.record(z.string(), ConnectivityNodeHealthSchema),
    /** Contexto interpretativo para el cerebro neural */
    aiContext: z.object({
      summary: z.string(),
      isActionRequired: z.boolean(),
    }),
  })
  .readonly();

/**
 * @type IConnectivityReport
 * @description Representación tipada e inmutable del reporte de conectividad.
 */
export type IConnectivityReport = z.infer<typeof ConnectivityReportSchema>;
export type IConnectivityNodeHealth = z.infer<
  typeof ConnectivityNodeHealthSchema
>;
