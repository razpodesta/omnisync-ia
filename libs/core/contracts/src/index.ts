/** libs/core/contracts/src/index.ts */

/**
 * @section Capa de Validación y Comunicación
 * Aparatos encargados de la integridad SSOT y el transporte de datos.
 */
export { OmnisyncContracts } from './lib/contracts.apparatus';
export { NeuralBridge } from './lib/neural-bridge.apparatus';

/**
 * @section Capa Core & Identity
 * Tipos base, perfiles de usuario y gestión de sesiones.
 */
export * from './lib/schemas/core-contracts.schema';
export * from './lib/schemas/identity-session.schema';

/**
 * @section Capa de Gobernanza (Tenants)
 * El ADN que define el comportamiento de cada nodo.
 */
export * from './lib/schemas/tenant-config.schema';

/**
 * @section Capa de Cognición (Intelligence & RAG)
 * Esquemas para orquestación de IA, búsqueda semántica y fragmentación de conocimiento.
 */
export * from './lib/schemas/ai-orchestration.schema';
export * from './lib/schemas/knowledge.schema';

/**
 * @section Capa de Acción (ERP & CRM)
 * Contratos para la ejecución operativa y resolución de identidades en sistemas externos.
 */
export * from './lib/schemas/erp-integration.schema';
export * from './lib/schemas/crm-integration.schema';

/**
 * @section Capa de Infraestructura y Transporte
 * Contratos para el puente neural y normalización de canales.
 */
export * from './lib/schemas/neural-bridge.schema';
export * from './lib/schemas/omnichannel.schema';
export * from './lib/schemas/whatsapp-integration.schema';

/**
 * @section Capa de Resultados (Orchestration)
 * El contrato final consolidado del flujo neural.
 */
export * from './lib/schemas/flow-orchestration.schema';
