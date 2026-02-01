/** libs/integrations/ai-google-driver/src/lib/core/google-client.apparatus.ts */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';

/**
 * @name GoogleSovereignClientApparatus
 * @description Aparato central de infraestructura para el ecosistema Google AI.
 * Provee la instancia única y validada del SDK, gestionando la soberanía de la
 * API Key y asegurando que la ignición de red cumpla con el protocolo OEDP.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Infrastructure-Sovereignty V4.0)
 * @vision Ultra-Holística: Zero-Client-Duplication & Resilient-Handshake
 */
export class GoogleSovereignClientApparatus {
  private static sdkInstance: GoogleGenerativeAI | null = null;

  /**
   * @method getAuthenticatedInstance
   * @description Recupera la instancia del SDK realizando una auditoría de secretos.
   */
  public static getAuthenticatedInstance(): GoogleGenerativeAI {
    const apparatusName = 'GoogleSovereignClient';
    
    if (this.sdkInstance) return this.sdkInstance;

    const securityApiKey = process.env['GOOGLE_GEMINI_API_KEY'];

    if (!securityApiKey || securityApiKey.length < 20) {
      /**
       * @section Reporte Sentinel de Infraestructura
       * El colapso de la API Key bloquea todo el workspace de Google.
       */
      OmnisyncSentinel.report({
        errorCode: 'OS-INTEG-401',
        severity: 'CRITICAL',
        apparatus: apparatusName,
        operation: 'sdk_ignition',
        message: 'La llave de soberanía de Google AI no ha sido localizada o es corrupta.',
        isRecoverable: false
      });
      throw new Error('OS-INTEG-401: Google SDK ignition failed. API Key missing.');
    }

    this.sdkInstance = new GoogleGenerativeAI(securityApiKey);
    
    OmnisyncTelemetry.verbose(apparatusName, 'ignition_success', 
      'Handshake con el cluster de Google AI completado.'
    );

    return this.sdkInstance;
  }

  /**
   * @method flushInstance
   * @description Erradica la instancia actual para permitir rotación de llaves.
   */
  public static flushInstance(): void {
    this.sdkInstance = null;
  }
}