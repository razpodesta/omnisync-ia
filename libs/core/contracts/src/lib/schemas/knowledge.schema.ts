/** libs/core/contracts/src/lib/schemas/knowledge.schema.ts */

import { z } from 'zod';
import { TenantIdSchema } from './core-contracts.schema';

/**
 * @name KnowledgeOrganizationCategorySchema
 * @description Clasificación taxonómica del conocimiento dentro de la organización.
 */
export const KnowledgeOrganizationCategorySchema = z.enum([
  'TECHNICAL', 
  'COMMERCIAL', 
  'ADMINISTRATIVE', 
  'LEGAL'
]);

/**
 * @name KnowledgeSourceDocumentSchema
 * @description Estructura de un documento original antes de ser fragmentado.
 */
export const KnowledgeSourceDocumentSchema = z.object({
  id: z.string().uuid(),
  tenantId: TenantIdSchema,
  title: z.string().min(5),
  category: KnowledgeOrganizationCategorySchema,
  tags: z.array(z.string()).default([]),
  rawContent: z.string().min(100),
  metadata: z.object({
    author: z.string().optional(),
    version: z.string().default('1.0.0'),
    relevanceWeight: z.number().min(0).max(1).default(1.0),
  }),
  processedAt: z.string().datetime(),
}).readonly();

export type IKnowledgeSourceDocument = z.infer<typeof KnowledgeSourceDocumentSchema>;

/**
 * @name KnowledgeSemanticChunkSchema
 * @description Representación de un fragmento atómico de conocimiento (Chunk).
 * Es la unidad fundamental para la búsqueda vectorial y el contexto RAG.
 */
export const KnowledgeSemanticChunkSchema = z.object({
  /** Identificador único del fragmento (ID del punto en Qdrant) */
  id: z.string().uuid(),
  
  /** Identificador de la organización propietaria para aislamiento RLS */
  tenantId: TenantIdSchema,
  
  /** Contenido textual del fragmento */
  content: z.string().min(1),
  
  /** Referencia al nombre del documento de origen */
  sourceName: z.string(),
  
  /** Metadatos enriquecidos para filtrado y scoring */
  metadata: z.record(z.string(), z.unknown()).default({}),
}).readonly();

export type IKnowledgeSemanticChunk = z.infer<typeof KnowledgeSemanticChunkSchema>;

/**
 * @name KnowledgeSemanticSearchResultSchema
 * @description Contenedor de resultados tras una búsqueda en el espacio vectorial.
 */
export const KnowledgeSemanticSearchResultSchema = z.object({
  /** Lista de fragmentos recuperados */
  chunks: z.array(KnowledgeSemanticChunkSchema),
  
  /** Puntuación de relevancia promedio (0.0 a 1.0) */
  relevanceScore: z.number().min(0).max(1),
  
  /** Tiempo de ejecución de la búsqueda en milisegundos */
  latencyInMilliseconds: z.number(),
}).readonly();

export type IKnowledgeSemanticSearchResult = z.infer<typeof KnowledgeSemanticSearchResultSchema>;