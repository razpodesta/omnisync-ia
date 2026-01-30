/** libs/integrations/omnichannel-orchestrator/src/lib/whatsapp/whatsapp-window.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncContracts } from '@omnisync/core-contracts';
/** 
 * @section Sincronización de Persistencia
 * RESOLUCIÓN TS2307: Se actualiza al alias nominal soberano.
 */
import { OmnisyncDatabase } from '@omnisync/core-persistence';

import {
  IWhatsAppServiceWindow,
  WhatsAppServiceWindowSchema,
} from './schemas/whatsapp-history.schema';

/**
 * @name WhatsAppWindowApparatus
 * @description Especialista en la gestión de políticas de comunicación de Meta Cloud API.
 * Determina la soberanía del mensaje reactivo basándose en la ventana de 24 horas.
 * Actúa como el sensor de cumplimiento legal para evitar bloqueos del canal oficial.
 *
 * @protocol OEDP-Level: Elite (Policy-Enforcement V3.0)
 */
export class WhatsAppWindowApparatus {
  /**
   * @private
   * Definición del umbral físico de Meta para mensajería reactiva.
   */
  private static readonly META_SERVICE_WINDOW_HOURS = 24;

  /**
   * @private
   * Fecha de respaldo para sesiones sin historial previo (Génesis técnica).
   */
  private static readonly SOVEREIGN_GENESIS_TIMESTAMP = '1970-01-01T00:00:00.000Z';

  /**
   * @method calculateServiceStatus
   * @description Analiza el rastro forense en la base de datos para validar la ventana de servicio.
   *
   * @param {string} tenantOrganizationIdentifier - Identificador nominal del nodo.
   * @param {string} externalUserIdentifier - Identificador E.164 del destinatario.
   * @returns {Promise<IWhatsAppServiceWindow>} Estado de la ventana validado por SSOT.
   */
  public static async calculateServiceStatus(
    tenantOrganizationIdentifier: string,
    externalUserIdentifier: string,
  ): Promise<IWhatsAppServiceWindow> {
    const apparatusName = 'WhatsAppWindowApparatus';
    const operationName = 'calculateServiceStatus';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        /**
         * @section 1. Recuperación de Rastro Forense
         * Consultamos el último registro de comunicación para este cliente en el nodo.
         */
        const lastInteractionRecord =
          await OmnisyncDatabase.databaseEngine.supportThread.findFirst({
            where: {
              tenantId: tenantOrganizationIdentifier,
              externalUserId: externalUserIdentifier,
              channel: 'WHATSAPP',
            },
            orderBy: { createdAt: 'desc' },
          });

        /**
         * @section 2. Evaluación de Sesión Nueva
         * Si no existe registro, la ventana está cerrada y Meta exige plantilla (HSM).
         */
        if (!lastInteractionRecord) {
          const genesisPayload: IWhatsAppServiceWindow = {
            isOpen: false,
            remainingHours: 0,
            lastInteractionTimestamp: this.SOVEREIGN_GENESIS_TIMESTAMP,
            requiresTemplate: true,
          };

          return OmnisyncContracts.validate(
            WhatsAppServiceWindowSchema,
            genesisPayload,
            `${apparatusName}:Genesis`
          );
        }

        /**
         * @section 3. Cálculo de Latencia Temporal
         * Determinamos las horas transcurridas desde el último pulso del usuario.
         */
        const lastActivityTimestamp = new Date(lastInteractionRecord.createdAt).getTime();
        const differenceInMilliseconds = Date.now() - lastActivityTimestamp;
        const elapsedHours = differenceInMilliseconds / (1000 * 60 * 60);

        const isWindowOpen = elapsedHours < this.META_SERVICE_WINDOW_HOURS;
        const remainingTime = Math.max(0, this.META_SERVICE_WINDOW_HOURS - elapsedHours);

        const statusPayload: IWhatsAppServiceWindow = {
          isOpen: isWindowOpen,
          remainingHours: Number(remainingTime.toFixed(2)),
          lastInteractionTimestamp: lastInteractionRecord.createdAt.toISOString(),
          requiresTemplate: !isWindowOpen,
        };

        OmnisyncTelemetry.verbose(
          apparatusName,
          'policy_audit',
          `Ventana para ${externalUserIdentifier}: ${isWindowOpen ? 'OPEN' : 'CLOSED'}`,
          { remainingHours: statusPayload.remainingHours }
        );

        /**
         * @section 4. Sello de Integridad (SSOT)
         */
        return OmnisyncContracts.validate(
          WhatsAppServiceWindowSchema,
          statusPayload,
          apparatusName
        );
      },
      { tenantId: tenantOrganizationIdentifier, userId: externalUserIdentifier }
    );
  }
}