/** libs/integrations/omnichannel-orchestrator/src/lib/persistence/apparatus/context-memory.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncContracts } from '@omnisync/core-contracts';
/**
 * @section Sincronización de Persistencia
 * RESOLUCIÓN TS2307: Se actualiza al alias nominal soberano.
 */
import { OmnisyncMemory } from '@omnisync/core-persistence';

import {
  ConversationFragmentSchema,
  IConversationFragment,
} from '../schemas/context-memory.schema';
import { CognitivePrunerApparatus } from './cognitive-pruner.apparatus';
import { SystemDirectiveApparatus } from './system-directive.apparatus';

/**
 * @name ContextMemoryApparatus
 * @description Orquestador de Memoria Estratificada.
 * Gestiona la coherencia del diálogo optimizando el uso de tokens y reduciendo
 * la latencia de consulta mediante el triaje de capas de contexto.
 * 
 * @protocol OEDP-Level: Elite (Cognitive-Sovereignty V3.0)
 */
export class ContextMemoryApparatus {
  /**
   * @method pushConversationFragment
   * @description Registra un turno de diálogo con análisis de sentimiento y peso cognitivo.
   */
  public static async pushConversationFragment(
    sessionIdentifier: string,
    role: 'user' | 'assistant',
    content: string,
    layer: 'EPISODIC_MEMORY' | 'WORKING_CONTEXT' = 'WORKING_CONTEXT'
  ): Promise<void> {
    const apparatusName = 'ContextMemoryApparatus';

    return await OmnisyncTelemetry.traceExecution(apparatusName, 'pushFragment', async () => {
      const fragment: IConversationFragment = {
        role,
        content: content.trim(),
        layer,
        sentiment: this.detectSentiment(content),
        timestamp: new Date().toISOString(),
        tokenWeight: Math.ceil(content.length / 4)
      };

      const validatedFragment = OmnisyncContracts.validate(
        ConversationFragmentSchema,
        fragment,
        apparatusName
      );

      await OmnisyncMemory.pushHistory(sessionIdentifier, validatedFragment);
    });
  }

  /**
   * @method getSovereignContext
   * @description Recupera el contexto optimizado para la IA. 
   * Inyecta directivas de sistema y aplica poda cognitiva para ahorrar datos.
   */
  public static async getSovereignContext(
    sessionIdentifier: string,
    systemInstruction: string,
    agentId?: string
  ): Promise<IConversationFragment[]> {
    const apparatusName = 'ContextMemoryApparatus';

    return await OmnisyncTelemetry.traceExecution(apparatusName, 'getSovereignContext', async () => {
      // 1. Recuperación de Memoria Episódica desde Redis (Única consulta optimizada)
      const rawHistory = await OmnisyncMemory.getHistory(sessionIdentifier, 15);

      const conversationHistory = rawHistory.map((item: unknown) => 
        item as IConversationFragment
      );

      // 2. Inyección de Directiva de Sistema (Soberanía de Personalidad)
      const masterDirective = SystemDirectiveApparatus.createBaseDirective(systemInstruction, agentId);

      // 3. Poda Cognitiva (Optimización de Presupuesto de Tokens)
      // Solo enviamos lo vital para mantener la coherencia sin saturar el modelo.
      const optimizedContext = CognitivePrunerApparatus.executeSovereignPruning(
        [masterDirective, ...conversationHistory]
      );

      OmnisyncTelemetry.verbose(apparatusName, 'context_ready', 
        `Contexto nivelado: ${optimizedContext.length} fragmentos.`
      );

      return optimizedContext;
    });
  }

  private static detectSentiment(content: string): IConversationFragment['sentiment'] {
    const text = content.toLowerCase();
    if (['urgente', 'error', 'falla', 'malo', 'ayuda'].some(p => text.includes(p))) return 'URGENT';
    if (['gracias', 'genial', 'excelente', 'perfecto'].some(p => text.includes(p))) return 'POSITIVE';
    return 'NEUTRAL';
  }
}