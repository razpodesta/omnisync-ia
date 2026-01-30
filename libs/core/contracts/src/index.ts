/** libs/core/contracts/src/index.ts */

/**
 * @module CoreContracts
 * @description Única Fuente de Verdad (SSOT) para el ecosistema Omnisync-AI.
 * Centraliza la lógica de validación de integridad, el transporte neural y 
 * los contratos inmutables de datos compartidos entre todas las capas.
 * 
 * @version 3.0.0-ELITE
 * @protocol OEDP-Standard: Sempiternal DNA Architecture
 */

/**
 * @section 1. Motores de Integridad y Transporte
 * Aparatos fundamentales que orquestan la pureza del dato y la comunicación.
 */
export { OmnisyncContracts } from './lib/contracts.apparatus';
export { NeuralBridge } from './lib/neural-bridge.apparatus';

/**
 * @section 2. Identidad y Gobernanza (Identity & Tenants)
 * El ADN que define la soberanía de los usuarios y la configuración de nodos.
 */
export * from './lib/schemas/core-contracts.schema';
export * from './lib/schemas/identity-session.schema';
export * from './lib/schemas/tenant-config.schema';

/**
 * @section 3. Inteligencia y Cognición (AI & RAG)
 * Esquemas para orquestación de LLMs, búsqueda vectorial y memoria semántica.
 */
export * from './lib/schemas/ai-orchestration.schema';
export * from './lib/schemas/knowledge.schema';

/**
 * @section 4. Ejecución y Acción (ERP & CRM)
 * Contratos de sincronización operativa para la integración con sistemas externos.
 */
export * from './lib/schemas/erp-integration.schema';
export * from './lib/schemas/crm-integration.schema';

/**
 * @section 5. Omnicanalidad e Infraestructura (Channels & Bridge)
 * Contratos para normalización de mensajes y parámetros de red.
 */
export * from './lib/schemas/neural-bridge.schema';
export * from './lib/schemas/omnichannel.schema';
export * from './lib/schemas/whatsapp-integration.schema';

/**
 * @section 6. Orquestación y Resultados (Flow Consummation)
 * El contrato final consolidado que sella el ciclo de vida de una intención neural.
 */
export * from './lib/schemas/flow-orchestration.schema';