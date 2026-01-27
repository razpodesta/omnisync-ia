/** libs/core/contracts/src/lib/schemas/identity-session.schema.ts */

import { z } from 'zod';
import { TenantIdSchema, UserIdSchema } from './core-contracts.schema';

/**
 * @name IdentitySessionSchema
 * @description Contrato maestro para la persistencia de sesiones y preferencias.
 * Define la estructura inmutable que viajará entre Cookies y LocalStorage.
 */
export const IdentitySessionSchema = z.object({
  /** Identificador único de la sesión */
  sessionId: z.string().uuid(),
  /** Token de autorización firmado (JWT) */
  sessionToken: z.string().min(32).brand<'SessionToken'>(),
  /** Identificador del usuario (Admin o Cliente) */
  userId: UserIdSchema,
  /** Nodo al que pertenece el usuario */
  tenantId: TenantIdSchema,
  /** Perfil del usuario dentro del ecosistema */
  role: z.enum(['SYSTEM_ADMIN', 'TENANT_ADMIN', 'CATALOG_USER', 'GUEST']),

  /**
   * @section Preferencias de Usuario (UX)
   */
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    locale: z.enum(['es', 'en', 'pt']).default('es'),
    autoExpandChat: z.boolean().default(false),
    fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
  }),

  /** Metadatos de conexión */
  metadata: z.object({
    userAgent: z.string(),
    ipAddressPreview: z.string().optional(),
    lastActivityAt: z.string().datetime(),
    originChannel: z.enum(['WEB', 'WHATSAPP', 'TELEGRAM']),
  }),
}).readonly();

/**
 * @type IIdentitySession
 * @description Representación tipada de la sesión activa.
 */
export type IIdentitySession = z.infer<typeof IdentitySessionSchema>;
