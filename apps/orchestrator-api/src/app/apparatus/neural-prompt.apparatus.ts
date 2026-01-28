/** apps/orchestrator-api/src/app/neural-prompt.apparatus.ts */

import { IKnowledgeSemanticChunk, OmnisyncContracts } from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import {
  NeuralDialogueMessageSchema,
  INeuralDialogueMessage
} from './schemas/neural-prompt.schema';

/**
 * @name NeuralPromptApparatus
 * @description Aparato de ingeniería cognitiva de alta precisión.
 * Orquesta la fusión de directivas institucionales, memoria histórica y fragmentos
 * de conocimiento técnico (RAG) para maximizar la exactitud de la inferencia AI.
 *
 * @protocol OEDP-Level: Elite (Cognitive Assembly)
 */
export class NeuralPromptApparatus {
  /**
   * @private
   * @description Límite de mensajes históricos para preservar la ventana de contexto.
   */
  private static readonly MAXIMUM_HISTORY_ENTRIES_RETAINED = 8;

  /**
   * @method buildEnrichedInferencePrompt
   * @description Construye el prompt final inyectando el historial curado y el conocimiento técnico.
   */
  public static buildEnrichedInferencePrompt(
    systemDirective: string,
    technicalKnowledgeContext: IKnowledgeSemanticChunk[],
    userCurrentQuery: string,
    conversationHistoryRaw: unknown[] = []
  ): string {
    const apparatusName = 'NeuralPromptApparatus';

    return OmnisyncTelemetry.traceExecutionSync(
      apparatusName,
      'buildEnrichedInferencePrompt',
      () => {
        const formattedKnowledge = this.formatTechnicalKnowledge(technicalKnowledgeContext);
        const formattedHistory = this.formatDialogueHistory(conversationHistoryRaw);

        return `
${systemDirective.trim()}

### 🧠 MEMORIA RECIENTE DEL DIÁLOGO (COHERENCIA)
A continuación se presentan los últimos mensajes para mantener el hilo de la conversación.
${formattedHistory}

### 📚 CONTEXTO TÉCNICO DE REFERENCIA (VERDAD SSOT)
Utiliza la siguiente información técnica recuperada de los manuales oficiales para responder.
${formattedKnowledge}

### 📥 CONSULTA ACTUAL DEL USUARIO
${userCurrentQuery.trim()}

---
### 🛠️ DIRECTIVAS DE RESPUESTA OBLIGATORIAS:
1. **Soberanía del Dato**: Si la respuesta no se encuentra en el "CONTEXTO TÉCNICO DE REFERENCIA", informa al usuario que no posees la información específica y sugiere contactar a un experto humano.
2. **Coherencia**: Utiliza la "MEMORIA RECIENTE" para entender pronombres o referencias a mensajes anteriores.
3. **Identidad**: Mantén un tono profesional, resolutivo y arquitectónico.
4. **Restricción**: No menciones términos internos como "Chunks", "Vectores" o "Base de datos" en tu respuesta.
5. **Formato**: Utiliza Markdown para mejorar la legibilidad.
`.trim();
      }
    );
  }

  /**
   * @method formatTechnicalKnowledge
   * @private
   * @description Transforma fragmentos vectoriales en un bloque de texto estructurado.
   */
  private static formatTechnicalKnowledge(chunks: IKnowledgeSemanticChunk[]): string {
    if (chunks.length === 0) {
      return '[AVISO]: No se ha localizado información técnica específica en la base de conocimiento.';
    }

    return chunks
      .map((chunk, index) => {
        const sourceIndicator = chunk.sourceName ? `(Fuente: ${chunk.sourceName})` : '';
        return `[RECURSO_TECNICO_${index + 1}] ${sourceIndicator}:\n${chunk.content.trim()}`;
      })
      .join('\n\n');
  }

  /**
   * @method formatDialogueHistory
   * @private
   * @description Procesa, valida y trunca el historial de conversación.
   */
  private static formatDialogueHistory(history: unknown[]): string {
    if (history.length === 0) {
      return '[INFO]: Iniciando nueva sesión de soporte neural.';
    }

    /**
     * @section Validación de ADN de Memoria
     * Aplicamos validación de colección para asegurar que cada mensaje del historial
     * cumpla con el contrato NeuralDialogueMessageSchema.
     */
    const validatedHistory = OmnisyncContracts.validateCollection(
      NeuralDialogueMessageSchema,
      history,
      'NeuralPromptApparatus:History'
    );

    const truncatedHistory = validatedHistory.slice(-this.MAXIMUM_HISTORY_ENTRIES_RETAINED);

    return (truncatedHistory as readonly INeuralDialogueMessage[])
      .map((message) => {
        const roleLabel = message.role.toUpperCase();
        return `${roleLabel}: ${message.content.trim()}`;
      })
      .join('\n');
  }
}
