/** libs/core/contracts/src/lib/schemas/flow-orchestration.schema.ts */

import { z } from 'zod';
import {
  AIResponseSchema,
  TenantIdSchema
} from './core-contracts.schema';
import { ERPActionResponseSchema } from './erp-integration.schema';

/**
 * @name NeuralFlowResultSchema
 * @description Contrato maestro que define el resultado consolidado del cerebro neural.
 * Orquesta la unión de la inferencia de IA y las acciones ejecutadas en el ERP,
 * proporcionando una estructura única de verdad (SSOT) para los consumidores omnicanales.
 *
 * @protocol OEDP-Level: Elite (SSOT)
 */
export const NeuralFlowResultSchema = z.object({
  /** Identificador único de la intención original procesada */
  intentId: z.string().uuid(),

  /**
   * Identificador de soberanía de la organización.
   * NIVELACIÓN: Uso de Branded Type para garantizar integridad nominal.
   */
  tenantId: TenantIdSchema,

  /** Respuesta estructurada proveniente del AI Engine (Gemini/RAG) */
  aiResponse: AIResponseSchema,

  /**
   * Resultado de la operación en el sistema de gestión.
   * Es opcional ya que no toda consulta requiere una acción transaccional.
   */
  erpAction: ERPActionResponseSchema.optional(),

  /** Mensaje final curado y listo para ser transmitido al usuario */
  finalMessage: z.string().min(1),

  /** Latencia total del procesamiento neural medida en milisegundos */
  executionTime: z.number().nonnegative(),
}).readonly();

/**
 * @type INeuralFlowResult
 * @description Representación tipada del resultado de orquestación.
 */
export type INeuralFlowResult = z.infer<typeof NeuralFlowResultSchema>;
