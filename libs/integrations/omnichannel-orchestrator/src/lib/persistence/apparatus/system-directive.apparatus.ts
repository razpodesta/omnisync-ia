/** libs/integrations/omnichannel-orchestrator/src/lib/persistence/apparatus/system-directive.apparatus.ts */

import { IConversationFragment } from '../schemas/context-memory.schema';

/**
 * @name SystemDirectiveApparatus
 * @description Especialista en la inyección de ADN de comportamiento.
 * Preparado para conectar con el Dashboard de Contextos mediante inyección de metadatos.
 */
export class SystemDirectiveApparatus {
  /**
   * @method createBaseDirective
   * @description Genera el fragmento maestro que guía la inferencia.
   */
  public static createBaseDirective(instruction: string, agentId?: string): IConversationFragment {
    return {
      role: 'system',
      content: instruction.trim(),
      layer: 'SYSTEM_DIRECTIVE',
      sentiment: 'NEUTRAL',
      timestamp: new Date().toISOString(),
      tokenWeight: Math.ceil(instruction.length / 4),
      metadata: {
        isPinned: true,
        agentId,
        instructionVersion: 'V3.0-ELITE'
      }
    };
  }
}