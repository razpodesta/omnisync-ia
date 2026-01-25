/** libs/integrations/vector-engine/src/lib/knowledge-ingestor.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { AIDriverFactory } from '@omnisync/ai-engine';
import { QdrantDriver } from '@omnisync/vector-qdrant';
import { 
  IKnowledgeDocument, 
  KnowledgeDocumentSchema,
  IKnowledgeChunk,
  KnowledgeChunkSchema,
  KnowledgeCategorySchema
} from '@omnisync/core-contracts';

/**
 * @name KnowledgeIngestor
 * @description Aparato de ingeniería de datos encargado de la transformación de manuales 
 * estáticos en ADN neural procesable. Implementa un pipeline de tres fases: 
 * Clasificación Cognitiva -> Fragmentación Semántica -> Indexación Vectorial.
 */
export class KnowledgeIngestor {
  
  /**
   * @method processAndIndexKnowledgeDocument
   * @description Procesa un documento técnico o comercial, delegando a la IA su clasificación
   * y ejecutando una fragmentación por bloques para garantizar la relevancia en búsquedas RAG.
   * 
   * @param {string} rawKnowledgeContent - El contenido textual completo del manual o documento.
   * @param {string} tenantOrganizationIdentifier - Identificador único del dueño del conocimiento.
   * @param {string} knowledgeDocumentTitle - Título descriptivo del documento para metadatos.
   * @returns {Promise<void>} Promesa que resuelve tras la indexación exitosa en Qdrant Cloud.
   */
  public static async processAndIndexKnowledgeDocument(
    rawKnowledgeContent: string, 
    tenantOrganizationIdentifier: string,
    knowledgeDocumentTitle: string
  ): Promise<void> {
    return await OmnisyncTelemetry.traceExecution(
      'KnowledgeIngestor',
      'processAndIndexKnowledgeDocument',
      async () => {
        try {
          // 1. Fase de Enriquecimiento Neural: La IA analiza la semántica del documento
          const artificialIntelligenceDriver = AIDriverFactory.getDriver('GOOGLE_GEMINI');
          
          const semanticClassificationPrompt = `
            Actúa como un Ingeniero de Datos Senior. Analiza el siguiente contenido y responde ESTRICTAMENTE con un objeto JSON válido que contenga: 
            "category": Una de estas opciones (TECHNICAL, COMMERCIAL, ADMINISTRATIVE, LEGAL).
            "tags": Una lista de exactamente 5 palabras clave técnicas.
            
            Contenido: ${rawKnowledgeContent.substring(0, 3000)}
          `;
          
          const artificialIntelligenceAnalysisResult = await artificialIntelligenceDriver.generateResponse(
            semanticClassificationPrompt, 
            {
              modelName: 'gemini-1.5-flash',
              temperature: 0.1,
              maxTokens: 600
            }
          );

          // Parseo seguro de la clasificación neural
          const { category, tags } = JSON.parse(artificialIntelligenceAnalysisResult);

          // 2. Fase de Fragmentación Semántica (Semantic Chunking)
          // Dividimos el manual en bloques de 1000 caracteres con un solapamiento de 200 para no perder contexto
          const knowledgeChunks: IKnowledgeChunk[] = this.createSemanticChunks(
            rawKnowledgeContent,
            tenantOrganizationIdentifier,
            knowledgeDocumentTitle,
            category,
            tags
          );

          // 3. Fase de Persistencia en la Nube (Qdrant Cloud)
          const vectorDatabaseDriver = new QdrantDriver();
          
          // Upsert masivo de fragmentos para optimizar latencia
          await vectorDatabaseDriver.upsert(knowledgeChunks);

          OmnisyncTelemetry.verbose(
            'KnowledgeIngestor', 
            'success', 
            `Documento [${knowledgeDocumentTitle}] indexado con ${knowledgeChunks.length} fragmentos semánticos.`
          );

        } catch (error: unknown) {
          // Reporte de fallo sistémico al Sentinel
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-602',
            severity: 'HIGH',
            apparatus: 'KnowledgeIngestor',
            operation: 'processAndIndexKnowledgeDocument',
            message: 'Error crítico en el pipeline de transformación vectorial de conocimiento',
            context: { 
              documentTitle: knowledgeDocumentTitle, 
              tenantId: tenantOrganizationIdentifier,
              errorDetail: String(error) 
            }
          });
          throw error;
        }
      }
    );
  }

  /**
   * @method createSemanticChunks
   * @private
   * @description Implementa un algoritmo de ventana deslizante para fragmentar el texto.
   */
  private static createSemanticChunks(
    content: string,
    tenantId: string,
    title: string,
    category: any,
    tags: string[]
  ): IKnowledgeChunk[] {
    const chunkMaximumSize: number = 1000;
    const overlapSize: number = 200;
    const documentChunks: IKnowledgeChunk[] = [];
    
    let currentPointerPosition: number = 0;

    while (currentPointerPosition < content.length) {
      const chunkText: string = content.substring(
        currentPointerPosition, 
        currentPointerPosition + chunkMaximumSize
      );

      documentChunks.push(KnowledgeChunkSchema.parse({
        id: crypto.randomUUID(),
        content: chunkText,
        sourceName: title,
        tenantId: tenantId,
        metadata: {
          category,
          tags,
          chunkIndex: documentChunks.length
        }
      }));

      currentPointerPosition += (chunkMaximumSize - overlapSize);
    }

    return documentChunks;
  }
}