/** apps/admin-dashboard/src/components/schemas/theme-switcher.schema.ts */

import { z } from 'zod';

/**
 * @name ThemeStateSchema
 * @description Define la taxonomía de estados lumínicos autorizados.
 */
export const ThemeStateSchema = z.enum(['light', 'dark', 'system']);

/**
 * @name ThemeSwitcherConfigurationSchema
 * @description Contrato para la orquestación estética del conmutador.
 */
export const ThemeSwitcherConfigurationSchema = z.object({
  /** Duración de la transición de desplazamiento en segundos */
  transitionDuration: z.number().default(0.5),
  /** Tamaño del icono en píxeles */
  iconSize: z.number().default(14),
  /** Habilitar feedback táctil (vibración/escala) */
  enableTactileFeedback: z.boolean().default(true),
}).readonly();

export type IThemeState = z.infer<typeof ThemeStateSchema>;
export type IThemeSwitcherConfiguration = z.infer<typeof ThemeSwitcherConfigurationSchema>;
