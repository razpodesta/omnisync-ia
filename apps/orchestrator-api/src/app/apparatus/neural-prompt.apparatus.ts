/** apps/orchestrator-api/src/app/apparatus/neural-prompt.apparatus.ts */

import {
  IKnowledgeSemanticChunk,
  OmnisyncContracts,
} from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @section Sincronización de Contratos Locales
 * Resolución del Error TS2307: Ajuste de ruta hacia la carpeta de esquemas hermana.
 */
import {
  NeuralDialogueMessageSchema,
  INeuralDialogueMessage,
} from '../schemas/neural-prompt.schema';

/**
 * @name NeuralPromptApparatus
 * @description Aparato de ingeniería cognitiva de alta precisión.
 * Orquesta la fusión de directivas institucionales, memoria histórica y fragmentos
 * de conocimiento técnico (RAG) para maximizar la exactitud de la inferencia AI.
 * Implementa el protocolo de "Verdad Inviolable" (SSOT) sobre la base de conocimientos.
 *
 * @protocol OEDP-Level: Elite (Cognitive Assembly V2.0)
 */
export class NeuralPromptApparatus {
  /**
   * @private
   * @description Límite de mensajes históricos para preservar la ventana de contexto y el presupuesto de tokens.
   */
  private static readonly MAXIMUM_HISTORY_ENTRIES_RETAINED = 8;

  /**
   * @method buildEnrichedInferencePrompt
   * @description Construye el prompt final inyectando el historial curado y el contexto técnico recuperado.
   *
   * @param {string} systemDirective - Directiva base de personalidad y restricciones.
   * @param {IKnowledgeSemanticChunk[]} technicalKnowledgeContext - Fragmentos vectoriales recuperados.
   * @param {string} userCurrentInquiry - La consulta actual del usuario.
   * @param {unknown[]} conversationHistoryRaw - Historial de la sesión sin procesar.
   * @returns {string} Prompt final optimizado para motores de inferencia.
   */
  public static buildEnrichedInferencePrompt(
    systemDirective: string,
    technicalKnowledgeContext: IKnowledgeSemanticChunk[],
    userCurrentInquiry: string,
    conversationHistoryRaw: unknown[] = [],
  ): string {
    const apparatusName = 'NeuralPromptApparatus';
    const operationName = 'buildEnrichedInferencePrompt';

    return OmnisyncTelemetry.traceExecutionSync(
      apparatusName,
      operationName,
      () => {
        const formattedTechnicalContext = this.formatTechnicalKnowledge(
          technicalKnowledgeContext,
        );
        const formattedDialogueHistory = this.formatDialogueHistory(
          conversationHistoryRaw,
        );

        /**
         * @section Arquitectura del Prompt
         * Utiliza una jerarquía de bloques para guiar la atención del modelo hacia la Verdad Técnica.
         */
        return `
${systemDirective.trim()}

### 🧠 RECENT_DIALOGUE_MEMORY
The following messages provide context for the ongoing conversation. Use them to resolve pronouns and references.
${formattedDialogueHistory}

### 📚 TECHNICAL_KNOWLEDGE_CONTEXT (SOURCE_OF_TRUTH)
Reference the specific data below to formulate your response. Do not hallucinate facts outside this context.
${formattedTechnicalContext}

### 📥 CURRENT_USER_INQUIRY
${userCurrentInquiry.trim()}

---
### 🛠️ CRITICAL_RESPONSE_DIRECTIVES:
1. **Dato Sovereignty**: If the answer is not present in "TECHNICAL_KNOWLEDGE_CONTEXT", inform the user you lack specific information and suggest human assistance.
2. **Coherence**: Ensure continuity based on "RECENT_DIALOGUE_MEMORY".
3. **Identity**: Maintain a professional, architectural, and results-oriented tone.
4. **Restriction**: Do not mention internal terms like "Chunks", "Vectors", or "Embedding Database".
5. **Formatting**: Use Markdown to enhance technical readability.
`.trim();
      },
    );
  }

  /**
   * @method formatTechnicalKnowledge
   * @private
   * @description Transforma fragmentos vectoriales en un bloque de texto estructurado y referenciable.
   */
  private static formatTechnicalKnowledge(
    chunks: IKnowledgeSemanticChunk[],
  ): string {
    if (chunks.length === 0) {
      return '[SYSTEM_ALERT]: No specific technical information was found in the knowledge base for this query.';
    }

    return chunks
      .map((chunk, index) => {
        const sourceNameIndicator = chunk.sourceName
          ? `(Source: ${chunk.sourceName})`
          : '';
        return `[TECHNICAL_RESOURCE_${index + 1}] ${sourceNameIndicator}:\n${chunk.content.trim()}`;
      })
      .join('\n\n');
  }

  /**
   * @method formatDialogueHistory
   * @private
   * @description Procesa, valida y trunca el historial de conversación bajo contrato SSOT.
   */
  private static formatDialogueHistory(history: unknown[]): string {
    if (history.length === 0) {
      return '[SYSTEM_INFO]: Starting a new neural support session.';
    }

    /**
     * @section Validación de ADN de Memoria
     * Se aplica validación de colección mediante el esquema atómico para asegurar integridad de roles.
     */
    const validatedHistory = OmnisyncContracts.validateCollection(
      NeuralDialogueMessageSchema,
      history,
      'NeuralPromptApparatus:HistoryValidation',
    );

    const truncatedHistory = validatedHistory.slice(
      -this.MAXIMUM_HISTORY_ENTRIES_RETAINED,
    );

    return (truncatedHistory as readonly INeuralDialogueMessage[])
      .map((message) => {
        const roleLabel = message.role.toUpperCase();
        return `${roleLabel}: ${message.content.trim()}`;
      })
      .join('\n');
  }
}
