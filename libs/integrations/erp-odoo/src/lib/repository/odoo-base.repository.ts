import { OdooConnectorDriver } from '../drivers/odoo-connector.driver';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

export class OdooBaseRepository {
  /**
   * @method findPartnerByPhone
   * @description Localiza un contacto en Odoo buscando en campos phone y mobile.
   */
  public static async findPartnerByPhone(
    driver: OdooConnectorDriver,
    phoneNumber: string
  ): Promise<number | null> {
    return await OmnisyncTelemetry.traceExecution('OdooBaseRepository', 'findPartnerByPhone', async () => {
      const domain = [
        '|',
        ['phone', 'ilike', phoneNumber],
        ['mobile', 'ilike', phoneNumber]
      ];

      const ids = await driver.callModelMethod<number[]>('res.partner', 'search', [domain]);
      return ids.length > 0 ? ids[0] : null;
    });
  }

  /**
   * @method createTicket
   * @description Inserta un nuevo registro en helpdesk.ticket.
   */
  public static async createTicket(
    driver: OdooConnectorDriver,
    payload: Record<string, unknown>
  ): Promise<number> {
    return await driver.callModelMethod<number>('helpdesk.ticket', 'create', [payload]);
  }
}
