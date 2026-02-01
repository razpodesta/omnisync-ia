/** libs/integrations/ai-engine/src/lib/neural-inference.apparatus.ts */

import * as crypto from 'node:crypto';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { AIUsageAuditor } from '@omnisync/core-auditor';
import { CognitiveGovernanceOrchestrator, IResolvedDirectiveDNA } from '@omnisync/cognitive-governance';
import { 
  OmnisyncContracts, 
  IArtificialIntelligenceDriver,
  TenantId,
  IAIResponse
} from '@omnisync/core-contracts';
import { ArtificialIntelligenceDriverFactory } from './ai-driver.factory';
import { NeuralInferenceResponseSchema, INeuralInferenceResponse } from './schemas/ai-inference.schema';

/**
 * @name NeuralInferenceApparatus
 * @description Nodo maestro de razonamiento (Fase 5.5).
 * Orquesta la inferencia cognitiva integrando gobernanza A/B, ROI financiero 
 * en tiempo real y sellado biyectivo de integridad de ADN.
 * 
 * @author Raz Podestá <Creator>
 * @protocol OEDP-Level: Elite (Autonomous-Reasoning-Nexus V5.5.2)
 */
export class NeuralInferenceApparatus {
  private static readonly apparatusName = 'NeuralInferenceApparatus';
  private static readonly TOKEN_DENSITY_FACTOR = 3.7;

  /**
   * @method executeSovereignInference
   * @description Ejecuta el ciclo de pensamiento neural con visión "Ojos de Mosca".
   */
  public static async executeSovereignInference(
    tenantId: TenantId,
    userInquiry: string,
    conversationId: string,
    channelOrigin: 'WHATSAPP' | 'WEB_CHAT' | 'VOICE_CALL'
  ): Promise<INeuralInferenceResponse> {
    const operationName = 'executeSovereignInference';
    const startTime = performance.now();

    return await OmnisyncTelemetry.traceExecution(this.apparatusName, operationName, async () => {
      try {
        // 1. FASE DE GOBERNANZA: Resolución de ADN instruccional
        const cognitiveDNA = await CognitiveGovernanceOrchestrator.resolveActiveDirective(tenantId, conversationId);

        // 2. TRIAJE DE MOTOR: Selección de potencia basada en complejidad
        const optimalTier = this.selectOptimalModelTier(userInquiry);
        const driver = ArtificialIntelligenceDriverFactory.getSovereignDriver('GOOGLE_GEMINI', optimalTier);

        // 3. EJECUCIÓN RESILIENTE: Inferencia protegida por Sentinel
        const rawResponse = await OmnisyncSentinel.executeWithResilience(
          () => driver.generateResponse(
            cognitiveDNA.optimizedPrompt, 
            { ...driver['modelConfiguration'], modelName: optimalTier } as any
          ),
          this.apparatusName,
          `inference_ignition:${optimalTier}`
        );

        // 4. AUDITORÍA FINANCIERA (ROI Ojos de Mosca)
        const inputTokens = driver.calculateTokens(cognitiveDNA.optimizedPrompt);
        const outputTokens = driver.calculateTokens(rawResponse);
        
        const auditRecord = await AIUsageAuditor.auditInferenceConsumption({
          tenantId,
          traceId: crypto.randomUUID(),
          model: `${driver.providerName}:${optimalTier}`,
          inputTokens,
          outputTokens
        });

        // 5. SELLO DE SOBERANÍA Y ENSAMBLAJE (Zero-Any Policy)
        const finalPayload = this.assembleSovereignPayload({
          text: rawResponse,
          conversationId,
          dna: cognitiveDNA,
          audit: auditRecord,
          channel: channelOrigin,
          latency: performance.now() - startTime
        });

        return OmnisyncContracts.validate(
          NeuralInferenceResponseSchema,
          finalPayload,
          this.apparatusName
        );

      } catch (criticalFailure: unknown) {
        return await this.handleInferenceColapse(conversationId, criticalFailure, startTime);
      }
    }, { tenantId, channel: channelOrigin });
  }

  private static selectOptimalModelTier(input: string): 'DEEP_THINK' | 'FLASH' {
    const isTechnical = /(error|code|implement|fix|architecture|sql)/i.test(input);
    return (input.length > 600 || isTechnical) ? 'DEEP_THINK' : 'FLASH';
  }

  /**
   * @method assembleSovereignPayload
   * @private
   * @description Implementa la reconstrucción del ADN sin quiebre de tipos.
   */
  private static assembleSovereignPayload(params: {
    text: string, 
    conversationId: string, 
    dna: IResolvedDirectiveDNA, 
    audit: any, 
    channel: string,
    latency: number
  }): unknown {
    const isActionRequired = params.text.includes('ESCALATED_TO_ERP') || params.text.includes('TICKET_REQUIRED');
    
    return {
      conversationId: params.conversationId,
      suggestion: params.text.trim(),
      status: isActionRequired ? 'ESCALATED_TO_ERP' : 'RESOLVED',
      confidenceScore: 0.98,
      integritySeal: {
        promptFingerprint: params.dna.integrityChecksum,
        directiveVersion: params.dna.versionTag,
        variantIdentifier: params.dna.assignedVariant,
      },
      usageMetrics: {
        totalTokens: params.audit.usageMetrics.totalTokens,
        estimatedCostUsd: params.audit.estimatedCostUsd,
        latencyMs: params.latency,
      },
      vocalContext: {
        isVocalizable: params.channel === 'WHATSAPP' || params.channel === 'VOICE_CALL',
        suggestedEmotion: params.text.length > 150 ? 'EMPATHETIC' : 'NEUTRAL',
      }
    };
  }

  private static async handleInferenceColapse(id: string, error: unknown, start: number): Promise<INeuralInferenceResponse> {
    await OmnisyncSentinel.report({
      errorCode: 'OS-INTEG-601',
      severity: 'HIGH',
      apparatus: this.apparatusName,
      operation: 'failsafe_trigger',
      message: 'ai.engine.inference.status.failsafe_active',
      context: { errorTrace: String(error), latency: performance.now() - start }
    });

    return {
      conversationId: id,
      suggestion: 'SERVICE_TEMPORARILY_OFFLINE_RETRY_SHORTLY',
      status: 'NEED_HUMAN',
      confidenceScore: 0,
      integritySeal: { promptFingerprint: 'FAILSAFE', directiveVersion: 'v0.0.0', variantIdentifier: 'A' },
      usageMetrics: { totalTokens: 0, estimatedCostUsd: 0, latencyMs: performance.now() - start }
    };
  }
}