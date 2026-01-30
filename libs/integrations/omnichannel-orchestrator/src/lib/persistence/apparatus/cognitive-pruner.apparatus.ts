/** libs/integrations/omnichannel-orchestrator/src/lib/persistence/apparatus/cognitive-pruner.apparatus.ts */

import { IConversationFragment } from '../schemas/context-memory.schema';

/**
 * @name CognitivePrunerApparatus
 * @description Motor de optimización de ventana de contexto.
 * Asegura que la IA siempre tenga la directiva de sistema y los últimos mensajes
 * de trabajo, eliminando el ruido intermedio.
 */
export class CognitivePrunerApparatus {
  private static readonly TOKEN_BUDGET_THRESHOLD = 4000;
  private static readonly MAX_WORKING_MESSAGES = 10;

  public static executeSovereignPruning(history: IConversationFragment[]): IConversationFragment[] {
    /**
     * @section Algoritmo de Preservación de Capas
     * 1. Siempre conservamos 'SYSTEM_DIRECTIVE'.
     * 2. Conservamos los fragmentos marcados como 'Pinned'.
     * 3. Conservamos los últimos N mensajes de 'WORKING_CONTEXT'.
     */
    const systemLayer = history.filter(f => f.layer === 'SYSTEM_DIRECTIVE' || f.metadata?.isPinned);
    const activityLayer = history.filter(f => f.layer !== 'SYSTEM_DIRECTIVE' && !f.metadata?.isPinned);
    
    const recentActivity = activityLayer.slice(-this.MAX_WORKING_MESSAGES);

    return [...systemLayer, ...recentActivity];
  }
}