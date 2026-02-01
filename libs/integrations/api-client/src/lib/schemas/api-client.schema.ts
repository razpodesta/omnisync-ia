/** libs/integrations/api-client/src/lib/schemas/api-client.schema.ts */

import { z } from 'zod';

/**
 * @name NeuralHubEndpointSchema
 * @description Taxonomía de rutas autorizadas en la infraestructura del Neural Hub.
 * Define los puntos de convergencia para el tráfico omnicanal y administrativo.
 */
export const NeuralHubEndpointSchema = z.enum([
  '/v1/neural/chat',    // Inferencia dialógica
  '/v1/neural/ingest',  // Ingesta de ADN técnico (RAG)
  '/v1/health/pulse',   // Auditoría de signos vitales 360°
  '/v1/auth/session'    // Resolución de soberanía de identidad
]);

/**
 * @name HealthCheckDepthSchema
 * @description Define la profundidad de la auditoría de infraestructura solicitada.
 */
export const HealthCheckDepthSchema = z.enum([
  'SURFACE_PULSE', // Handshake rápido de conectividad
  'DEEP_AUDIT',    // Verificación de esquemas y latencia 
  'FULL_360'       // Sonda integral de los 5 pilares (Standard V4.0)
]);

/**
 * @name ApiRequestConfigurationSchema
 * @description Contrato maestro para la orquestación de transacciones de red.
 * Garantiza que la señal enviada desde la UI posea el ADN correcto para ser 
 * procesada por el NeuralBridge.
 * 
 * @protocol OEDP-Level: Elite (Typed-Network-Contract V4.0)
 */
export const ApiRequestConfigurationSchema = z.object({
  /** Punto de entrada en el orquestador backend */
  endpoint: NeuralHubEndpointSchema,
  
  /** Verbo HTTP validado para la operación específica */
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('POST'),
  
  /** 
   * @section Carga Útil Estructurada
   * Se prefiere el uso de esquemas específicos. Si es nulo, se trata como 
   * una petición de solo lectura (Pulse/Get).
   */
  payload: z.object({
    /** Contenido para Chat o Ingesta */
    content: z.string().optional(),
    /** Parámetros específicos para el HealthEngine */
    checkDepth: HealthCheckDepthSchema.optional(),
    /** Metadatos de transporte inyectados por el NexusClient */
    metadata: z.record(z.string(), z.unknown()).optional(),
  }).optional(),

  /** Límite de gracia para la respuesta (Erradica abreviación 'timeout') */
  timeoutInMilliseconds: z.number().int().positive().default(15000),

  /** Identificador de rastreo para correlación en el Sentinel */
  traceIdentifier: z.string().uuid().optional(),
}).readonly();

/** @type INeuralHubEndpoint */
export type INeuralHubEndpoint = z.infer<typeof NeuralHubEndpointSchema>;
/** @type IHealthCheckDepth */
export type IHealthCheckDepth = z.infer<typeof HealthCheckDepthSchema>;
/** @type IApiRequestConfiguration */
export type IApiRequestConfiguration = z.infer<typeof ApiRequestConfigurationSchema>;