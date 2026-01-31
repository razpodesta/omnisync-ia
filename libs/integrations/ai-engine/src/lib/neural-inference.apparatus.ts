/** libs/integrations/ai-engine/src/lib/neural-inference.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { AIUsageAuditor } from '@omnisync/core-auditor';
import {
  OmnisyncContracts,
  IArtificialIntelligenceDriver,
  IArtificialIntelligenceModelConfiguration,
  IAIResponse,
  AIResponseSchema,
  TenantId,
} from '@omnisync/core-contracts';

/**
 * @name NeuralInferenceApparatus
 * @description Aparato de élite encargado de la orquestación, ejecución y
 * normalización de inferencias generativas. Actúa como el puente de verdad
 * entre los drivers de bajo nivel y los orquestadores de flujo neural,
 * integrando la soberanía financiera mediante auditoría de tokens en tiempo real.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Financial-Cognitive-Integration V3.2.1)
 * @vision Ultra-Holística: Zero-Waste-Inference & Forensic-Traceability
 */
export class NeuralInferenceApparatus {
  /**
   * @method executeGenerativeInference
   * @description Nodo maestro de inferencia. Orquesta la resiliencia del driver,
   * calcula el consumo energético (tokens) y sella la respuesta bajo contrato SSOT.
   *
   * @param {IArtificialIntelligenceDriver} driver - Implementación técnica activa (Gemini, etc).
   * @param {string} prompt - Instrucción cognitiva enriquecida (System + RAG + Context).
   * @param {IArtificialIntelligenceModelConfiguration} configuration - Hiperparámetros de ejecución.
   * @param {string} conversationId - Identificador único del hilo de diálogo.
   * @param {TenantId} tenantId - Identificador nominal para soberanía financiera.
   * @returns {Promise<IAIResponse>} Respuesta validada bajo estándar SSOT con auditoría completada.
   */
  public static async executeGenerativeInference(
    driver: IArtificialIntelligenceDriver,
    prompt: string,
    configuration: IArtificialIntelligenceModelConfiguration,
    conversationId: string,
    tenantId: TenantId,
  ): Promise<IAIResponse> {
    const apparatusName = 'NeuralInferenceApparatus';
    const operationName = `inference:${driver.providerName}`;

    /**
     * @section Resolución de ADN de Entrada (Pre-Ignición)
     * RESOLUCIÓN TS2304: Movemos el cálculo fuera del callback para que sea accesible
     * en el objeto de metadatos de la telemetría.
     */
    const inputTokensCount = driver.calculateTokens(prompt);

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        try {
          /**
           * @section Fase 1: Ejecución Resiliente
           * Delegamos la ejecución al Sentinel para manejar reintentos y backoff exponencial.
           */
          const rawInferenceResult =
            await OmnisyncSentinel.executeWithResilience(
              () => driver.generateResponse(prompt, configuration),
              apparatusName,
              operationName,
            );

          // 2. Post-cálculo de ADN de Salida
          const outputTokensCount = driver.calculateTokens(rawInferenceResult);

          /**
           * @section Fase 2: Soberanía Financiera (Auditoría)
           * Registramos el consumo de forma asíncrona para no bloquear la respuesta al usuario.
           */
          this.triggerFinancialAudit(
            tenantId,
            driver.providerName,
            configuration.modelName,
            inputTokensCount,
            outputTokensCount,
          );

          /**
           * @section Fase 3: Normalización y Mapeo
           * Transformamos el resultado crudo en un contrato de IA soberano.
           */
          return this.mapSuccessfulInference(
            conversationId,
            rawInferenceResult,
          );
        } catch (criticalInferenceError: unknown) {
          /**
           * @section Fase 4: Activación de Protocolo Failsafe
           * Reportamos la anomalía y retornamos una respuesta de seguridad institucional.
           */
          return await this.handleInferenceFailure(
            apparatusName,
            operationName,
            conversationId,
            criticalInferenceError,
          );
        }
      },
      {
        estimatedInputTokens: inputTokensCount,
        modelTier: configuration.modelName,
        tenantId,
      },
    );
  }

  /**
   * @method mapSuccessfulInference
   * @private
   * @description Realiza el triaje semántico de la respuesta para determinar el flujo operativo.
   */
  private static mapSuccessfulInference(
    conversationId: string,
    rawText: string,
  ): IAIResponse {
    const apparatusName = 'NeuralInferenceApparatus:Mapper';
    const normalizedText = rawText.trim();

    /**
     * @section Algoritmo de Triaje Operativo
     * Identificamos si la IA requiere intervención humana o escalación a sistemas ERP.
     */
    const requiresHumanEscalation =
      normalizedText.includes('ESCALATE_TO_HUMAN') ||
      normalizedText.includes('HUMAN_REQUIRED');

    const requiresERPPovisioning =
      normalizedText.includes('TICKET_REQUIRED') ||
      normalizedText.includes('ESCALATED_TO_ERP');

    const responsePayload: unknown = {
      conversationId,
      suggestion: normalizedText,
      status: requiresERPPovisioning
        ? 'ESCALATED_TO_ERP'
        : requiresHumanEscalation
        ? 'NEED_HUMAN'
        : 'RESOLVED',
      /**
       * NIVELACIÓN: Heurística de confianza basada en densidad.
       */
      confidenceScore: normalizedText.length > 10 ? 0.98 : 0.7,
      sourceManuals: [], 
    };

    return OmnisyncContracts.validate(
      AIResponseSchema,
      responsePayload,
      apparatusName,
    );
  }

  /**
   * @method triggerFinancialAudit
   * @private
   * @description Despacha la intención de cobro al auditor de consumo.
   */
  private static triggerFinancialAudit(
    tenantId: TenantId,
    provider: string,
    model: string,
    input: number,
    output: number,
  ): void {
    const traceId = crypto.randomUUID();

    AIUsageAuditor.auditInferenceConsumption({
      tenantId,
      traceId,
      model: `${provider}:${model}`,
      inputTokens: input,
      outputTokens: output,
    }).catch((auditError) => {
      OmnisyncTelemetry.verbose(
        'NeuralInferenceApparatus',
        'audit_leak',
        `Incapacidad de registrar consumo: ${String(auditError)}`,
      );
    });
  }

  /**
   * @method handleInferenceFailure
   * @private
   * @description Orquesta la respuesta del sistema ante fallos críticos del cluster de IA.
   */
  private static async handleInferenceFailure(
    apparatus: string,
    operation: string,
    conversationId: string,
    error: unknown,
  ): Promise<IAIResponse> {
    await OmnisyncSentinel.report({
      errorCode: 'OS-INTEG-601',
      severity: 'HIGH',
      apparatus,
      operation,
      message: 'integrations.ai_engine.inference_failure',
      context: { error: String(error), conversationId },
      isRecoverable: true,
    });

    return AIResponseSchema.parse({
      conversationId,
      suggestion: 'CORE_AI_OFFLINE_RETRY_LATER',
      status: 'NEED_HUMAN',
      confidenceScore: 0,
      sourceManuals: [],
    });
  }
}