/** libs/integrations/erp-odoo/src/lib/mappers/odoo-model.mapper.ts */

import { IERPTicket, IOmnisyncUser } from '@omnisync/core-contracts';
import { IOdooTicketProvisioning } from '../schemas/odoo-integration.schema';

/**
 * @name OdooModelMapper
 * @description Aparato de traducción semántica. Convierte entidades del dominio
 * Omnisync a requerimientos técnicos de los modelos de Odoo (Helpdesk/CRM).
 *
 * @protocol OEDP-Level: Elite (Semantic Mapping)
 */
export class OdooModelMapper {

  /**
   * @method mapToOdooTicket
   * @description Transforma una intención de ticket al formato helpdesk.ticket de Odoo.
   */
  public static mapToOdooTicket(
    ticketData: IERPTicket,
    odooPartnerIdentifier?: number
  ): IOdooTicketProvisioning {
    return {
      subject: ticketData.subject,
      description: ticketData.description,
      partnerIdentifier: odooPartnerIdentifier,
      priority: this.convertPriorityToOdooScale(ticketData.priority),
    };
  }

  /**
   * @method mapToOdooPartner
   * @description Prepara los datos para la creación de un res.partner.
   */
  public static mapToOdooPartner(user: IOmnisyncUser): Record<string, unknown> {
    return {
      name: `Omnisync User: ${user.id}`,
      email: user.email,
      mobile: user.phone,
      comment: 'Registro automatizado vía Omnisync Neural Hub.',
    };
  }

  /**
   * @method convertPriorityToOdooScale
   * @private
   */
  private static convertPriorityToOdooScale(priority: string): '0' | '1' | '2' | '3' {
    const scaleMap: Record<string, '0' | '1' | '2' | '3'> = {
      'LOW': '0',
      'MEDIUM': '1',
      'HIGH': '2',
      'URGENT': '3'
    };
    return scaleMap[priority] ?? '1';
  }
}
