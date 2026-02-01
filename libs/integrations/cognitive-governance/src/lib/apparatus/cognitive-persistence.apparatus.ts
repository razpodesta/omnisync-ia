/** libs/integrations/cognitive-governance/src/lib/apparatus/cognitive-persistence.apparatus.ts */

import * as crypto from 'node:crypto';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { 
  OmnisyncContracts, 
  TenantId, 
  ITenantConfiguration 
} from '@omnisync/core-contracts';
import { OmnisyncDatabase, OmnisyncMemory } from '@omnisync/core-persistence';
import { TokenPricingApparatus } from '@omnisync/core-auditor';

/** @section Sincronización de ADN Local */
import { 
  ICognitiveGovernanceContext, 
  CognitiveGovernanceContextSchema 
} from '../schemas/cognitive-governance.schema';
import { 
  ICognitivePersistenceHandshake,
  CognitivePersistenceHandshakeSchema 
} from '../schemas/cognitive-persistence.schema';

/**
 * @name CognitivePersistenceApparatus
 * @description Nodo maestro de hidratación de conciencia (Fase 5.5).
 * Orquesta la recuperación de identidad mediante el Protocolo de Cascada Resiliente.
 * Implementa la visión "Ojos de Mosca": audita integridad, latencia y ROI financiero.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Autonomous-Sovereignty-V5.5.1)
 */
export class CognitivePersistenceApparatus {
  private static readonly apparatusName = 'CognitivePersistenceApparatus';

  /**
   * @private
   * @description CAPA L0: HEBRA GÉNESIS. ADN inmutable de respaldo.
   */
  private static readonly GENESIS_DNA_STRAND: Partial<ICognitiveGovernanceContext> = {
    contextName: 'OMNISYNC_GENESIS_CORE',
    status: 'PRODUCTION',
    activeVersion: {
      versionTag: 'v0.0.0-genesis',
      systemDirective: 'Respond as an elite technical assistant. Cloud connectivity degraded. OEDP Active.',
      authorIdentifier: 'SYSTEM_ARCHITECT',
      metrics: { estimatedTokenWeight: 25, costEfficiencyScore: 100, recommendedModel: 'FLASH' },
      metadata: { vocalSovereignty: true, isFailsafe: true },
      timestamp: new Date().toISOString()
    }
  };

  /** Bóveda de Conciencia L1 (RAM) con Sello de Integridad */
  private static readonly L1_CONSCIENCE_VAULT = new Map<TenantId, { 
    conscienceStrand: ICognitiveGovernanceContext, 
    expirationTimestamp: number,
    integritySeal: string 
  }>();

  /**
   * @method getLiveContext
   * @description Recupera el ADN cognitivo aplicando el triaje multifocal L1-L3.
   */
  public static async getLiveContext(
    tenantOrganizationIdentifier: TenantId,
    configurationOverrides?: Partial<ICognitivePersistenceHandshake['performanceOptions']>
  ): Promise<ICognitiveGovernanceContext> {
    const operationName = 'getLiveContext';

    return await OmnisyncTelemetry.traceExecution(this.apparatusName, operationName, async () => {
      const handshake = OmnisyncContracts.validate(
        CognitivePersistenceHandshakeSchema,
        { tenantOrganizationIdentifier, performanceOptions: configurationOverrides },
        this.apparatusName
      );

      // --- CAPA L1: RESONANCIA RAM (<0.5ms) ---
      if (!handshake.performanceOptions.bypassCache) {
        const cachedEntry = this.L1_CONSCIENCE_VAULT.get(tenantOrganizationIdentifier);
        if (cachedEntry && cachedEntry.expirationTimestamp > Date.now()) {
          this.validateSovereignIntegrity(cachedEntry.conscienceStrand, cachedEntry.integritySeal, 'L1_RAM');
          return cachedEntry.conscienceStrand;
        }
      }

      // --- CAPA L2: MEMORIA VOLÁTIL REDIS (<12ms) ---
      try {
        const distributedDNA = await OmnisyncMemory.getHistory(`os:cog:dna:${tenantOrganizationIdentifier}`, 1);
        if (distributedDNA.length > 0) {
          const validatedDNA = OmnisyncContracts.validate(
            CognitiveGovernanceContextSchema,
            distributedDNA[0],
            `${this.apparatusName}:L2_Handshake`
          );
          this.hydrateL1Vault(tenantOrganizationIdentifier, validatedDNA, handshake.performanceOptions.cacheTtlSeconds);
          return validatedDNA;
        }
      } catch (l2Anomaly) {
        OmnisyncTelemetry.verbose(this.apparatusName, 'l2_bypass', 'Redis saturado o inalcanzable. Escalando a L3.');
      }

      // --- CAPA L3: PERSISTENCIA RELACIONAL SQL (SSOT) ---
      try {
        return await this.fetchConscienceFromRelationalCluster(handshake);
      } catch (l3Anomaly) {
        /**
         * @section PROTOCOLO GÉNESIS (L0)
         * Si el cluster SQL colapsa, el sistema activa la conciencia de emergencia autónoma.
         */
        return this.igniteGenesisConscience(tenantOrganizationIdentifier);
      }
    }, { tenantId: tenantOrganizationIdentifier });
  }

  /**
   * @method fetchConscienceFromRelationalCluster
   * @private
   */
  private static async fetchConscienceFromRelationalCluster(
    handshake: ICognitivePersistenceHandshake
  ): Promise<ICognitiveGovernanceContext> {
    return await OmnisyncSentinel.executeWithResilience(async () => {
      const tenantRecord = await OmnisyncDatabase.databaseEngine.tenant.findUnique({
        where: { id: handshake.tenantOrganizationIdentifier }
      });

      if (!tenantRecord) {
        throw new Error('cognitive.persistence.errors.not_found');
      }

      const mappedConscience = this.transformRelationalToCognitive(tenantRecord);
      
      const validatedConscience = OmnisyncContracts.validate(
        CognitiveGovernanceContextSchema,
        mappedConscience,
        `${this.apparatusName}:L3_Sealing`
      );

      await this.synchronizeConscienceCascade(handshake.tenantOrganizationIdentifier, validatedConscience, handshake.performanceOptions.cacheTtlSeconds);
      
      return validatedConscience;
    }, this.apparatusName, 'sql_rehydration');
  }

  /**
   * @method transformRelationalToCognitive
   * @private
   * @description Implementa la Visión de ROI: Calcula costo de entrada basado en entropía.
   */
  private static transformRelationalToCognitive(record: ITenantConfiguration): unknown {
    const systemPromptStrand = record.artificialIntelligence.systemPrompt;
    
    // Algoritmo de ROI OEDP V5.5: Estimación por densidad léxica
    const tokenWeight = Math.ceil(systemPromptStrand.length / 3.7);
    const inputCostUsd = TokenPricingApparatus.calculateCost('gemini-1.5-flash', tokenWeight, 0);

    return {
      tenantId: record.id,
      contextName: record.organizationName,
      status: record.status,
      activeVersion: {
        versionTag: 'v1.0.0-sovereign',
        systemDirective: systemPromptStrand,
        authorIdentifier: 'ADMIN_HANDSHAKE',
        metrics: {
          estimatedTokenWeight: tokenWeight,
          costEfficiencyScore: tokenWeight > 1200 ? 55 : 98,
          recommendedModel: 'FLASH'
        },
        metadata: { 
          vocalSovereignty: true,
          forecastedInputCost: inputCostUsd,
          integritySignature: this.calculateIntegritySeal(systemPromptStrand)
        },
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * @method igniteGenesisConscience
   * @private
   */
  private static igniteGenesisConscience(tenantId: TenantId): ICognitiveGovernanceContext {
    OmnisyncSentinel.report({
      errorCode: 'OS-DOM-503',
      severity: 'HIGH',
      apparatus: this.apparatusName,
      operation: 'failsafe_trigger',
      message: 'Colapso total de infraestructura. Activando ADN Génesis.',
      context: { tenantId }
    });

    return {
      ...this.GENESIS_DNA_STRAND,
      tenantId: tenantId
    } as ICognitiveGovernanceContext;
  }

  private static async synchronizeConscienceCascade(id: TenantId, dna: ICognitiveGovernanceContext, ttl: number): Promise<void> {
    this.hydrateL1Vault(id, dna, ttl);
    // Sincronización asíncrona no bloqueante con L2
    OmnisyncMemory.pushHistory(`os:cog:dna:${id}`, dna).catch(() => null);
  }

  private static hydrateL1Vault(id: TenantId, dna: ICognitiveGovernanceContext, ttl: number): void {
    this.L1_CONSCIENCE_VAULT.set(id, {
      conscienceStrand: dna,
      expirationTimestamp: Date.now() + (ttl * 1000),
      integritySeal: this.calculateIntegritySeal(dna)
    });
  }

  private static calculateIntegritySeal(data: unknown): string {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  private static validateSovereignIntegrity(dna: ICognitiveGovernanceContext, originalSeal: string, layer: string): void {
    if (this.calculateIntegritySeal(dna) !== originalSeal) {
      OmnisyncSentinel.report({
        errorCode: 'OS-SEC-500',
        severity: 'CRITICAL',
        apparatus: this.apparatusName,
        operation: 'integrity_audit',
        message: 'cognitive.persistence.errors.integrity_corruption',
        context: { tenantId: dna.tenantId, compromisedLayer: layer }
      });
      throw new Error(`OS-SEC-500: ADN Corrupto en ${layer}`);
    }
  }
}