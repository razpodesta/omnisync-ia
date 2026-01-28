/** libs/integrations/vector-engine/src/index.ts */

/**
 * @section Capa de Orquestación RAG
 * Motor central de recuperación y evaluación de relevancia.
 */
export { OmnisyncVectorEngine } from './lib/vector-engine.apparatus';
export { SemanticRelevanceAssessor } from './lib/semantic-relevance-assessor.apparatus';

/**
 * @section Capa de Contratos (SSOT)
 * Exportación de interfaces y esquemas de configuración.
 * NIVELACIÓN: Sanación de Error TS2305.
 */
export * from './lib/schemas/vector-engine.schema';
export * from './lib/schemas/semantic-relevance.schema';

/**
 * @section Capa de Ingesta
 */
export { KnowledgeIngestorOrchestrator } from './lib/knowledge-ingestor/orchestrators/knowledge-ingestor.orchestrator';
export { KnowledgeClassifierApparatus } from './lib/knowledge-ingestor/knowledge-classifier.apparatus';
export { SemanticChunkerApparatus } from './lib/knowledge-ingestor/semantic-chunker.apparatus';
