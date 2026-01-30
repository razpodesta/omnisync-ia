/** libs/integrations/api-client/src/index.ts */

/**
 * @module ApiClient
 * @description Única Fuente de Verdad (SSOT) para la capa de integración de red. 
 * Este nodo centraliza el despacho de peticiones hacia el Neural Hub, 
 * encapsulando la complejidad del NeuralBridge y garantizando que toda 
 * comunicación cumpla con los esquemas de validación institucional.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Unified-API-Sovereignty V3.2)
 */

/**
 * @section 1. Contratos y Esquemas (SSOT)
 * Exportación de la taxonomía de endpoints autorizados y configuraciones de red.
 */
export * from './lib/schemas/api-client.schema';

/**
 * @section 2. Aparatos de Ejecución y Despacho
 * RESOLUCIÓN TS2304: Se normaliza la exportación nominal del aparato principal.
 * Se inyecta 'nexusApi' como alias funcional de alta fidelidad para simplificar 
 * el consumo en hooks de React y componentes del Dashboard.
 * 
 * @note Este aparato es la vía soberana para interactuar con la IA y el RAG.
 */
export { 
  NeuralNexusClient,
  /**
   * @alias nexusApi
   * @description Proxy semántico para ejecuciones rápidas del cliente neural.
   */
  NeuralNexusClient as nexusApi 
} from './lib/api-client.apparatus';