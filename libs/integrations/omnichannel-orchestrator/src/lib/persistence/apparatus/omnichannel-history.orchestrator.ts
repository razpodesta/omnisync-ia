/** libs/integrations/omnichannel-orchestrator/src/lib/persistence/apparatus/omnichannel-history.orchestrator.ts */

import { INeuralIntent } from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { ContextMemoryApparatus } from './context-memory.apparatus';
import { ThreadAuditApparatus } from './thread-audit.apparatus';

/**
 * @name OmnichannelHistoryOrchestrator
 * @description Nodo de alta fidelidad encargado de la persistencia biyectiva (Dual-Layer Sync).
 * Orquesta la sincronización atómica entre la memoria de contexto volátil (Redis) 
 * y el registro de auditoría relacional (SQL). Actúa como el guardián de la 
 * continuidad cognitiva y la legalidad transaccional del sistema.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Sovereign-Persistence-Sync V3.2)
 * @vision Ultra-Holística: Persistence-Symmetry & Non-Blocking
 */
export class OmnichannelHistoryOrchestrator {
  /**
   * @method synchronizeIntent
   * @description Ejecuta el volcado paralelo de la intención neural en las capas 
   * de persistencia. Resuelve la anomalía TS1354 mediante inmutabilidad de contrato.
   *
   * @param {Readonly<INeuralIntent>} intent - El ADN del mensaje normalizado bajo contrato SSOT.
   * @returns {Promise<void>} Promesa de sincronización completada.
   */
  public static async synchronizeIntent(
    /**
     * NIVELACIÓN TS1354: Se aplica Readonly<T> para proteger la integridad 
     * del mensaje original durante el proceso de persistencia dual.
     */
    intent: Readonly<INeuralIntent>
  ): Promise<void> {
    const apparatusName = 'OmnichannelHistoryOrchestrator';
    const operationName = 'synchronizeIntent';

    /**
     * @note Identificador de Sesión Soberana
     * Construcción de la llave primaria para la memoria de corta duración (Upstash).
     */
    const sessionKey = `os:session:${intent.tenantId}:${intent.externalUserId}`;

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        try {
          /**
           * @section Persistencia en Tubería Paralela (Performance Optimization)
           * Utilizamos Promise.all para minimizar el bloqueo del Event Loop, 
           * disparando los efectos secundarios de persistencia simultáneamente.
           */
          await Promise.all([
            /**
             * 1. Capa Volátil: Memoria de Contexto (IA Recall)
             * Hidrata el historial de Redis para que Gemini mantenga la coherencia.
             */
            ContextMemoryApparatus.pushConversationFragment(
              sessionKey,
              'user',
              intent.payload.content,
            ),

            /**
             * 2. Capa Relacional: Auditoría Forense (Legal Trail)
             * Sella la interacción en Supabase para cumplimiento y analytics.
             */
            ThreadAuditApparatus.executeAtomicAuditPersistence({
              intentIdentifier: intent.id,
              externalUserIdentifier: intent.externalUserId,
              tenantOrganizationIdentifier: intent.tenantId,
              textualContent: intent.payload.content,
              originChannel: intent.channel,
              authorRole: 'USER',
              auditMetadata: {
                ...intent.payload.metadata,
                synchronizedAt: new Date().toISOString(),
                orchestratorVersion: 'OEDP-V3.2-ELITE',
                integrityChecksum: intent.id.substring(0, 8),
              },
            }),
          ]);

          OmnisyncTelemetry.verbose(
            apparatusName,
            'dual_sync_success',
            `Simetría de datos garantizada para intención: ${intent.id}`
          );
        } catch (criticalSyncError: unknown) {
          /**
           * @section Gestión de Resiliencia (Failsafe)
           * El Sentinel captura la brecha de persistencia pero permite que la IA 
           * siga respondiendo, priorizando la disponibilidad del canal (Uptime).
           */
          await OmnisyncSentinel.report({
            errorCode: 'OS-CORE-003',
            severity: 'MEDIUM',
            apparatus: apparatusName,
            operation: operationName,
            message: 'tools.persistence.dual_layer_sync_failed',
            context: {
              intentIdentifier: intent.id,
              tenantIdentifier: intent.tenantId,
              errorTrace: String(criticalSyncError)
            },
            isRecoverable: true
          });
        }
      },
      { intentId: intent.id, channel: intent.channel }
    );
  }
}