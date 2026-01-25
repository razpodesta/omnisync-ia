/** libs/integrations/erp-orchestrator/src/lib/erp-orchestrator.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { IERPAdapter, IERPActionResponse, ERPActionResponseSchema } from '@omnisync/core-contracts';

/**
 * @name OmnisyncERPOrchestrator
 * @description Cerebro de ejecución operativa. 
 * Orquesta las llamadas a diferentes ERPs mediante adaptadores inyectados.
 */
export class OmnisyncERPOrchestrator {
  /**
   * @method executeTicketCreation
   * @description Centraliza la creación de tickets aplicando políticas de resiliencia.
   */
  public static async executeTicketCreation(
    adapter: IERPAdapter,
    ticketData: unknown
  ): Promise<IERPActionResponse> {
    return await OmnisyncTelemetry.traceExecution(
      'OmnisyncERPOrchestrator',
      `createTicket:${adapter.providerName}`,
      async () => {
        try {
          const startTime = performance.now();

          // Ejecución con el Sentinel para reintentos automáticos
          const result = await OmnisyncSentinel.executeWithResilience(
            () => adapter.createTicket(ticketData),
            'OmnisyncERPOrchestrator',
            adapter.providerName
          );

          const duration = performance.now() - startTime;

          return ERPActionResponseSchema.parse({
            success: true,
            externalId: result.externalId,
            syncStatus: 'SYNCED',
            messageKey: 'integrations.erp.ticket_created_success',
            latencyInMilliseconds: duration
          });
        } catch (error) {
          // En caso de fallo total, el orquestador decide el estado de sincronización
          return ERPActionResponseSchema.parse({
            success: false,
            syncStatus: 'FAILED_RETRYING',
            messageKey: 'integrations.erp.service_unavailable',
            latencyInMilliseconds: 0
          });
        }
      }
    );
  }
}