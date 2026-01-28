/** libs/integrations/whatsapp-meta-driver/src/lib/apparatus/meta-interactive.apparatus.ts */

import { IMetaOutboundPayload } from '../schemas/messaging/meta-messaging.schema';

/**
 * @name MetaInteractiveApparatus
 * @description Especialista en la construcción de payloads para la mensajería
 * interactiva de WhatsApp 2026. Transforma el ADN de Omnisync en gramática Meta.
 */
export class MetaInteractiveApparatus {

  /**
   * @method buildInteractivePayload
   * @description Construye el bloque 'interactive' según el tipo de componente.
   */
  public static buildInteractivePayload(data: IMetaOutboundPayload): unknown {
    const isList = !!data.interactiveData?.sections;

    return {
      type: isList ? 'list' : 'button',
      header: data.interactiveData?.headerText ? { type: 'text', text: data.interactiveData.headerText } : undefined,
      body: { text: data.content },
      footer: data.interactiveData?.footerText ? { text: data.interactiveData.footerText } : undefined,
      action: isList ? {
        button: data.interactiveData?.buttonLabel ?? 'Opciones',
        sections: data.interactiveData?.sections
      } : {
        buttons: data.interactiveData?.buttons
      }
    };
  }
}
