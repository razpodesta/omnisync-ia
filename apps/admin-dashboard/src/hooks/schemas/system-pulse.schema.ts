/** apps/admin-dashboard/src/hooks/schemas/system-pulse.schema.ts */

import { z } from 'zod';

/**
 * @name SystemPulseConfigurationSchema
 * @description Define las leyes de gobierno para la optimización de recursos.
 * Implementa "Economía de Cómputo" para minimizar peticiones a Render/Vercel.
 */
export const SystemPulseConfigurationSchema = z.object({
  /** Tiempo de vida de la información de salud (Min: 60s). Evita re-consultas innecesarias. */
  staleTimeInMilliseconds: z.number().int().min(60000).default(300000), // 5 Minutos default
  
  /** Tiempo de enfriamiento entre disparos manuales para evitar spamming de red */
  cooldownInMilliseconds: z.number().int().min(5000).default(10000),

  /** Indica si el pulso debe dispararse al recuperar el foco de la ventana (Tab focus) */
  triggerOnVisibilityChange: z.boolean().default(true),

  /** Indica si debe dispararse automáticamente al montar el aparato (Handshake inicial) */
  triggerOnMount: z.boolean().default(true),
}).readonly();

/** @type ISystemPulseConfiguration */
export type ISystemPulseConfiguration = z.infer<typeof SystemPulseConfigurationSchema>;