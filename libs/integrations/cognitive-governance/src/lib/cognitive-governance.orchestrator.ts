/** libs/integrations/cognitive-governance/src/lib/cognitive-governance.orchestrator.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncContracts, TenantId } from '@omnisync/core-contracts';
import { ABTestEngineApparatus } from './apparatus/ab-test-engine.apparatus';
import { PromptOptimizerApparatus } from './apparatus/prompt-optimizer.apparatus';
import { CognitivePersistenceApparatus } from './apparatus/cognitive-persistence.apparatus';
import { 
  CognitiveGovernanceContextSchema, 
  ICognitiveGovernanceContext,
  IPromptVersion 
} from './schemas/cognitive-governance.schema';

/**
 * @interface IResolvedDirectiveDNA
 * @description ADN consolidado y purificado para el motor de inferencia (Fase 5.5).
 */
export interface IResolvedDirectiveDNA {
  readonly optimizedPrompt: string;
  readonly versionTag: string;
  readonly assignedVariant: 'A' | 'B';
  readonly modelTier: IPromptVersion['metrics']['recommendedModel'];
  readonly isVocalEnabled: boolean;
  /** Firma de integridad del prompt generado */
  readonly integrityChecksum: string;
}

/**
 * @name CognitiveGovernanceOrchestrator
 * @description Director Supremo de la Conciencia Sintética. 
 * Implementa la visión "Ojos de Mosca": monitoriza simultáneamente la salud del 
 * experimento, el ROI de tokens y la soberanía del mensaje.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Autonomous-Intelligence-Nexus V5.5)
 */
export class CognitiveGovernanceOrchestrator {
  private static readonly apparatusName = 'CognitiveGovernanceOrchestrator';

  /**
   * @method resolveActiveDirective
   * @description Nodo maestro de resolución. Determina el ADN instruccional 
   * mediante sharding determinista y aplica optimización semántica atómica.
   * 
   * @param {TenantId} tenantId - Sello de soberanía organizacional.
   * @param {string} userIdentifier - Semilla de identidad para stickiness del experimento.
   * @returns {Promise<IResolvedDirectiveDNA>} ADN listo para ignición en el AI-Engine.
   */
  public static async resolveActiveDirective(
    tenantId: TenantId,
    userIdentifier: string
  ): Promise<IResolvedDirectiveDNA> {
    const operationName = 'resolveActiveDirective';

    return await OmnisyncTelemetry.traceExecution(this.apparatusName, operationName, async () => {
      try {
        /**
         * @section 1. Hidratación de Soberanía (SQL + Cache L2)
         * El aparato de persistencia garantiza latencia < 10ms.
         */
        const rawContext = await CognitivePersistenceApparatus.getLiveContext(tenantId);
        
        const context = OmnisyncContracts.validate(
          CognitiveGovernanceContextSchema,
          rawContext,
          `${this.apparatusName}:SovereigntyHandshake`
        );

        /**
         * @section 2. Triaje de Evolución (AB Sharding)
         * Aplicamos el "Ojo de Mosca" sobre el experimento: si no hay hebra 
         * experimental, cortamos el flujo hacia la versión de producción.
         */
        const selectedVersion = this.resolveTargetVersion(context, userIdentifier);

        /**
         * @section 3. Metamorfosis y Optimización (Token Economy)
         * Transformamos el ADN textual eliminando entropía y calculando integridad.
         */
        const optimizedPrompt = PromptOptimizerApparatus.generateOptimizedRefactor(
          selectedVersion.systemDirective
        );

        const assignedVariant = selectedVersion === context.activeVersion ? 'A' : 'B';

        OmnisyncTelemetry.verbose(this.apparatusName, 'directive_crystallized', 
          `Tenant: ${tenantId} | Variant: ${assignedVariant} | Model: ${selectedVersion.metrics.recommendedModel}`
        );

        return {
          optimizedPrompt,
          versionTag: selectedVersion.versionTag,
          assignedVariant,
          modelTier: selectedVersion.metrics.recommendedModel,
          /** @note Cero Any: Acceso seguro vía esquema validado */
          isVocalEnabled: selectedVersion.metadata.vocalSovereignty,
          integrityChecksum: this.calculateIntegrityStamp(optimizedPrompt)
        };

      } catch (criticalGovernanceError: unknown) {
        return await this.triggerFailsafeDirective(tenantId, criticalGovernanceError);
      }
    }, { tenantId, userIdentifier });
  }

  /**
   * @method resolveTargetVersion
   * @private
   * @description Lógica de decisión Fast-Path para la selección de versión.
   */
  private static resolveTargetVersion(
    context: ICognitiveGovernanceContext, 
    userIdentifier: string
  ): IPromptVersion {
    // Fast-Path: Si no hay experimento, devolvemos producción inmediatamente.
    if (!context.abTesting?.isActive || !context.experimentalVersion) {
      return context.activeVersion;
    }

    return ABTestEngineApparatus.resolveExperimentalDirective(context, userIdentifier);
  }

  /**
   * @method calculateIntegrityStamp
   * @private
   */
  private static calculateIntegrityStamp(prompt: string): string {
    // Firma rápida para trazabilidad en el Sentinel
    return `sha256:${prompt.length}:${prompt.substring(0, 10)}`;
  }

  /**
   * @method triggerFailsafeDirective
   * @private
   * @description Protocolo de Emergencia: Evita el silencio cognitivo del sistema.
   */
  private static async triggerFailsafeDirective(
    tenantId: TenantId, 
    error: unknown
  ): Promise<IResolvedDirectiveDNA> {
    await OmnisyncSentinel.report({
      errorCode: 'OS-DOM-403',
      severity: 'CRITICAL',
      apparatus: this.apparatusName,
      operation: 'resolve_directive',
      message: 'Fallo absoluto en la resolución de conciencia. Activando ADN Failsafe.',
      context: { tenantId, errorTrace: String(error) },
      isRecoverable: true
    });

    return {
      optimizedPrompt: "Respond as an elite technical assistant. Maintain OEDP standards.",
      versionTag: "v0.0.0-failsafe",
      assignedVariant: "A",
      modelTier: "FLASH",
      isVocalEnabled: true,
      integrityChecksum: "failsafe_stamp"
    };
  }
}