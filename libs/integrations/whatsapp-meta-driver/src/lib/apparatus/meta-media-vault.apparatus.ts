/** libs/integrations/whatsapp-meta-driver/src/lib/apparatus/meta-media-vault.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { IMetaMediaObject } from '../schemas/meta-contracts.schema';

/**
 * @name MetaMediaVaultApparatus
 * @description Aparato de gobernanza multimedia. Orquesta la descarga y
 * almacenamiento temporal de recursos binarios (Audios de voz, imágenes).
 *
 * @protocol OEDP-Level: Elite (Binary Flow Management)
 */
export class MetaMediaVaultApparatus {
  /**
   * @method downloadSovereignMedia
   * @description Recupera el binario de Meta Cloud y lo prepara para el Neural Engine.
   */
  public static async downloadSovereignMedia(
    mediaIdentifier: string,
    accessToken: string,
  ): Promise<Buffer> {
    const apparatusName = 'MetaMediaVaultApparatus';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      'downloadSovereignMedia',
      async () => {
        try {
          // 1. Obtener la URL temporal del recurso
          const metaUrlResponse = await fetch(
            `https://graph.facebook.com/v20.0/${mediaIdentifier}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            },
          );

          const metaMediaData =
            (await metaUrlResponse.json()) as IMetaMediaObject & {
              url: string;
            };

          // 2. Descarga del binario real
          const binaryResponse = await fetch(metaMediaData.url, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          const arrayBuffer = await binaryResponse.arrayBuffer();
          return Buffer.from(arrayBuffer);
        } catch (criticalDownloadError: unknown) {
          await OmnisyncSentinel.report({
            errorCode: 'OS-INTEG-604',
            severity: 'HIGH',
            apparatus: apparatusName,
            operation: 'download',
            message: 'integrations.meta.media_download_failed',
            context: {
              mediaId: mediaIdentifier,
              error: String(criticalDownloadError),
            },
            isRecoverable: true,
          });
          throw criticalDownloadError;
        }
      },
    );
  }
}
