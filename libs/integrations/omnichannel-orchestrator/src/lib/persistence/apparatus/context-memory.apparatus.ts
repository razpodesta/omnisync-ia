/** libs/integrations/omnichannel-orchestrator/src/lib/persistence/apparatus/context-memory.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncContracts } from '@omnisync/core-contracts';
import { OmnisyncMemory } from '@omnisync-ecosystem/persistence';

/**
 * @section Importaciones Locales
 * Mantenemos la ruta relativa corta para componentes del mismo workspace.
 */
import {
  ConversationFragmentSchema,
  IConversationFragment,
} from '../schemas/context-memory.schema';
import { MemoryWindowApparatus } from './memory-window.apparatus';

/**
 * @name ContextMemoryApparatus
 * @description Aparato de élite para la gestión de "Memoria Humana".
 * Orquesta la coherencia conversacional mediante el almacenamiento estratificado
 * y la detección de pulso emocional para que la interacción se sienta orgánica.
 *
 * @protocol OEDP-Level: Elite (Alias-Sanated & Forensic)
 */
export class ContextMemoryApparatus {
  /**
   * @method pushConversationFragment
   * @description Registra un evento de diálogo con validación de contrato SSOT.
   * Implementa una lógica de 'humanización' mediante la detección automática de urgencia.
   */
  public static async pushConversationFragment(
    sessionIdentifier: string,
    role: 'user' | 'assistant',
    content: string,
  ): Promise<void> {
    const apparatusName = 'ContextMemoryApparatus';
    const operationName = 'pushConversationFragment';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        /**
         * @section Análisis de Pulso (Invisibilidad de IA)
         * Determinamos si el mensaje denota frustración o urgencia para
         * ajustar la prioridad en el cerebro neural.
         */
        const detectedSentiment = this.detectDialogueSentiment(content);

        const fragmentPayload: IConversationFragment = {
          role,
          content: content.trim(),
          sentiment: detectedSentiment,
          timestamp: new Date().toISOString(),
          /**
           * @note Cálculo de Peso Cognitivo
           * 1 token ≈ 4 caracteres (Estándar OpenAI/Gemini).
           */
          tokenWeight: Math.ceil(content.length / 4),
        };

        // Validación de Integridad de ADN (Pre-persistencia)
        const validatedFragment = OmnisyncContracts.validate(
          ConversationFragmentSchema,
          fragmentPayload,
          apparatusName,
        );

        await OmnisyncMemory.pushHistory(sessionIdentifier, validatedFragment);

        OmnisyncTelemetry.verbose(
          apparatusName,
          'episodic_sync',
          `Fragmento guardado para: ${sessionIdentifier}`,
        );
      },
    );
  }

  /**
   * @method getSovereignContext
   * @description Recupera el contexto optimizado para el motor de inferencia.
   * RESOLUCIÓN TS7006: Se tipa explícitamente el acumulador para erradicar el 'any'.
   */
  public static async getSovereignContext(
    sessionIdentifier: string,
  ): Promise<IConversationFragment[]> {
    const apparatusName = 'ContextMemoryApparatus';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      'getSovereignContext',
      async () => {
        // Recuperamos los últimos 20 fragmentos brutos de Redis
        const rawHistory: unknown[] = await OmnisyncMemory.getHistory(
          sessionIdentifier,
          20,
        );

        /**
         * @section Rehidratación Segura (Safe Cast)
         * Erradicamos el 'any' implícito del .map() mediante tipado de parámetro.
         */
        const formattedHistory: IConversationFragment[] = rawHistory.map(
          (item: unknown) => {
            return item as IConversationFragment;
          },
        );

        // Aplicación de poda de ventana (Soberanía de Atención)
        return MemoryWindowApparatus.pruneHistory(formattedHistory);
      },
    );
  }

  /**
   * @method detectDialogueSentiment
   * @private
   * @description Algoritmo de detección de pulso basado en patrones lingüísticos.
   */
  private static detectDialogueSentiment(
    content: string,
  ): IConversationFragment['sentiment'] {
    const text = content.toLowerCase();

    const urgencyPatterns = [
      'urgente',
      'ahora',
      'ayuda',
      'error',
      'falla',
      'malo',
    ];
    const positivePatterns = [
      'gracias',
      'perfecto',
      'bien',
      'genial',
      'excelente',
    ];

    if (urgencyPatterns.some((pattern) => text.includes(pattern)))
      return 'URGENT';
    if (positivePatterns.some((pattern) => text.includes(pattern)))
      return 'POSITIVE';

    return 'NEUTRAL';
  }
}
