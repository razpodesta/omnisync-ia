/** libs/integrations/omnichannel-orchestrator/src/lib/persistence/apparatus/omnichannel-history.orchestrator.ts */

import { INeuralIntent } from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { ContextMemoryApparatus } from './context-memory.apparatus';
import { ThreadAuditApparatus } from './thread-audit.apparatus';

/**
 * @name OmnichannelHistoryOrchestrator
 * @description Nodo de alta fidelidad encargado de la persistencia dual (Redis + SQL).
 * Garantiza la simetría entre el contexto de IA y la auditoría legal para cualquier canal.
 *
 * @protocol OEDP-Level: Elite (Sovereign Persistence)
 */
export class OmnichannelHistoryOrchestrator {
  /**
   * @method synchronizeIntent
   * @description Orquesta el volcado paralelo de la intención neural.
   */
  public static async synchronizeIntent(intent: INeuralIntent): Promise<void> {
    const apparatusName = 'OmnichannelHistoryOrchestrator';
    const sessionKey = `os:history:${intent.tenantId}:${intent.externalUserId}`;

    await OmnisyncTelemetry.traceExecution(
      apparatusName,
      'synchronizeIntent',
      async () => {
        await Promise.all([
          // 1. Memoria Humana (Redis con análisis de pulso emocional)
          ContextMemoryApparatus.pushConversationFragment(
            sessionKey,
            'user',
            intent.payload.content,
          ),

          // 2. Auditoría Forense (SQL Inmutable)
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
            },
          }),
        ]);
      },
    );
  }
}
