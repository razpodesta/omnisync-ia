/** libs/integrations/omnichannel-orchestrator/src/lib/whatsapp/schemas/whatsapp-history.schema.ts */

import { z } from 'zod';

/**
 * @name WhatsAppServiceWindowSchema
 * @description Define el estado de la ventana de comunicación permitida por Meta.
 */
export const WhatsAppServiceWindowSchema = z
  .object({
    isOpen: z.boolean(),
    remainingHours: z.number().nonnegative(),
    lastInteractionTimestamp: z.string().datetime(),
    requiresTemplate: z.boolean(), // Si han pasado > 24h, Meta exige plantillas (HSM)
  })
  .readonly();

export type IWhatsAppServiceWindow = z.infer<
  typeof WhatsAppServiceWindowSchema
>;
