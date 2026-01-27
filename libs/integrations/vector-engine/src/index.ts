/** libs/integrations/vector-engine/src/index.ts */

/**
 * @section Capa de Orquestación RAG
 * Motor de recuperación de conocimiento semántico.
 */
export * from './lib/vector-engine.apparatus';

/**
 * @section Capa de Ingesta de ADN Técnico
 * Aparatos encargados de la transformación de documentos en vectores.
 */
export * from './lib/knowledge-ingestor/knowledge-ingestor.orchestrator';
export * from './lib/knowledge-ingestor/knowledge-classifier.apparatus';
export * from './lib/knowledge-ingestor/semantic-chunker.apparatus';