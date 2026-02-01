/** libs/integrations/health-engine/src/lib/schemas/health-engine.schema.ts */

import { z } from 'zod';

/**
 * @name InfrastructureNodeHealthStatusSchema
 * @description Define la taxonomía de estados operativos para los nodos de nube.
 */
export const InfrastructureNodeHealthStatusSchema = z.enum([
  'HEALTHY',      // Operación nominal
  'DEGRADED',     // Latencia inusual o errores intermitentes
  'THROTTLED',    // Saturación de cuota o Rate Limit activo
  'UNREACHABLE',  // Caída total del servicio o fallo de DNS
  'MAINTENANCE'   // Nodo en ventana de actualización programada
]);

/**
 * @name InfrastructurePillarSchema
 * @description Define los 5 dominios fundamentales del ecosistema Omnisync-AI.
 */
export const InfrastructurePillarSchema = z.enum([
  'RELATIONAL_PERSISTENCE', // Supabase / PostgreSQL
  'VOLATILE_MEMORY',        // Upstash / Redis
  'VECTOR_MEMORY',          // Qdrant Cloud
  'COGNITIVE_ENGINE',       // Google Gemini API
  'GOVERNANCE_SWARM'        // Agent Factory / Orchestrator
]);

/**
 * @name InfrastructureHeartbeatSchema
 * @description Contrato inmutable para el pulso individual de un componente.
 */
export const InfrastructureHeartbeatSchema = z.object({
  /** Nombre nominal del nodo (ej: 'Supabase-Cluster-Primary') */
  nodeName: z.string().min(2),
  /** Clasificación dentro de los 5 pilares */
  pillar: InfrastructurePillarSchema,
  /** Estado detectado por la sonda física */
  operationalStatus: InfrastructureNodeHealthStatusSchema,
  /** Latencia medida en la ejecución del handshake */
  responseTimeInMilliseconds: z.number().nonnegative(),
  /** Marca de tiempo ISO-8601 del último pulso */
  lastCheckTimestamp: z.string().datetime(),
  /** Detalle técnico del error capturado por el Sentinel (opcional) */
  forensicErrorMessage: z.string().optional(),
  /** Sugerencia de remediación para la interfaz administrativa */
  remediationPath: z.string().optional(),
}).readonly();

/**
 * @name GlobalHealthReportSchema
 * @description Contrato maestro para la visión 360° de la infraestructura.
 * Orquesta la consolidación de todos los pilares bajo un ADN común.
 * 
 * @protocol OEDP-Level: Elite (Health-Sovereignty V4.0)
 */
export const GlobalHealthReportSchema = z.object({
  /** Identificador único universal del reporte de salud */
  reportIdentifier: z.string().uuid(),
  /** Trazabilidad distribuida para auditoría cruzada */
  traceIdentifier: z.string().uuid(),
  /** Marca de tiempo de la consolidación total */
  timestamp: z.string().datetime(),
  /** Estado general calculado por el algoritmo de triaje */
  overallHealthStatus: InfrastructureNodeHealthStatusSchema,
  /** Diccionario de pilares auditados indexado por identificador técnico */
  infrastructureComponents: z.record(z.string(), InfrastructureHeartbeatSchema),
  /** Entorno de ejecución (Production, Staging, Development) */
  executionEnvironment: z.string(),
  /** Versión del motor de salud del Framework */
  engineVersion: z.literal('OEDP-V4.0-HEALTH-PULSE'),
}).readonly();

/** @type IInfrastructureNodeHealthStatus */
export type IInfrastructureNodeHealthStatus = z.infer<typeof InfrastructureNodeHealthStatusSchema>;
/** @type IInfrastructurePillar */
export type IInfrastructurePillar = z.infer<typeof InfrastructurePillarSchema>;
/** @type IInfrastructureHeartbeat */
export type IInfrastructureHeartbeat = z.infer<typeof InfrastructureHeartbeatSchema>;
/** @type IGlobalHealthReport */
export type IGlobalHealthReport = z.infer<typeof GlobalHealthReportSchema>;