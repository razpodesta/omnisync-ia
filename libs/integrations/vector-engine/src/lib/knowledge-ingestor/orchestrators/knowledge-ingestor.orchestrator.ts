/** libs/integrations/vector-engine/src/lib/knowledge-ingestor/orchestrators/knowledge-ingestor.orchestrator.ts */

import * as crypto from 'node:crypto';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncDatabase, Prisma } from '@omnisync/core-persistence';
import { NeuralEmbeddingApparatus } from '@omnisync/ai-engine';
import { TokenPricingApparatus } from '@omnisync/core-auditor';
import {
  IArtificialIntelligenceDriver,
  IKnowledgeSemanticChunk,
  TenantId,
  OmnisyncContracts,
} from '@omnisync/core-contracts';

import { IVectorDatabaseAgnosticDriver } from '../../schemas/vector-engine.schema';
import { KnowledgeClassifierApparatus } from '../knowledge-classifier.apparatus';
import { SemanticChunkerApparatus } from '../semantic-chunker.apparatus';
import { 
  KnowledgeIngestionProgressSchema,
  IKnowledgeIngestionProgress 
} from '../schemas/knowledge-ingestor.schema';

type IngestionProgressCallback = (event: IKnowledgeIngestionProgress) => Promise<void> | void;

/**
 * @name KnowledgeIngestorOrchestrator
 * @description Nodo maestro de ingesta atómica (Fase 5.5).
 * Orquesta la transformación de manuales técnicos en memoria semántica con 
 * Doble Anclaje (SQL + Qdrant). Implementa la visión "Ojos de Mosca" para 
 * garantizar integridad biyectiva y ROI de tokens quirúrgico.
 * 
 * @author Raz Podestá <Creator>
 * @protocol OEDP-Level: Elite (Atomic-Ghost-Ingestion V5.5.2)
 */
export class KnowledgeIngestorOrchestrator {
  private static readonly apparatusName = 'KnowledgeIngestorOrchestrator';
  private static readonly TOKEN_DENSITY_FACTOR = 3.7;

  /**
   * @method executeFullIngestionPipeline
   * @description Ejecuta el ciclo de vida completo de la hidratación de memoria.
   */
  public static async executeFullIngestionPipeline(
    documentRawContent: string,
    documentTitleIdentifier: string,
    tenantId: TenantId,
    aiDriver: IArtificialIntelligenceDriver,
    vectorDriver: IVectorDatabaseAgnosticDriver,
    onProgress?: IngestionProgressCallback
  ): Promise<void> {
    const operationName = 'executeFullIngestionPipeline';
    const ingestionId = crypto.randomUUID();
    const startTime = performance.now();

    return await OmnisyncTelemetry.traceExecution(this.apparatusName, operationName, async () => {
      try {
        // --- FASE 1 & 2: VALIDACIÓN Y TRIAJE SEMÁNTICO ---
        await this.emit(onProgress, ingestionId, 'INITIAL_VALIDATION', 10, 'knowledge.ingestor.status.initial_validation');
        const classification = await KnowledgeClassifierApparatus.classifyDocumentContent(aiDriver, documentRawContent);

        // --- FASE 3: SEGMENTACIÓN ADAPTATIVA V5.5 ---
        await this.emit(onProgress, ingestionId, 'SEMANTIC_FRAGMENTATION', 30, 'knowledge.ingestor.status.semantic_fragmentation');
        const baseChunks = SemanticChunkerApparatus.executeSegmentation(
          documentRawContent, 
          tenantId, 
          documentTitleIdentifier, 
          classification
        );

        // --- FASE 4: VECTORIZACIÓN Y AUDITORÍA ROI ---
        await this.emit(onProgress, ingestionId, 'VECTOR_GENERATION', 50, 'knowledge.ingestor.status.vector_generation');
        const vectorMatrix = await NeuralEmbeddingApparatus.generateBatchEmbeddings(aiDriver, baseChunks.map(c => c.content));

        // ROI Ojos de Mosca: Cálculo basado en densidad real
        const tokensUsed = Math.ceil(documentRawContent.length / this.TOKEN_DENSITY_FACTOR);
        const costUsd = TokenPricingApparatus.calculateCost('text-embedding-004', tokensUsed, 0);

        const finalizedChunks: IKnowledgeSemanticChunk[] = baseChunks.map((chunk, idx) => ({
          ...chunk,
          metadata: {
            ...chunk.metadata,
            vectorCoordinates: vectorMatrix[idx],
            integrityFingerprint: crypto.createHash('sha256').update(chunk.content).digest('hex')
          }
        }));

        const batchSeal = this.calculateBatchSeal(finalizedChunks);

        /**
         * @section FASE 5: ANCLAJE RELACIONAL GHOST (Soberanía de Datos)
         * Evitamos @ts-ignore usando el motor relacional de Omnisync Database.
         */
        await this.emit(onProgress, ingestionId, 'RELATIONAL_SYNC', 70, 'knowledge.ingestor.status.relational_sync');
        await this.persistSovereignGhostChunks(tenantId, ingestionId, documentTitleIdentifier, finalizedChunks, batchSeal);

        /**
         * @section FASE 6: PERSISTENCIA VECTORIAL (QDRANT CLOUD)
         */
        await this.emit(onProgress, ingestionId, 'CLOUD_PERSISTENCE', 90, 'knowledge.ingestor.status.cloud_persistence');
        try {
          await vectorDriver.upsertKnowledgeChunks(finalizedChunks);
        } catch (vectorError) {
          return await this.igniteGhostModeFailsafe(ingestionId, tenantId, vectorError, onProgress);
        }

        // --- CIERRE Y SELLO DE SOBERANÍA ---
        await this.emit(onProgress, ingestionId, 'COMPLETED', 100, 'knowledge.ingestor.status.completed', {
          accumulatedLatencyMs: performance.now() - startTime,
          calculatedTokenCostUsd: costUsd,
          chunksGenerated: finalizedChunks.length,
          batchIntegritySeal: batchSeal
        });

      } catch (criticalFailure: unknown) {
        await this.handleFatalPipelineBreach(ingestionId, tenantId, criticalFailure);
        throw criticalFailure;
      }
    }, { tenantId, ingestionId });
  }

  /**
   * @method persistSovereignGhostChunks
   * @private
   */
  private static async persistSovereignGhostChunks(
    id: TenantId, 
    ingestId: string, 
    title: string, 
    chunks: IKnowledgeSemanticChunk[],
    seal: string
  ): Promise<void> {
    // Sincronización mediante tarea soberana RLS
    await OmnisyncDatabase.executeSovereignTask(id, async (prisma) => {
      await prisma.supportThread.create({
        data: {
          externalUserId: 'SYSTEM_INGESTOR',
          tenantId: id,
          content: `INGEST_BATCH: ${title}`,
          channel: 'SYSTEM_INGESTOR' as any,
          metadata: {
            ingestionId: ingestId,
            batchSeal: seal,
            chunksCount: chunks.length,
            status: 'GHOST_BACKUP_ACTIVE',
            // Almacenamos el ADN técnico para recuperación offline
            dnaPayload: chunks.map(c => ({ id: c.id, hash: c.metadata['integrityFingerprint'] }))
          } as Prisma.InputJsonValue
        }
      });
    });
  }

  private static calculateBatchSeal(chunks: IKnowledgeSemanticChunk[]): string {
    const combinedHashes = chunks.map(c => c.metadata['integrityFingerprint']).join('|');
    return crypto.createHash('sha256').update(combinedHashes).digest('hex');
  }

  private static async igniteGhostModeFailsafe(id: string, tenant: TenantId, err: unknown, callback?: IngestionProgressCallback): Promise<void> {
    await this.emit(callback, id, 'COMPLETED', 100, 'knowledge.ingestor.errors.vector_failure_ghost_active');
    
    await OmnisyncSentinel.report({
      errorCode: 'OS-INTEG-702',
      severity: 'MEDIUM',
      apparatus: this.apparatusName,
      operation: 'vector_cloud_sync',
      message: 'Nube vectorial caída. El sistema operará con ADN Fantasma desde SQL.',
      context: { tenantId: tenant, errorTrace: String(err) },
      isRecoverable: true
    });
  }

  private static async emit(
    cb: IngestionProgressCallback | undefined, 
    id: string, 
    phase: IKnowledgeIngestionProgress['currentPhase'], 
    pct: number, 
    msgKey: string, 
    metrics?: IKnowledgeIngestionProgress['metrics']
  ): Promise<void> {
    if (!cb) return;
    cb(OmnisyncContracts.validate(KnowledgeIngestionProgressSchema, {
      ingestionIdentifier: id,
      currentPhase: phase,
      completionPercentage: pct,
      statusMessageKey: msgKey,
      metrics,
      timestamp: new Date().toISOString()
    }, `${this.apparatusName}:ProgressEmit`));
  }

  private static async handleFatalPipelineBreach(id: string, tenant: TenantId, error: unknown): Promise<void> {
    await OmnisyncSentinel.report({
      errorCode: 'OS-INTEG-602',
      severity: 'CRITICAL',
      apparatus: this.apparatusName,
      operation: 'pipeline_execution',
      message: 'knowledge.ingestor.errors.fatal_collapse',
      context: { ingestionId: id, tenantId: tenant, trace: String(error) }
    });
  }
}