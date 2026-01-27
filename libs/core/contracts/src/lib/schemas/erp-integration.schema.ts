/** libs/core/contracts/src/lib/schemas/erp-integration.schema.ts */

import { z } from 'zod';

/**
 * @name EnterpriseResourcePlanningSyncStatusSchema
 * @description Define los estados inmutables de sincronización entre el Neural Hub
 * y los sistemas de gestión externos.
 */
export const EnterpriseResourcePlanningSyncStatusSchema = z.enum([
  'SYNCED',
  'PENDING',
  'FAILED_RETRYING',
  'MANUAL_INTERVENTION'
]);

/**
 * @name IEnterpriseResourcePlanningAdapter
 * @description Interfaz de contrato de élite que debe implementar cualquier
 * conector de ERP (Lego Piece). Garantiza que el orquestador sea agnóstico
 * al sistema final.
 *
 * @protocol OEDP-Standard: No Abbreviations
 */
export interface IEnterpriseResourcePlanningAdapter {
  /** Identificador comercial del proveedor (ej: 'SAP_S4HANA', 'ODOO_V17') */
  readonly providerName: string;

  /**
   * @method createOperationTicket
   * @description Registra una incidencia o requerimiento en el sistema externo.
   */
  createOperationTicket(data: unknown): Promise<{
    readonly externalIdentifier: string;
    readonly operationalStatus: string;
  }>;

  /**
   * @method validateCustomerExistence
   * @description Verifica la presencia del cliente en la base de datos del ERP.
   */
  validateCustomerExistence(phoneNumber: string): Promise<{
    readonly exists: boolean;
    readonly externalIdentifier?: string;
  }>;
}

/**
 * @name EnterpriseResourcePlanningActionResponseSchema
 * @description Estructura Single Source of Truth (SSOT) para la respuesta de
 * cualquier acción ejecutada en el puente ERP.
 */
export const EnterpriseResourcePlanningActionResponseSchema = z.object({
  /** Indica si la operación técnica fue exitosa */
  success: z.boolean(),

  /** Identificador retornado por el sistema externo (opcional) */
  externalIdentifier: z.string().optional(),

  /** Estado de consistencia del dato tras la acción */
  syncStatus: EnterpriseResourcePlanningSyncStatusSchema,

  /** Llave de traducción para la interfaz de usuario (i18n) */
  messageKey: z.string(),

  /** Tiempo de respuesta del sistema externo para telemetría de performance */
  latencyInMilliseconds: z.number().nonnegative(),
}).readonly();

/**
 * @type IEnterpriseResourcePlanningActionResponse
 * @description Representación tipada de la respuesta de acción ERP.
 */
export type IEnterpriseResourcePlanningActionResponse = z.infer<typeof EnterpriseResourcePlanningActionResponseSchema>;
