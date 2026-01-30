/** apps/admin-dashboard/src/components/schemas/language-switcher.schema.ts */

import { z } from 'zod';

/**
 * @name SupportedLocaleSchema
 * @description Define la taxonomía de idiomas autorizados por la arquitectura.
 */
export const SupportedLocaleSchema = z.enum(['es', 'en', 'pt']);

/**
 * @name LanguageSwitcherConfigurationSchema
 * @description Contrato para la definición de los nodos de soberanía lingüística.
 */
export const LanguageSwitcherConfigurationSchema = z.object({
  /** Colección de idiomas disponibles para la conmutación */
  locales: z.array(z.object({
    id: SupportedLocaleSchema,
    /** Código ISO 3166-1 alpha-2 para la bandera */
    flagCode: z.string().length(2),
    /** Llave de traducción para el nombre del idioma */
    labelKey: z.string(),
  })).min(1),
}).readonly();

/** @type ILanguageSwitcherConfiguration */
export type ILanguageSwitcherConfiguration = z.infer<typeof LanguageSwitcherConfigurationSchema>;
export type ISupportedLocale = z.infer<typeof SupportedLocaleSchema>;
