/** apps/orchestrator-api/src/app/apparatus/action-dispatcher.apparatus.ts */

import * as crypto from 'node:crypto';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncSecurity } from '@omnisync/core-security';
import { OmnisyncEnterpriseResourcePlanningOrchestrator } from '@omnisync/erp-engine';
import { OdooAdapterApparatus } from '@omnisync/erp-odoo';
import { TokenPricingApparatus } from '@omnisync/core-auditor';

import {
  INeuralIntent,
  ITenantConfiguration,
  IAIResponse as IArtificialIntelligenceResponse,
  IEnterpriseResourcePlanningActionResponse,
  IEnterpriseResourcePlanningAdapter,
  OmnisyncContracts,
  EnterpriseResourcePlanningActionResponseSchema,
  TenantId
} from '@omnisync/core-contracts';

import { 
  ActionRiskAssessmentSchema,
  IActionRiskAssessment,
  IDigitalSanction
} from '../schemas/action-dispatcher.schema';

/**
 * @name ActionDispatcherApparatus
 * @description Nodo maestro de Soberanía Transaccional (Fase 5.5).
 * Orquesta la ejecución de mutaciones mediante el Protocolo de Sello Biyectivo.
 * Implementa la visión "Ojos de Mosca": audita integridad, riesgo y ROI.
 * 
 * @author Raz Podestá <Creator>
 * @protocol OEDP-Level: Elite (Sovereign-Transactional-Authority V5.5.2)
 */
export class ActionDispatcherApparatus {
  private static readonly apparatusName = 'ActionDispatcherApparatus';

  /**
   * @method dispatchOperationalAction
   * @description Punto de ignición para mutaciones ERP con validación de Firma de Conciencia.
   */
  public static async dispatchOperationalAction(
    incomingNeuralIntent: INeuralIntent,
    aiResponse: IArtificialIntelligenceResponse,
    tenantConfig: ITenantConfiguration,
    sanction?: IDigitalSanction
  ): Promise<IEnterpriseResourcePlanningActionResponse | undefined> {
    const operationName = 'dispatchOperationalAction';

    // 1. Gate de Estado: Solo procedemos si la IA disparó la señal de escalación.
    if (aiResponse.status !== 'ESCALATED_TO_ERP') return undefined;

    return await OmnisyncTelemetry.traceExecution(this.apparatusName, operationName, async () => {
      
      const currentPayloadHash = this.calculatePayloadFingerprint(aiResponse.suggestion);
      const riskReport = this.performFlyEyeRiskAssessment(aiResponse, tenantConfig);

      // 2. PROTOCOLO ACTION GUARD: Suspensión Preventiva
      if (riskReport.mitigationStrategy === 'WAIT_FOR_HUMAN' && !sanction) {
        return this.suspendActionForHumanSanction(incomingNeuralIntent, tenantConfig.id, riskReport, currentPayloadHash);
      }

      // 3. AUDITORÍA DE INTEGRIDAD BIYECTIVA (Frontera de Seguridad)
      if (sanction) {
        this.validateSanctionIntegrity(sanction, currentPayloadHash, tenantConfig);
      }

      try {
        const adapter = await this.resolveSovereignAdapter(tenantConfig);

        // 4. EJECUCIÓN FÍSICA EN CLUSTER EXTERNO
        const response = await OmnisyncEnterpriseResourcePlanningOrchestrator.executeServiceTicketProvisioning(
          adapter,
          {
            userId: incomingNeuralIntent.externalUserId,
            subject: `Neural_Task: ${incomingNeuralIntent.id.substring(0, 8)}`,
            description: aiResponse.suggestion,
            priority: 'MEDIUM',
            _integritySeal: currentPayloadHash,
            _sanctionRef: sanction?.signatureHash
          }
        );

        return OmnisyncContracts.validate(
          EnterpriseResourcePlanningActionResponseSchema,
          response,
          `${this.apparatusName}:FinalExecution`
        );

      } catch (criticalError: unknown) {
        return await this.handleDispatchColapse(tenantConfig.id, incomingNeuralIntent.id, criticalError);
      }
    }, { tenantId: tenantConfig.id, intentId: incomingNeuralIntent.id });
  }

  /**
   * @method performFlyEyeRiskAssessment
   * @private
   * @description Triaje Multifocal OEDP V5.5: Seguridad + ROI Predictivo.
   */
  private static performFlyEyeRiskAssessment(
    ai: IArtificialIntelligenceResponse, 
    config: ITenantConfiguration
  ): IActionRiskAssessment {
    // ROI: Uso de factor de entropía técnica /3.7 (Standard 2026)
    const tokens = Math.ceil(ai.suggestion.length / 3.7);
    const cost = TokenPricingApparatus.calculateCost('gemini-1.5-pro', tokens, tokens);
    
    let score = (1 - ai.confidenceScore) * 100;
    
    // Penalización por Configuración de Tenant (Hardened Security)
    if (config.enterpriseResourcePlanning.governance.manualApprovalRequired) score = 100;
    
    // Penalización por Impacto Financiero (> $0.15 USD por mutación activa el Action Guard)
    if (cost > 0.15) score += 30;

    const finalScore = Math.min(100, score);

    return ActionRiskAssessmentSchema.parse({
      riskScore: finalScore,
      riskLevel: finalScore > 85 ? 'CRITICAL_BLOCK' : finalScore > 45 ? 'CAUTION' : 'SAFE',
      mitigationStrategy: finalScore > 45 ? 'WAIT_FOR_HUMAN' : 'AUTO_EXECUTE',
      financialImpactUsd: cost,
      estimatedLatencyMs: 850 // Baseline Odoo API v16
    });
  }

  private static calculatePayloadFingerprint(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private static validateSanctionIntegrity(sanction: IDigitalSanction, currentHash: string, config: ITenantConfiguration): void {
    const isHashValid = sanction.approvedPayloadHash === currentHash;
    
    if (!isHashValid) {
       throw new Error('OS-SEC-500: ADN de mutación alterado entre la propuesta y la sanción.');
    }
  }

  private static suspendActionForHumanSanction(
    intent: INeuralIntent, 
    tenantId: TenantId, 
    risk: IActionRiskAssessment,
    hash: string
  ): IEnterpriseResourcePlanningActionResponse {
    OmnisyncTelemetry.verbose(this.apparatusName, 'guard_suspension', `Acción suspendida por riesgo: ${risk.riskScore}%`);

    return {
      success: true,
      syncStatus: 'PENDING_APPROVAL',
      messageKey: 'action.dispatcher.status.suspended',
      latencyInMilliseconds: 0,
      actionGuardContext: {
        suspensionReasonIdentifier: risk.riskLevel,
        riskAssessmentScore: risk.riskScore,
        suspendedAt: new Date().toISOString(),
        originalIntentSnapshot: { payloadHash: hash, cost: risk.financialImpactUsd } as any
      },
      operationalMetadata: { 
        intentId: intent.id, 
        tenantId,
        governanceRole: 'ACTION_GUARD_V5'
      }
    };
  }

  private static async resolveSovereignAdapter(config: ITenantConfiguration): Promise<IEnterpriseResourcePlanningAdapter> {
    const key = process.env['SYSTEM_ENCRYPTION_KEY'] || 'FAILSAFE_KEY';
    const decrypted = await OmnisyncSecurity.decryptSensitiveData(
      config.enterpriseResourcePlanning.encryptedCredentials, key
    );
    const connectionData = JSON.parse(decrypted);

    return config.enterpriseResourcePlanning.adapterIdentifier.startsWith('ODOO') 
      ? new OdooAdapterApparatus(connectionData) 
      : new OdooAdapterApparatus(connectionData); 
  }

  private static async handleDispatchColapse(tenantId: TenantId, intentId: string, error: unknown): Promise<IEnterpriseResourcePlanningActionResponse> {
    await OmnisyncSentinel.report({
      errorCode: 'OS-INTEG-604',
      severity: 'HIGH',
      apparatus: this.apparatusName,
      operation: 'dispatch_colapse',
      message: 'action.dispatcher.status.buffer_mode',
      context: { tenantId, intentId, errorTrace: String(error) },
      isRecoverable: true
    });

    return {
      success: false,
      syncStatus: 'FAILED_RETRYING',
      messageKey: 'action.dispatcher.status.buffer_mode',
      latencyInMilliseconds: 0,
      operationalMetadata: { tenantId, intentId, error: 'ERP_UNREACHABLE' }
    };
  }
}