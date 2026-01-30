/** libs/integrations/web-chat-driver/src/index.ts */

/**
 * @module WebChatDriver
 * @description Punto de entrada soberano para la integración de Web Chat. 
 * Centraliza la lógica de normalización de Sockets y la validación de 
 * contratos de red para la interfaz del Widget Web.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Unified-Export-Sovereignty V3.2)
 */

/**
 * @section 1. Aparatos de Mediación de Red
 * Exportación del motor principal encargado de la traducción de eventos a intenciones.
 */
export * from './lib/web-chat-driver.apparatus';

/**
 * @section 2. Contratos y Esquemas (SSOT)
 * Exportación de la taxonomía de eventos de socket y tipos inferidos 
 * para garantizar la integridad de datos en el borde (Edge).
 */
export * from './lib/schemas/web-chat-driver.schema';