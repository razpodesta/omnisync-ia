/** libs/integrations/omnichannel-orchestrator/src/lib/persistence/index.ts */

/**
 * @section Puntos de Entrada de Persistencia Omnicanal
 */
export { ContextMemoryApparatus } from './apparatus/context-memory.apparatus';
export { ThreadAuditApparatus } from './apparatus/thread-audit.apparatus';

/**
 * @section Contratos de Persistencia
 */
export * from './schemas/thread-audit.schema';
