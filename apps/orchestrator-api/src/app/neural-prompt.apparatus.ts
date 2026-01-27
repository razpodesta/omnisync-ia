/** apps/orchestrator-api/src/app/neural-prompt.apparatus.ts */

import { IKnowledgeSemanticChunk } from '@omnisync/core-contracts';

/**
 * @interface INeuralConversationMessage
 * @description Estructura inmutable para la representación de mensajes en el flujo de diálogo.
 */
interface INeuralConversationMessage {
  readonly role: 'user' | 'assistant' | 'system';
  readonly content: string;
}

/**
 * @name NeuralPromptApparatus
 * @description Aparato de ingeniería de prompts de alta precisión.
 * Orquesta la fusión de directivas institucionales, memoria histórica truncada y
 * fragmentos de conocimiento técnico (RAG) para maximizar la exactitud de la inferencia AI.
 *
 * @protocol OEDP-Level: Elite (Cognitive Engineering)
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
   *
   * @param {string} systemDirective - Instrucción base de comportamiento del Tenant.
   * @param {IKnowledgeSemanticChunk[]} technicalKnowledgeContext - Chunks recuperados de Qdrant.
   * @param {string} userCurrentQuery - Consulta actual del usuario final.
   * @param {unknown[]} conversationHistoryRaw - Historial recuperado de la persistencia volátil.
   * @returns {string} Prompt estructurado y optimizado para modelos generativos.
   */
  public static buildEnrichedInferencePrompt(
    systemDirective: string,
    technicalKnowledgeContext: IKnowledgeSemanticChunk[],
    userCurrentQuery: string,
    conversationHistoryRaw: unknown[] = []
  ): string {

    const formattedKnowledge = this.formatTechnicalKnowledgeContext(technicalKnowledgeContext);
    const formattedHistory = this.formatConversationHistory(conversationHistoryRaw);

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
4. **Restricción**: No menciones términos internos como "Chunks", "Vectores", "Manuales" o "Base de datos" en tu respuesta.
5. **Formato**: Utiliza Markdown para mejorar la legibilidad si es necesario.
`.trim();
  }

  /**
   * @method formatTechnicalKnowledgeContext
   * @private
   */
  private static formatTechnicalKnowledgeContext(chunks: IKnowledgeSemanticChunk[]): string {
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
   * @method formatConversationHistory
   * @private
   * @description Procesa y trunca el historial para garantizar eficiencia en el consumo de tokens.
   */
  private static formatConversationHistory(history: unknown[]): string {
    if (history.length === 0) {
      return '[INFO]: Iniciando nueva sesión de soporte neural.';
    }

    // Truncamiento de seguridad: Solo conservamos los mensajes más recientes.
    const truncatedHistory = history.slice(-this.MAXIMUM_HISTORY_ENTRIES_RETAINED);

    return (truncatedHistory as readonly INeuralConversationMessage[])
      .map((message) => {
        const roleLabel = message.role.toUpperCase();
        return `${roleLabel}: ${message.content.trim()}`;
      })
      .join('\n');
  }
}
