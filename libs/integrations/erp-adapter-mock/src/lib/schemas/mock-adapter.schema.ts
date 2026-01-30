/** libs/integrations/erp-adapter-mock/src/lib/schemas/mock-adapter.schema.ts */

import { z } from 'zod';

/**
 * @name MockAdapterConfigurationSchema
 * @description Define los parámetros de comportamiento del simulador.
 */
export const MockAdapterConfigurationSchema = z.object({
  /** Latencia artificial para pruebas de timeout y UX */
  simulatedLatencyMs: z.number().int().min(0).default(280),
  /** Prefijo para los identificadores generados */
  ticketIdPrefix: z.string().min(1).default('MOCK-TICKET-'),
  /** Patrón de éxito para validación de identidad */
  identitySuccessPattern: z.string().default('55'),
}).readonly();

/**
 * @name MockTicketInputSchema
 * @description Valida la entrada cruda recibida por el despacho operativo.
 */
export const MockTicketInputSchema = z.object({
  userId: z.string().min(1),
  subject: z.string().min(5),
  description: z.string().min(10),
}).readonly();

export type IMockAdapterConfiguration = z.infer<typeof MockAdapterConfigurationSchema>;
export type IMockTicketInput = z.infer<typeof MockTicketInputSchema>;