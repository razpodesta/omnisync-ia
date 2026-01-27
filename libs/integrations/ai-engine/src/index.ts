/** libs/integrations/ai-engine/src/index.ts */

/**
 * @section Capa de Orquestación Neural
 * Motor central para la ejecución de inferencias y generación de firmas vectoriales.
 */
export * from './lib/ai-engine.apparatus';

/**
 * @section Capa de Adaptadores de IA (Drivers)
 * Fábrica encargada de instanciar el proveedor específico (Gemini, etc.) según el ADN del Tenant.
 */
export * from './lib/ai-driver.factory';