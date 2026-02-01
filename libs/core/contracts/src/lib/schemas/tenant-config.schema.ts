/** libs/core/contracts/src/lib/schemas/tenant-config.schema.ts */

import { z } from 'zod';
import { TenantIdSchema } from './core-contracts.schema';
import { ArtificialIntelligenceModelConfigurationSchema } from './ai-orchestration.schema';

/**
 * @name OperationalStatusSchema
 * @description Define la taxonomía de estados vitales para un nodo en la red neural.
 */
export const OperationalStatusSchema = z.enum([
  'ACTIVE',       // Operación nominal completa
  'SUSPENDED',    // Acceso bloqueado por administración
  'MAINTENANCE',  // Ventana técnica activa
  'PROVISIONING', // ADN en fase de hidratación inicial
  'ARCHIVED'      // Nodo fuera de servicio con preservación de datos
]);

/**
 * @name ActionGuardPolicySchema
 * @description Define las leyes de supervisión para acciones operativas sensibles.
 * Orquesta el balance entre automatización neural y seguridad humana.
 */
const ActionGuardPolicySchema = z.object({
  /** Si es true, toda acción ERP requiere el 'Sello de Aprobación' en el Dashboard */
  manualApprovalRequired: z.boolean().default(false),
  
  /** 
   * Umbral de confianza mínimo (0.0 - 1.0) para permitir la ejecución autónoma. 
   * Si la IA responde con un score inferior, el Action Guard suspende la tarea automáticamente.
   */
  minimumAutoExecutionConfidence: z.number().min(0).max(1).default(0.90),
  
  /** Canales donde se notificará al administrador sobre acciones pendientes */
  notificationChannels: z.array(z.enum(['WEB_DASHBOARD', 'EMAIL', 'SYSTEM_PUSH'])).default(['WEB_DASHBOARD']),
}).readonly();

/**
 * @name TenantConfigurationSchema
 * @description Contrato maestro de Única Fuente de Verdad (SSOT) para la identidad,
 * gobernanza y arquitectura de un suscriptor. Sincronizado para la Fase 4: Consumación.
 * 
 * @protocol OEDP-Level: Elite (Sovereign-Governance-Manifest V4.0)
 * @vision Ultra-Holística: Zero-Unintended-Actions & Regional-Sovereignty
 */
export const TenantConfigurationSchema = z.object({
  /** Identificador único universal del suscriptor (Branded Type) */
  id: TenantIdSchema,

  /** Nombre nominal de la entidad organizacional */
  organizationName: z.string().min(3).max(100).trim(),

  /** Identificador semántico para ruteo de red (ej: 'metashark-global') */
  urlSlug: z.string().lowercase().regex(/^[a-z0-9-]+$/),

  /** Estado operativo actual del nodo */
  status: OperationalStatusSchema,

  /**
   * @section Capa de Cognición (AI Engine)
   * Define el cerebro neural y los límites de razonamiento.
   */
  artificialIntelligence: z.object({
    provider: z.enum([
      'GOOGLE_GEMINI',
      'OPENAI_GPT',
      'ANTHROPIC_CLAUDE',
      'DEEP_SEEK',
      'LOCAL_LLAMA'
    ]),
    modelConfiguration: ArtificialIntelligenceModelConfigurationSchema,
    systemPrompt: z.string().min(50),
    /** Umbral de triaje para la respuesta directa al usuario (0.0 a 1.0) */
    confidenceThreshold: z.number().min(0).max(1).default(0.7),
  }),

  /**
   * @section Capa de Acción Operativa (ERP/CRM Bridge)
   * Orquesta la integración transaccional y su gobernanza.
   */
  enterpriseResourcePlanning: z.object({
    adapterIdentifier: z.enum([
      'MOCK_SYSTEM',
      'ODOO_V16',
      'ODOO_V18',
      'SAP_BUSINESS_ONE',
      'SALESFORCE_CRM',
    ]),
    /** Credenciales cifradas vía OmnisyncSecurity (AES-256-GCM) */
    encryptedCredentials: z.string(),
    /** Tiempo de gracia para transacciones físicas */
    requestTimeoutMilliseconds: z.number().positive().default(10000),
    /** 
     * @protocol Action Guard
     * Política de supervisión de ejecuciones externas.
     */
    governance: ActionGuardPolicySchema,
  }),

  /**
   * @section Capa de Memoria Semántica (RAG)
   */
  knowledgeRetrieval: z.object({
    vectorCollectionIdentifier: z.string(),
    maximumChunksToRetrieve: z.number().int().min(1).max(15).default(3),
    similarityScoreThreshold: z.number().min(0).max(1).default(0.75),
  }),

  /**
   * @section Capa de Identidad Visual ( Manus.io Signature )
   */
  userExperience: z.object({
    primaryColorHex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    accentColorHex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    logoUrl: z.string().url().optional(),
    welcomeMessage: z.string().min(10),
    autoExpandWidget: z.boolean().default(false),
  }),

  /**
   * @section Capa de Seguridad Territorial
   * Permite restricciones de geofencing a nivel de Tenant.
   */
  regionalPolicy: z.object({
    allowedCountryCodes: z.array(z.string().length(2).toUpperCase()).optional(),
    enforceStrictSovereignty: z.boolean().default(true),
  }).optional(),

  /** Canales de comunicación autorizados para este nodo */
  enabledChannels: z.array(z.enum(['WHATSAPP', 'WEB_CHAT', 'TELEGRAM', 'VOICE_CALL'])),

  /** Marca de tiempo de la última mutación del ADN organizacional */
  updatedAt: z.string().datetime(),
}).readonly();

/** @type ITenantConfiguration */
export type ITenantConfiguration = z.infer<typeof TenantConfigurationSchema>;