/** libs/core/contracts/src/lib/schemas/tenant-config.schema.ts */

import { z } from 'zod';
import { TenantIdSchema } from './core-contracts.schema';
import { ArtificialIntelligenceModelConfigurationSchema } from './ai-orchestration.schema';

/**
 * @name OperationalStatusSchema
 * @description Define los estados posibles de un nodo dentro de la red neural.
 */
export const OperationalStatusSchema = z.enum([
  'ACTIVE',
  'SUSPENDED',
  'MAINTENANCE',
  'PROVISIONING',
]);

/**
 * @name TenantConfigurationSchema
 * @description Esquema de validación maestro para la identidad, conectividad y
 * personalización de una organización (Tenant). Es la Única Fuente de Verdad (SSOT)
 * utilizada por el Neural Hub para hidratar el contexto de ejecución.
 */
export const TenantConfigurationSchema = z
  .object({
    /** Identificador único inmutable del suscriptor */
    id: TenantIdSchema,

    /** Nombre institucional de la organización */
    organizationName: z.string().min(3).max(100),

    /** Identificador amigable para rutas URL (ej: 'omnisync-tech') */
    urlSlug: z
      .string()
      .lowercase()
      .regex(/^[a-z0-9-]+$/),

    /** Estado operativo actual del nodo */
    status: OperationalStatusSchema,

    /**
     * @section Configuración de Inteligencia Artificial
     * Define el cerebro generativo asignado al Tenant.
     */
    artificialIntelligence: z.object({
      provider: z.enum([
        'GOOGLE_GEMINI',
        'OPENAI_GPT',
        'ANTHROPIC_CLAUDE',
        'LOCAL_LLAMA',
      ]),
      modelConfiguration: ArtificialIntelligenceModelConfigurationSchema,
      systemPrompt: z.string().min(50),
      /** Umbral de confianza para respuestas automatizadas (0.0 a 1.0) */
      confidenceThreshold: z.number().min(0).max(1).default(0.7),
    }),

    /**
     * @section Configuración de Integración Operativa (ERP)
     * Define el puente de acción hacia los sistemas de gestión.
     */
    enterpriseResourcePlanning: z.object({
      adapterIdentifier: z.enum([
        'MOCK_SYSTEM',
        'ODOO_V16',
        'SAP_BUSINESS_ONE',
        'SALESFORCE_CRM',
      ]),
      /** Credenciales cifradas gestionadas por OmnisyncSecurity */
      encryptedCredentials: z.string(),
      /** Tiempo máximo de espera para operaciones síncronas */
      requestTimeoutMilliseconds: z.number().positive().default(5000),
    }),

    /**
     * @section Configuración de Memoria Semántica (RAG)
     * Define cómo la IA interactúa con los manuales técnicos.
     */
    knowledgeRetrieval: z.object({
      vectorCollectionIdentifier: z.string(),
      maximumChunksToRetrieve: z.number().int().min(1).max(10).default(3),
      /** Porcentaje de similitud mínima para considerar un fragmento válido */
      similarityScoreThreshold: z.number().min(0).max(1).default(0.75),
    }),

    /**
     * @section Configuración de Experiencia de Usuario (Branding)
     * Define la identidad visual Manus.io Obsidian & Milk del Tenant.
     */
    userExperience: z.object({
      primaryColorHex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
      accentColorHex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
      logoUrl: z.string().url().optional(),
      welcomeMessage: z.string().min(10),
      /** Determina si el Web Widget inicia expandido */
      autoExpandWidget: z.boolean().default(false),
    }),

    /** Canales de comunicación habilitados para este nodo */
    enabledChannels: z.array(
      z.enum(['WHATSAPP', 'WEB_CHAT', 'TELEGRAM', 'VOICE_CALL']),
    ),

    /** Marca de tiempo de la última actualización de ADN */
    updatedAt: z.string().datetime(),
  })
  .readonly();

/**
 * @type ITenantConfiguration
 * @description Representación tipada de la configuración de la organización.
 */
export type ITenantConfiguration = z.infer<typeof TenantConfigurationSchema>;
