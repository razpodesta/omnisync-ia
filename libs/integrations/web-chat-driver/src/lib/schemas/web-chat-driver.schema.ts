/** libs/integrations/web-chat-driver/src/lib/schemas/web-chat-driver.schema.ts */

import { z } from 'zod';

/**
 * @name WebChatSocketEventSchema
 * @description Valida el ADN crudo de los eventos entrantes por Socket.IO/WebSockets.
 * Asegura que el mensaje posea la densidad mínima y los metadatos de navegador.
 */
export const WebChatSocketEventSchema = z.object({
  /** Contenido textual de la consulta del usuario */
  message: z.string().min(1).trim(),
  /** Información técnica del cliente web (User-Agent) */
  browserInfo: z.string().optional().default('unspecified_browser'),
  /** Contexto adicional inyectado por el Widget */
  context: z.record(z.string(), z.unknown()).optional(),
}).readonly();

/** @type IWebChatSocketEvent */
export type IWebChatSocketEvent = z.infer<typeof WebChatSocketEventSchema>;