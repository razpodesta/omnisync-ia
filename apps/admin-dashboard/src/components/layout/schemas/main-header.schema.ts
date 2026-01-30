/** apps/admin-dashboard/src/components/layout/schemas/main-header.schema.ts */
import { z } from 'zod';

export const MainHeaderConfigurationSchema = z.object({
  isGlassy: z.boolean().default(true),
  brandName: z.string().min(2).default('OMNISYNC'),
  brandSuffix: z.string().default('AI'),
  navigationItems: z.array(z.object({
    translationKey: z.string().min(1),
    routePath: z.string().min(1),
    isExternal: z.boolean().default(false),
  })).min(1),
}).readonly();

export type IMainHeaderConfiguration = z.infer<typeof MainHeaderConfigurationSchema>;
