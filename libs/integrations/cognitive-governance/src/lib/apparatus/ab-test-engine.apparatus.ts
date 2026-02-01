/** libs/integrations/cognitive-governance/src/lib/apparatus/ab-test-engine.apparatus.ts */

import * as crypto from 'node:crypto';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { TenantId } from '@omnisync/core-contracts';

import { 
  ICognitiveGovernanceContext,
  IPromptVersion 
} from '../schemas/cognitive-governance.schema';

/**
 * @name ABTestEngineApparatus
 * @description Orquestador de experimentos neurales Darwinianos (Fase 5.0).
 * Gestiona el sharding determinista de tráfico mediante algoritmos de hashing 
 * inmutables, asegurando que cada identidad de usuario mantenga coherencia 
 * cognitiva (Stickiness) a través de las diferentes versiones del ADN instruccional.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Deterministic-Evolution-Engine V5.0)
 */
export class ABTestEngineApparatus {
  private static readonly apparatusName = 'ABTestEngineApparatus';

  /**
   * @method resolveExperimentalDirective
   * @description Nodo de decisión de ruteo. Resuelve qué versión de la conciencia 
   * debe ser inyectada basándose en el pulso determinista del usuario.
   * 
   * @param {ICognitiveGovernanceContext} context - Contexto de gobernanza validado.
   * @param {string} userIdentifier - Semilla de identidad para el sharding.
   * @returns {IPromptVersion} La versión de ADN (A o B) resultante.
   */
  public static resolveExperimentalDirective(
    context: ICognitiveGovernanceContext,
    userIdentifier: string
  ): IPromptVersion {
    const operationName = 'resolveExperimentalDirective';

    return OmnisyncTelemetry.traceExecutionSync(this.apparatusName, operationName, () => {
      const config = context.abTesting;

      // 1. Gate de Soberanía: Si no hay experimento activo o falta la hebra B, devolvemos producción.
      if (!config || !config.isActive || !context.experimentalVersion) {
        return context.activeVersion;
      }

      /**
       * @section Sharding Determinista (OEDP V5.0)
       * Generamos un pulso de probabilidad basado en el Hash del usuario y el experimento.
       * Inyectar el experimentName asegura que los grupos de usuarios se barajen
       * de forma distinta en cada nuevo experimento (Anti-Bias Sharding).
       */
      const shardingPulse = this.calculateDeterministicPulse(
        `${context.tenantId}:${userIdentifier}:${config.experimentName}`
      );

      const isVariantBAssigned = shardingPulse < config.trafficSplit;

      OmnisyncTelemetry.verbose(this.apparatusName, 'traffic_sharded', 
        `User: ${userIdentifier.substring(0, 8)} | Variant: ${isVariantBAssigned ? 'B' : 'A'}`,
        { pulse: shardingPulse.toFixed(4), threshold: config.trafficSplit }
      );

      /**
       * @note Resolución con Failsafe
       * Si el algoritmo decide Variante B pero el ADN experimental ha sido purgado,
       * el Sentinel reporta la discrepancia y el sistema cae en variante A.
       */
      if (isVariantBAssigned && !context.experimentalVersion) {
        this.reportExperimentalOrphan(context.tenantId, config.experimentName);
        return context.activeVersion;
      }

      return isVariantBAssigned ? context.experimentalVersion : context.activeVersion;
    });
  }

  /**
   * @method evaluateExperimentSuccess
   * @description Algoritmo de triaje comparativo para la evolución Darwiniana.
   * Calcula el ganador basándose en la eficiencia financiera (Tokens) y el éxito cognitivo.
   */
  public static evaluateExperimentSuccess(
    metricsA: { sentimentScore: number, tokensUsed: number },
    metricsB: { sentimentScore: number, tokensUsed: number }
  ): 'VARIANT_A' | 'VARIANT_B' | 'INCONCLUSIVE' {
    /**
     * @section Fórmula de Eficacia (MetaShark V5.0)
     * Ponderamos el sentimiento (70%) contra el gasto de tokens (30%).
     * Un ADN instruccional es superior si logra mejor sentimiento con menor densidad.
     */
    const calculateScore = (m: { sentimentScore: number, tokensUsed: number }) => 
      (m.sentimentScore * 0.7) - ((m.tokensUsed / 1000) * 0.3);

    const scoreA = calculateScore(metricsA);
    const scoreB = calculateScore(metricsB);
    const delta = Math.abs(scoreA - scoreB);

    // Umbral de significación estadística técnica
    if (delta < 0.08) return 'INCONCLUSIVE';

    return scoreA > scoreB ? 'VARIANT_A' : 'VARIANT_B';
  }

  /**
   * @method calculateDeterministicPulse
   * @private
   * @description Transmuta una semilla textual en un valor normalizado [0, 1].
   */
  private static calculateDeterministicPulse(seed: string): number {
    const hash = crypto.createHash('sha256').update(seed).digest('hex');
    // Resolución de 32 bits para máxima precisión en sharding masivo.
    const integer = parseInt(hash.substring(0, 8), 16);
    return integer / 0xffffffff;
  }

  /**
   * @method reportExperimentalOrphan
   * @private
   */
  private static async reportExperimentalOrphan(tenantId: TenantId, experiment: string): Promise<void> {
    await OmnisyncSentinel.report({
      errorCode: 'OS-DOM-403',
      severity: 'MEDIUM',
      apparatus: this.apparatusName,
      operation: 'resolve_variant',
      message: `Experimento [${experiment}] activo pero sin ADN experimental cargado.`,
      context: { tenantId },
      isRecoverable: true
    });
  }
}