/** libs/integrations/whatsapp-meta-driver/src/index.ts */

/**
 * @section Orquestación Principal
 * Exportación del driver maestro que implementa el contrato IWhatsAppDriver.
 */
export { MetaDriverApparatus } from './lib/meta-driver.apparatus';

/**
 * @section Aparatos Atómicos (Lego Pieces)
 * Exportación de especialistas nivelados con responsabilidad única.
 */
export { MetaMessagingApparatus } from './lib/apparatus/meta-messaging.apparatus';
export { MetaPresenceApparatus } from './lib/apparatus/meta-presence.apparatus';
export { MetaMediaVaultApparatus } from './lib/apparatus/meta-media-vault.apparatus';
export { MetaVoiceSignalApparatus } from './lib/apparatus/meta-voice-signal.apparatus';
export { MetaWebhookParserApparatus } from './lib/apparatus/meta-webhook-parser.apparatus';
export { MetaInteractiveApparatus } from './lib/apparatus/meta-interactive.apparatus';

/**
 * @section ADN de Contratos (SSOT)
 * Exportación de esquemas granulares para validación de datos Meta.
 *
 * NIVELACIÓN: Sanación de Error TS2307 mediante corrección de ruta semántica.
 */
export * from './lib/schemas/meta-contracts.schema';
export * from './lib/schemas/messaging/meta-messaging.schema';
