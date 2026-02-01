/** libs/tools/internal-scripts/src/lib/schemas/i18n-guardian.schema.ts */

import { z } from 'zod';

/**
 * @name I18nAnomalyTypeSchema
 * @description Define la taxonomía exhaustiva de violaciones de simetría lingüística.
 * Erradica cualquier ambigüedad en la clasificación de errores de ADN.
 */
export const I18nAnomalyTypeSchema = z.enum([
  'MISSING_FILE',          // Silo físico inexistente
  'KEY_MISMATCH',          // Llave presente en Master pero ausente en Target
  'REDUNDANT_KEY',        // Llave presente en Target pero ausente en Master
  'EMPTY_CONTENT',         // Llave existente pero sin valor textual
  'PLACEHOLDER_DETECTED',  // Contenido con patrones "TODO" o "PLACEHOLDER"
  'INVALID_JSON'           // Corrupción estructural del archivo
]);

/**
 * @name I18nAnomalySchema
 * @description Contrato inmutable para el rastro de una irregularidad detectada.
 */
export const I18nAnomalySchema = z.object({
  /** Ruta física o identificador nominal del aparato afectado */
  apparatusIdentifier: z.string(),
  /** Idioma donde se localizó la anomalía (es, en, pt) */
  targetLocale: z.string().length(2),
  /** Namespace de traducción (ej: 'hero-section') */
  namespace: z.string(),
  /** Nivel de impacto en la experiencia de usuario */
  severity: z.enum(['CRITICAL', 'WARNING']),
  /** Clasificación técnica de la anomalía */
  anomalyType: I18nAnomalyTypeSchema,
  /** Ruta específica dentro del JSON (ej: 'slides.infra.title') */
  keyPath: z.string().optional(),
  /** Explicación técnica detallada para el ingeniero */
  technicalDetails: z.string(),
}).readonly();

/**
 * @name I18nIntegrityReportSchema
 * @description Contrato maestro para la semilla de integridad lingüística.
 * Orquesta la visión 360° de la paridad idiomática del monorepo.
 * 
 * @protocol OEDP-Level: Elite (Full-Sovereign-Report V4.0)
 */
export const I18nIntegrityReportSchema = z.object({
  /** Identificador único universal del proceso de auditoría */
  reportIdentifier: z.string().uuid(),
  /** Marca de tiempo ISO-8601 del cierre de la inspección */
  timestamp: z.string().datetime(),
  /** Indicador binario de salud absoluta (Cero anomalías críticas) */
  isSymmetric: z.boolean(),
  /** Cantidad total de aparatos/namespaces auditados */
  auditedNamespacesCount: z.number().nonnegative(),
  
  /**
   * @section Estadísticas de Consolidación
   */
  statistics: z.object({
    totalKeysScanned: z.number().nonnegative(),
    compliancePercentage: z.number().min(0).max(100),
    criticalAnomaliesCount: z.number().nonnegative(),
    warningAnomaliesCount: z.number().nonnegative(),
  }),

  /** Colección detallada de violaciones bajo contrato SSOT */
  anomalies: z.array(I18nAnomalySchema),

  /** Contexto interpretativo para el motor de Inteligencia Artificial */
  aiContext: z.object({
    summary: z.string(),
    remediationPath: z.string(),
    engineVersion: z.literal('OEDP-V4.0-ELITE'),
  }),
}).readonly();

/** @type II18nAnomaly */
export type II18nAnomaly = z.infer<typeof I18nAnomalySchema>;
/** @type II18nIntegrityReport */
export type II18nIntegrityReport = z.infer<typeof I18nIntegrityReportSchema>;