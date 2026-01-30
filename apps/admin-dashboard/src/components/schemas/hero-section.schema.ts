/** apps/admin-dashboard/src/components/schemas/hero-section.schema.ts */

import { z } from 'zod';

/**
 * @name HeroSlideSchema
 * @description Define la estructura de un átomo de narrativa en el slider.
 */
const HeroSlideSchema = z.object({
  id: z.string().uuid(),
  titleKey: z.string(),
  subtitleKey: z.string(),
  ctaKey: z.string(),
  route: z.string().default('/'),
  accentVariant: z.enum(['OBSIDIAN', 'MILK', 'NEURAL_PULSE']),
}).readonly();

/**
 * @name HeroSectionConfigurationSchema
 * @description Contrato maestro para la orquestación del Hero Slider.
 */
export const HeroSectionConfigurationSchema = z.object({
  /** Intervalo de rotación automática en milisegundos */
  autoplayInterval: z.number().min(3000).max(10000).default(5000),
  /** Colección inmutable de diapositivas */
  slides: z.array(HeroSlideSchema).min(1),
  /** Habilitar desenfoque cinético en transiciones */
  enableMotionBlur: z.boolean().default(true),
}).readonly();

export type IHeroSlide = z.infer<typeof HeroSlideSchema>;
export type IHeroSectionConfiguration = z.infer<typeof HeroSectionConfigurationSchema>;
