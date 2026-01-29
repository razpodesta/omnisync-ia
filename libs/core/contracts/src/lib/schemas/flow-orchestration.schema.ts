/** libs/core/contracts/src/lib/schemas/flow-orchestration.schema.ts */

import { z } from 'zod';
import {
  AIResponseSchema as ArtificialIntelligenceResponseSchema,
  TenantIdSchema,
} from './core-contracts.schema';
import { EnterpriseResourcePlanningActionResponseSchema } from './erp-integration.schema';

/**
 * @name NeuralFlowResultSchema
 * @description Contrato maestro inmutable que define el resultado consolidado del cerebro neural.
 * Orquesta la convergencia entre la inferencia cognitiva y la ejecución transaccional en el ERP.
 * Es la Única Fuente de Verdad (SSOT) para todos los consumidores omnicanales del ecosistema.
 *
 * @protocol OEDP-Level: Elite (Full Semantic Sovereignty)
 */
export const NeuralFlowResultSchema = z
  .object({
    /**
     * @property neuralIntentIdentifier
     * @description Identificador único universal (UUID) de la intención original procesada.
     * Permite la trazabilidad biyectiva en el Sentinel y Telemetry.
     */
    neuralIntentIdentifier: z.string().uuid(),

    /**
     * @property tenantId
     * @description Sello de soberanía de la organización.
     * Implementado mediante Branded Type para evitar la colisión de primitivos en la lógica de dominio.
     */
    tenantId: TenantIdSchema,

    /**
     * @property artificialIntelligenceResponse
     * @description Carga útil estructurada proveniente del AI-Engine (Gemini/RAG).
     * Contiene la sugerencia generativa y los puntajes de confianza.
     */
    artificialIntelligenceResponse: ArtificialIntelligenceResponseSchema,

    /**
     * @property enterpriseResourcePlanningAction
     * @description Resultado de la operación ejecutada en el sistema de gestión externo.
     * Es opcional (nullable), ya que no toda intención neural deriva en una acción operativa.
     */
    enterpriseResourcePlanningAction:
      EnterpriseResourcePlanningActionResponseSchema.optional(),

    /**
     * @property finalMessage
     * @description Mensaje purificado, sanitizado e internacionalizado listo para la entrega al usuario final.
     */
    finalMessage: z.string().min(1),

    /**
     * @property executionTimeInMilliseconds
     * @description Latencia total del pipeline de orquestación medida quirúrgicamente.
     * Vital para el monitoreo de SLAs en el Dashboard de Administración.
     */
    executionTimeInMilliseconds: z.number().nonnegative(),
  })
  .readonly();

/**
 * @type INeuralFlowResult
 * @description Representación tipada e inmutable derivada del esquema de orquestación.
 */
export type INeuralFlowResult = z.infer<typeof NeuralFlowResultSchema>;
