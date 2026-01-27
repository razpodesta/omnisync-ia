/** libs/integrations/erp-odoo/src/lib/mappers/odoo-model.mapper.ts */

import { IERPTicket } from '@omnisync/core-contracts';
import { IOdooTicketPayload } from '../schemas/odoo-integration.schema';

/**
 * @name OdooModelMapper
 * @description Aparato estático de traducción semántica entre Omnisync y Odoo.
 * Erradica la ambigüedad de tipos mediante el uso del contrato IOdooTicketPayload.
 *
 * @protocol OEDP-Level: Elite (Semantic Mapping)
 */
export class OdooModelMapper {

  /**
   * @method mapToOdooTicketPayload
   * @description Transforma una intención neural al formato técnico de Odoo Helpdesk.
   */
  public static mapToOdooTicketPayload(
    ticketDomainData: IERPTicket,
    odooPartnerIdentifier: number | null
  ): IOdooTicketPayload {
    return {
      name: ticketDomainData.subject,
      description: ticketDomainData.description,
      // En Odoo, si no hay partner_id, se envía 'false' (boolean)
      partner_id: odooPartnerIdentifier ?? false,
      priority: this.convertPriorityToOdooScale(ticketDomainData.priority),
    };
  }

  /**
   * @method convertPriorityToOdooScale
   * @private
   */
  private static convertPriorityToOdooScale(priority: string): '0' | '1' | '2' | '3' {
    const scaleMapping: Record<string, '0' | '1' | '2' | '3'> = {
      'LOW': '0',
      'MEDIUM': '1',
      'HIGH': '2',
      'URGENT': '3'
    };
    return scaleMapping[priority] ?? '1';
  }
}
