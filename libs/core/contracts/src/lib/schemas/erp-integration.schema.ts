/** libs/core/contracts/src/lib/schemas/erp-integration.schema.ts */

import { z } from 'zod';

/**
 * @name EnterpriseResourcePlanningSyncStatusSchema
 * @description Define los estados inmutables de consistencia entre el ecosistema
 * Omnisync y los registros físicos en los sistemas externos (ERP/CRM).
 */
export const EnterpriseResourcePlanningSyncStatusSchema = z.enum([
  'SYNCED',               // Dato idéntico en ambos sistemas.
  'PENDING',              // Operación aceptada, procesamiento asíncrono en curso.
  'FAILED_RETRYING',      // Fallo técnico, Sentinel orquestando reintento.
  'MANUAL_INTERVENTION'   // Error lógico, requiere auditoría por parte del Tenant.
]);

export type IEnterpriseResourcePlanningSyncStatus = z.infer<typeof EnterpriseResourcePlanningSyncStatusSchema>;

/**
 * @name EnterpriseResourcePlanningActionResponseSchema
 * @description Contrato maestro SSOT para la respuesta de cualquier operación operativa.
 * Se ha unificado para eliminar la propiedad ambigua 'operationalStatus'.
 *
 * @protocol OEDP-Level: Elite (Contract Unification)
 */
export const EnterpriseResourcePlanningActionResponseSchema = z.object({
  /** Indica si la transacción técnica fue completada exitosamente */
  success: z.boolean(),

  /** Identificador inmutable retornado por el sistema externo */
  externalIdentifier: z.string().min(1).optional(),

  /** Estado de sincronización actual según la taxonomía institucional */
  syncStatus: EnterpriseResourcePlanningSyncStatusSchema,

  /** Llave semántica para resolución de internacionalización (i18n) */
  messageKey: z.string().min(5),

  /** Latencia quirúrgica del sistema externo medida en milisegundos */
  latencyInMilliseconds: z.number().nonnegative(),

  /** Contexto adicional del ERP (ej: número de factura, status de stock) */
  operationalMetadata: z.record(z.string(), z.unknown()).default({}),
}).readonly();

/** @type IEnterpriseResourcePlanningActionResponse */
export type IEnterpriseResourcePlanningActionResponse = z.infer<typeof EnterpriseResourcePlanningActionResponseSchema>;

/**
 * @name IEnterpriseResourcePlanningAdapter
 * @description Interfaz de contrato de élite para conectores de sistemas externos.
 * Todos los métodos ahora retornan el contrato unificado IEnterpriseResourcePlanningActionResponse.
 *
 * @protocol OEDP-Standard: Zero Discrepancy
 */
export interface IEnterpriseResourcePlanningAdapter {
  /** Nombre comercial y versión del conector (ej: 'ODOO_V17_COMMUNITY') */
  readonly providerName: string;

  /**
   * @method createOperationTicket
   * @description Registra un evento transaccional en el ERP destino.
   * @returns {Promise<IEnterpriseResourcePlanningActionResponse>} Respuesta validada por SSOT.
   */
  createOperationTicket(operationalPayload: unknown): Promise<IEnterpriseResourcePlanningActionResponse>;

  /**
   * @method validateCustomerExistence
   * @description Verifica la soberanía de la identidad del cliente en el ERP.
   * @returns {Promise<IEnterpriseResourcePlanningActionResponse>} Resultado con 'success' y 'externalIdentifier'.
   */
  validateCustomerExistence(customerPhoneNumber: string): Promise<IEnterpriseResourcePlanningActionResponse>;
}
