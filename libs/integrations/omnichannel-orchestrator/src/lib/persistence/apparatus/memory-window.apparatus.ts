/** libs/integrations/omnichannel-orchestrator/src/lib/persistence/apparatus/memory-window.apparatus.ts */

import { IConversationFragment } from '../schemas/context-memory.schema';

/**
 * @name MemoryWindowApparatus
 * @description Especialista en la gestión de la "Ventana de Atención". 
 * Aplica algoritmos de poda (Pruning) para mantener solo lo vital.
 */
export class MemoryWindowApparatus {
  private static readonly MAXIMUM_TURNS_RETAINED = 12;

  /**
   * @method pruneHistory
   * @description Mantiene la memoria dentro de límites saludables para la IA.
   */
  public static pruneHistory(history: IConversationFragment[]): IConversationFragment[] {
    if (history.length <= this.MAXIMUM_TURNS_RETAINED) return history;
    
    // Mantenemos siempre el primer mensaje (Contexto inicial) y los últimos N
    const systemContext = history.filter(h => h.role === 'system');
    const recentActivity = history.slice(-this.MAXIMUM_TURNS_RETAINED);
    
    return [...systemContext, ...recentActivity];
  }
}