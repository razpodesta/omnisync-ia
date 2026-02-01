/** apps/orchestrator-api/src/app/apparatus/neural-prompt.apparatus.ts */

import {
  IKnowledgeSemanticChunk,
  OmnisyncContracts,
} from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @section Sincronización de Contratos Locales
 */
import {
  NeuralDialogueMessageSchema,
  INeuralDialogueMessage,
} from '../schemas/neural-prompt.schema';

/**
 * @name NeuralPromptApparatus
 * @description Aparato de ingeniería cognitiva de alta precisión. Orquesta la fusión 
 * tridimensional de directivas de enjambre (Swarm), memoria histórica (Redis) y 
 * conocimiento técnico (RAG). Implementa el protocolo de "Aislamiento de Contexto" 
 * para garantizar que la IA opere exclusivamente bajo la soberanía de los datos inyectados.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Cognitive-Engineering V3.0)
 * @vision Ultra-Holística: Situational-Awareness & Hallucination-Eradication
 */
export class NeuralPromptApparatus {
  /**
   * @private
   * @description Límite de mensajes históricos para preservar la coherencia y el presupuesto de tokens.
   */
  private static readonly MAXIMUM_HISTORY_ENTRIES_RETAINED = 10;

  /**
   * @method buildEnrichedInferencePrompt
   * @description Construye el ADN final de la instrucción neural. Orquesta la inyección 
   * de metadatos de transporte y la base de conocimientos RAG.
   *
   * @param {string} agentPersona - Personalidad específica resuelta por el Swarm.
   * @param {IKnowledgeSemanticChunk[]} technicalContext - Fragmentos vectoriales recuperados.
   * @param {string} userInquiry - La consulta activa del usuario.
   * @param {unknown[]} historyRaw - Historial de diálogo recuperado de la persistencia.
   * @param {Record<string, unknown>} environmentalMetadata - ADN del dispositivo y plataforma del cliente.
   * @returns {string} Prompt estructurado de grado arquitectónico.
   */
  public static buildEnrichedInferencePrompt(
    agentPersona: string,
    technicalContext: IKnowledgeSemanticChunk[],
    userInquiry: string,
    historyRaw: unknown[] = [],
    environmentalMetadata: Record<string, unknown> = {},
  ): string {
    const apparatusName = 'NeuralPromptApparatus';
    const operationName = 'buildEnrichedInferencePrompt';

    return OmnisyncTelemetry.traceExecutionSync(
      apparatusName,
      operationName,
      () => {
        // 1. Formateo de Capas de Información
        const formattedMetadata = this.formatEnvironmentalContext(environmentalMetadata);
        const formattedKnowledge = this.formatTechnicalKnowledge(technicalContext);
        const formattedHistory = this.formatDialogueHistory(historyRaw);

        /**
         * @section Arquitectura de la Instrucción Maestra
         * Utilizamos un formato XML-Style/Markdown para forzar al LLM a respetar las fronteras del dato.
         */
        return `
[SYSTEM_DIRECTIVE]
${agentPersona.trim()}

[ENVIRONMENT_CONTEXT]
The user is interacting through the following technical environment:
${formattedMetadata}

[RECENT_DIALOGUE_MEMORY]
<<<START_HISTORY>>>
${formattedHistory}
<<<END_HISTORY>>>

[TECHNICAL_KNOWLEDGE_BASE]
Reference the data below as the ONLY SOURCE OF TRUTH (SSOT).
${formattedKnowledge}

[CURRENT_USER_INPUT]
"${userInquiry.trim()}"

---
[CRITICAL_EXECUTION_RULES]
1. IDENTITY_CONSISTENCY: Respond according to the assigned Agent Persona.
2. DATA_SOVEREIGNTY: If the answer is not in [TECHNICAL_KNOWLEDGE_BASE], state you lack info and suggest human escalation.
3. CONTEXTUAL_AWARENESS: Use [ENVIRONMENT_CONTEXT] to provide platform-specific guidance.
4. FORMATTING: Use Markdown for lists and technical highlights. No mentions of internal "chunks" or "metadata".
`.trim();
      },
    );
  }

  /**
   * @method formatEnvironmentalContext
   * @private
   * @description Serializa el ADN del dispositivo para la comprensión de la IA.
   */
  private static formatEnvironmentalContext(metadata: Record<string, unknown>): string {
    if (Object.keys(metadata).length === 0) return '- No additional environmental data available.';
    
    return Object.entries(metadata)
      .map(([key, value]) => `- ${key.toUpperCase()}: ${String(value)}`)
      .join('\n');
  }

  /**
   * @method formatTechnicalKnowledge
   * @private
   * @description Transforma fragmentos vectoriales en un bloque de texto referenciable.
   */
  private static formatTechnicalKnowledge(
    chunks: IKnowledgeSemanticChunk[],
  ): string {
    if (chunks.length === 0) {
      return '!!! ALERT: No technical documentation found for this query. Strictly follow the "lack of information" protocol.';
    }

    return chunks
      .map((chunk, index) => {
        const sourceLabel = chunk.sourceName ? `[DOCUMENT_SOURCE: ${chunk.sourceName}]` : '';
        return `### KNOWLEDGE_ENTRY_${index + 1} ${sourceLabel}\n${chunk.content.trim()}`;
      })
      .join('\n\n');
  }

  /**
   * @method formatDialogueHistory
   * @private
   * @description Procesa y valida el historial bajo contrato SSOT.
   */
  private static formatDialogueHistory(history: unknown[]): string {
    if (history.length === 0) return 'No previous interaction history.';

    /**
     * @section Validación de ADN de Memoria
     * Aplicamos el esquema local para asegurar que los roles coincidan con el estándar.
     */
    const validatedHistory = OmnisyncContracts.validateCollection(
      NeuralDialogueMessageSchema,
      history,
      'NeuralPromptApparatus:HistoryValidation',
    );

    const truncatedHistory = (validatedHistory as readonly INeuralDialogueMessage[])
      .slice(-this.MAXIMUM_HISTORY_ENTRIES_RETAINED);

    return truncatedHistory
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content.trim()}`)
      .join('\n');
  }
}