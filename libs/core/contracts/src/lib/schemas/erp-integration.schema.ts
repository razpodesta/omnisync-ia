/** libs/core/contracts/src/lib/schemas/erp-integration.schema.ts */

import { z } from 'zod';

/**
 * @name EnterpriseResourcePlanningSyncStatusSchema
 * @description Define la taxonomía inmutable de estados de consistencia y 
 * gobierno transaccional entre el ecosistema neural y los sistemas externos.
 * 
 * @protocol OEDP-Level: Elite (Transactional-State-Sovereignty V4.0)
 */
export const EnterpriseResourcePlanningSyncStatusSchema = z.enum([
  /** Sincronización íntegra: Transacción físicamente completada en el ERP. */
  'SYNCED',
  /** Transacción aceptada por el driver: El procesamiento remoto está en curso. */
  'PENDING_REMOTE',
  /** PROTOCOLO ACTION GUARD: Suspensión preventiva para validación humana. */
  'PENDING_APPROVAL',
  /** RECHAZO SOBERANO: Un administrador humano denegó la propuesta de la IA. */
  'REJECTED_BY_ADMIN',
  /** Error transitorio: El Sentinel orquestará reintentos automáticos. */
  'FAILED_RETRYING',
  /** Violación de lógica o colisión de datos: Requiere intervención técnica. */
  'MANUAL_INTERVENTION_REQUIRED',
  /** Inconsistencia detectada en el ADN del dato durante el handshake. */
  'SCHEMA_MISMATCH_ANOMALY'
]);

/**
 * @type IEnterpriseResourcePlanningSyncStatus
 */
export type IEnterpriseResourcePlanningSyncStatus = z.infer<
  typeof EnterpriseResourcePlanningSyncStatusSchema
>;

/**
 * @name ActionGuardContextSchema
 * @description Contrato para el rastro de suspensión de una acción sensible.
 * Provee la evidencia necesaria para el triaje en el Dashboard Administrativo.
 */
const ActionGuardContextSchema = z.object({
  /** Identificador de la regla de seguridad disparada */
  suspensionReasonIdentifier: z.string(),
  /** Nivel de riesgo detectado por el analista de sensibilidad */
  riskAssessmentScore: z.number().min(0).max(100),
  /** Marca de tiempo del bloqueo preventivo */
  suspendedAt: z.string().datetime(),
  /** Datos de la intención neural original para re-ejecución */
  originalIntentSnapshot: z.record(z.string(), z.unknown()).optional(),
}).readonly();

/**
 * @name EnterpriseResourcePlanningActionResponseSchema
 * @description Contrato maestro de Única Fuente de Verdad (SSOT) para respuestas operativas.
 * Orquesta la visión 360° del éxito técnico, la latencia y la soberanía del dato.
 */
export const EnterpriseResourcePlanningActionResponseSchema = z.object({
  /** Indica si el pipeline de despacho (no necesariamente la ejecución final) fue exitoso. */
  success: z.boolean(),

  /** Identificador inmutable (Primary Key) retornado por el cluster externo. */
  externalIdentifier: z.string().min(1).optional(),

  /** Estado de sincronización actual bajo la taxonomía V4.0. */
  syncStatus: EnterpriseResourcePlanningSyncStatusSchema,

  /** Llave de internacionalización (i18n) para la comunicación visual. */
  messageKey: z.string().min(5),

  /** Latencia física del cluster remoto medida en milisegundos. */
  latencyInMilliseconds: z.number().nonnegative(),

  /** 
   * @section Contexto Action Guard
   * Solo presente si el estado es 'PENDING_APPROVAL'.
   */
  actionGuardContext: ActionGuardContextSchema.optional(),

  /** 
   * @section Metadatos Forenses
   * Información enriquecida: números de ticket, estados de inventario o hashes de integridad.
   */
  operationalMetadata: z.object({
    adapterVersion: z.string().default('V4.0-ELITE'),
    executionTraceId: z.string().uuid(),
    remoteStatusCode: z.number().optional(),
    digitalFingeprint: z.string().optional(), // Para futura notarización Blockchain
  }).catchall(z.unknown()),
}).readonly();

/** @type IEnterpriseResourcePlanningActionResponse */
export type IEnterpriseResourcePlanningActionResponse = z.infer<
  typeof EnterpriseResourcePlanningActionResponseSchema
>;

/**
 * @name IEnterpriseResourcePlanningAdapter
 * @description Interfaz de contrato de alta fidelidad para adaptadores de sistemas externos.
 * Garantiza el agnosticismo total del orquestador mediante despacho polimórfico.
 * 
 * @protocol OEDP-Standard: Zero Discrepancy
 */
export interface IEnterpriseResourcePlanningAdapter {
  /** Nombre comercial y tier del conector (ej: 'ODOO_V16_ENTERPRISE_CLOUD'). */
  readonly providerName: string;

  /**
   * @method createOperationTicket
   * @description Registra una incidencia operativa o transaccional.
   */
  createOperationTicket(
    operationalPayload: unknown,
  ): Promise<IEnterpriseResourcePlanningActionResponse>;

  /**
   * @method validateCustomerExistence
   * @description Sensor de soberanía: verifica la identidad en el cluster remoto.
   */
  validateCustomerExistence(
    customerPhoneNumber: string,
  ): Promise<IEnterpriseResourcePlanningActionResponse>;

  /**
   * @method getTransactionalStatus
   * @description (Fase 4 Expansion) Consulta el estado de una acción PENDING.
   */
  getTransactionalStatus?(
    externalIdentifier: string
  ): Promise<IEnterpriseResourcePlanningActionResponse>;
}