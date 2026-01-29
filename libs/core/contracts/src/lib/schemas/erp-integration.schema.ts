/** libs/core/contracts/src/lib/schemas/erp-integration.schema.ts */

import { z } from 'zod';

/**
 * @name EnterpriseResourcePlanningSyncStatusSchema
 * @description Define la taxonomía inmutable de estados de consistencia entre la
 * infraestructura neural de Omnisync y los registros físicos en sistemas externos.
 */
export const EnterpriseResourcePlanningSyncStatusSchema = z.enum([
  /** Sincronización íntegra: Los datos son idénticos en ambos ecosistemas. */
  'SYNCED',
  /** Transacción aceptada: El procesamiento asíncrono está en curso en el sistema remoto. */
  'PENDING',
  /** Error transitorio: Fallo técnico detectado; el Sentinel está orquestando el reintento. */
  'FAILED_RETRYING',
  /** Violación de lógica: Requiere auditoría manual por parte de un administrador del nodo. */
  'MANUAL_INTERVENTION',
]);

/**
 * @type IEnterpriseResourcePlanningSyncStatus
 * @description Representación tipada de los estados de sincronización operativa.
 */
export type IEnterpriseResourcePlanningSyncStatus = z.infer<
  typeof EnterpriseResourcePlanningSyncStatusSchema
>;

/**
 * @name EnterpriseResourcePlanningActionResponseSchema
 * @description Contrato maestro de Única Fuente de Verdad (SSOT) para la respuesta
 * de cualquier operación operativa despachada hacia un ERP o CRM.
 *
 * @protocol OEDP-Level: Elite (Contract Unification)
 */
export const EnterpriseResourcePlanningActionResponseSchema = z
  .object({
    /**
     * @property success
     * @description Indica si la transacción técnica fue completada exitosamente en el destino.
     */
    success: z.boolean(),

    /**
     * @property externalIdentifier
     * @description Identificador inmutable (Primary Key) retornado por el sistema externo.
     */
    externalIdentifier: z.string().min(1).optional(),

    /**
     * @property syncStatus
     * @description Estado de sincronización actual bajo la taxonomía institucional de Omnisync.
     */
    syncStatus: EnterpriseResourcePlanningSyncStatusSchema,

    /**
     * @property messageKey
     * @description Llave semántica para la resolución de internacionalización (i18n) en la interfaz.
     */
    messageKey: z.string().min(5),

    /**
     * @property latencyInMilliseconds
     * @description Latencia quirúrgica del sistema externo medida desde el inicio de la petición.
     */
    latencyInMilliseconds: z.number().nonnegative(),

    /**
     * @property operationalMetadata
     * @description Diccionario de contexto enriquecido (ej: números de factura, estados de inventario).
     */
    operationalMetadata: z.record(z.string(), z.unknown()).default({}),
  })
  .readonly();

/**
 * @type IEnterpriseResourcePlanningActionResponse
 * @description Representación inmutable de la respuesta operativa.
 */
export type IEnterpriseResourcePlanningActionResponse = z.infer<
  typeof EnterpriseResourcePlanningActionResponseSchema
>;

/**
 * @name IEnterpriseResourcePlanningAdapter
 * @description Interfaz de contrato de alta fidelidad para adaptadores de sistemas externos.
 * Garantiza que cualquier implementación (Odoo, SAP, Salesforce) cumpla con la soberanía de tipos.
 *
 * @protocol OEDP-Standard: Zero Discrepancy
 */
export interface IEnterpriseResourcePlanningAdapter {
  /**
   * @property providerName
   * @description Nombre comercial y versión del conector (ej: 'ODOO_VERSION_17_COMMUNITY').
   */
  readonly providerName: string;

  /**
   * @method createOperationTicket
   * @description Registra una incidencia o evento transaccional en el sistema de gestión.
   * @param {unknown} operationalPayload - Carga útil de la operación (Validada por el esquema del adaptador).
   * @returns {Promise<IEnterpriseResourcePlanningActionResponse>} Respuesta sellada por contrato SSOT.
   */
  createOperationTicket(
    operationalPayload: unknown,
  ): Promise<IEnterpriseResourcePlanningActionResponse>;

  /**
   * @method validateCustomerExistence
   * @description Verifica la soberanía de la identidad del cliente en la base de datos externa.
   * @param {string} customerPhoneNumber - Identificador telefónico en formato internacional E.164.
   * @returns {Promise<IEnterpriseResourcePlanningActionResponse>} Resultado con el estado de éxito e identificador remoto.
   */
  validateCustomerExistence(
    customerPhoneNumber: string,
  ): Promise<IEnterpriseResourcePlanningActionResponse>;
}
