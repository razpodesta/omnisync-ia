/** libs/core/contracts/src/lib/schemas/tenant-config.schema.ts */

import { z } from 'zod';
import { TenantIdSchema } from './core-contracts.schema';
import { AIModelConfigSchema } from './ai-orchestration.schema';

/**
 * @description Configuración completa de identidad y conectividad de un Tenant.
 */
export const TenantConfigurationSchema = z.object({
  id: TenantIdSchema,
  name: z.string().min(3),
  slug: z.string().lowercase().regex(/^[a-z0-9-]+$/),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'MAINTENANCE']),
  
  // LEGO Config: Define qué piezas usa este cliente
  integrations: z.object({
    ai: z.object({
      provider: z.enum(['GOOGLE_GEMINI', 'OPENAI_GPT', 'ANTHROPIC_CLAUDE']),
      config: AIModelConfigSchema,
      systemPrompt: z.string().min(50), // Instrucciones base del bot
    }),
    erp: z.object({
      adapter: z.enum(['MOCK_ERP', 'ODOO_V16', 'SAP_B1', 'SALESFORCE']),
      encryptedCredentials: z.string(), // Gestionado por CoreSecurity
    }),
    channels: z.array(z.enum(['WHATSAPP', 'WEB_CHAT', 'TELEGRAM'])),
  }),

  // UX Config: Para el Web Chat Widget
  branding: z.object({
    primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    logoUrl: z.string().url().optional(),
    welcomeMessage: z.string(),
  }),
}).readonly();

export type ITenantConfiguration = z.infer<typeof TenantConfigurationSchema>;