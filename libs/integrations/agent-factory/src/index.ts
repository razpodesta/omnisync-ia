/** libs/integrations/agent-factory/src/index.ts */

/**
 * @module AgentFactory
 * @description Punto de entrada soberano para la Inteligencia Multi-Agente (Swarm).
 * Centraliza la lógica de triaje semántico y selección de personalidades IA,
 * permitiendo que el ecosistema Omnisync-AI despache consultas a sub-agentes 
 * especializados bajo el protocolo OEDP V3.0.
 * 
 * @protocol OEDP-Level: Elite (Swarm-Orchestration V3.0)
 */

/**
 * @section 1. Orquestación de Agentes
 * Exportación del aparato maestro que resuelve la personalidad de la IA.
 */
export { OmnisyncAgentFactory } from './lib/agent-factory.apparatus';

/**
 * @section 2. Contratos y Taxonomía (SSOT)
 * Definiciones de agentes y esquemas de resolución de Swarm.
 */
export * from './lib/schemas/agent-factory.schema';