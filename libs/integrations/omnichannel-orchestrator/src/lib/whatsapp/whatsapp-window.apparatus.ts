/** libs/integrations/omnichannel-orchestrator/src/lib/whatsapp/whatsapp-window.apparatus.ts */

import { OmnisyncDatabase } from '@omnisync-ecosystem/persistence';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { IWhatsAppServiceWindow, WhatsAppServiceWindowSchema } from './schemas/whatsapp-history.schema';

/**
 * @name WhatsAppWindowApparatus
 * @description Especialista en la gestión de políticas de comunicación de Meta.
 * Basado en las especificaciones oficiales de WhatsApp Cloud API (2026),
 * determina si la ventana de respuesta reactiva está habilitada.
 *
 * @protocol OEDP-Level: Elite (Policy Enforcement)
 */
export class WhatsAppWindowApparatus {
  private static readonly META_SERVICE_WINDOW_HOURS = 24;

  /**
   * @method calculateServiceStatus
   * @description Analiza la última interacción para determinar la soberanía del mensaje.
   */
  public static async calculateServiceStatus(
    tenantOrganizationIdentifier: string,
    externalUserIdentifier: string
  ): Promise<IWhatsAppServiceWindow> {
    return await OmnisyncTelemetry.traceExecution(
      'WhatsAppWindowApparatus',
      'calculateServiceStatus',
      async () => {
        const lastRecord = await OmnisyncDatabase.databaseEngine.supportThread.findFirst({
          where: {
            tenantId: tenantOrganizationIdentifier,
            externalUserId: externalUserIdentifier,
            channel: 'WHATSAPP'
          },
          orderBy: { createdAt: 'desc' }
        });

        if (!lastRecord) {
          return WhatsAppServiceWindowSchema.parse({
            isOpen: false,
            remainingHours: 0,
            lastInteractionTimestamp: new Date(0).toISOString(),
            requiresTemplate: true
          });
        }

        const lastActivity = new Date(lastRecord.createdAt).getTime();
        const differenceInMilliseconds = Date.now() - lastActivity;
        const elapsedHours = differenceInMilliseconds / (1000 * 60 * 60);

        const isOpen = elapsedHours < this.META_SERVICE_WINDOW_HOURS;

        return WhatsAppServiceWindowSchema.parse({
          isOpen,
          remainingHours: Math.max(0, this.META_SERVICE_WINDOW_HOURS - elapsedHours),
          lastInteractionTimestamp: lastRecord.createdAt.toISOString(),
          requiresTemplate: !isOpen
        });
      }
    );
  }
}
