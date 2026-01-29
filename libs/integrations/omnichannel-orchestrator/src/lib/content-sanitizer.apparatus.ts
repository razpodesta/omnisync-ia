/** libs/integrations/omnichannel-orchestrator/src/lib/content-sanitizer.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import {
  ContentSanitizationConfigurationSchema,
  IContentSanitizationConfiguration,
} from './schemas/content-sanitizer.schema';

/**
 * @name ContentSanitizerApparatus
 * @description Aparato de élite especializado en el saneamiento, normalización y blindaje
 * de contenido textual. Actúa como el filtro de seguridad primario para evitar que
 * caracteres de control o inyecciones bidi contaminen el cerebro neural.
 *
 * @protocol OEDP-Level: Elite (Linter-Proof & Unicode-Native)
 */
export class ContentSanitizerApparatus {
  /**
   * @method executeSovereignSanitization
   * @description Realiza un saneamiento profundo del texto.
   * Erradica caracteres no imprimibles mediante categorías Unicode, colapsa espacios
   * en blanco redundantes y aplica límites de soberanía de extensión.
   *
   * @param {string} rawTextualContent - ADN textual bruto proveniente de un canal.
   * @param {Partial<IContentSanitizationConfiguration>} customConfiguration - Ajustes de seguridad.
   * @returns {string} Texto higienizado y optimizado para inferencia IA.
   */
  public static executeSovereignSanitization(
    rawTextualContent: string,
    customConfiguration: Partial<IContentSanitizationConfiguration> = {},
  ): string {
    const apparatusName = 'ContentSanitizerApparatus';
    const operationName = 'executeSovereignSanitization';

    return OmnisyncTelemetry.traceExecutionSync(
      apparatusName,
      operationName,
      () => {
        if (!rawTextualContent) {
          return '';
        }

        // 1. Hidratación de Configuración (ADN Operativo)
        const configuration =
          ContentSanitizationConfigurationSchema.parse(customConfiguration);

        let sanitizedBuffer = rawTextualContent.trim();

        /**
         * @section Saneamiento de Caracteres de Control
         * RESOLUCIÓN DEFINITIVA: Se utilizan Unicode Property Escapes (\p{Cc}).
         * La categoría 'Cc' (Control) engloba \x00-\x1F y \x7F-\x9F de forma nativa.
         * Esto erradica el error 'no-control-regex' al no usar códigos hexadecimales literales.
         * El flag 'u' es obligatorio para el soporte de propiedades Unicode.
         */
        if (configuration.stripControlCharacters) {
          const controlRegex = /\p{Cc}/gu;
          sanitizedBuffer = sanitizedBuffer.replace(controlRegex, '');
        }

        /**
         * @section Blindaje contra Inyección Bidi
         * Elimina caracteres invisibles de dirección (Bidi_Control).
         * Usamos la propiedad específica 'Bidi_Control' para máxima precisión arquitectónica.
         */
        if (configuration.blockBidirectionalPatterns) {
          const bidiRegex = /\p{Bidi_Control}/gu;
          sanitizedBuffer = sanitizedBuffer.replace(bidiRegex, '');
        }

        /**
         * @section Normalización Estructural
         * Colapsa múltiples espacios, tabulaciones o saltos de línea en un solo espacio
         * para reducir el conteo de tokens en el AI-Engine.
         */
        sanitizedBuffer = sanitizedBuffer.replace(/\s+/g, ' ');

        // 3. Aplicación de Soberanía de Extensión
        return sanitizedBuffer.substring(
          0,
          configuration.maximumCharacterLength,
        );
      },
    );
  }

  /**
   * @method validateContentSafety
   * @description Ejecuta una auditoría de seguridad preventiva.
   * Identifica patrones maliciosos antes de que el contenido llegue al orquestador.
   *
   * @param {string} textualContent - Contenido a inspeccionar.
   * @returns {boolean} True si el contenido es considerado seguro y procesable.
   */
  public static validateContentSafety(textualContent: string): boolean {
    const apparatusName = 'ContentSanitizerApparatus';

    if (textualContent.trim().length === 0) {
      return false;
    }

    /**
     * Detección de Bidi Control (Ataques de ofuscación de texto).
     * Se utiliza la propiedad nativa de Unicode para evitar regresiones de linter.
     */
    const bidiSecurityRegex = /\p{Bidi_Control}/gu;
    const hasSuspiciousBidi = bidiSecurityRegex.test(textualContent);

    if (hasSuspiciousBidi) {
      OmnisyncSentinel.report({
        errorCode: 'OS-SEC-403',
        severity: 'MEDIUM',
        apparatus: apparatusName,
        operation: 'validateContentSafety',
        message: 'integrations.omnichannel.sanitizer.bidi_detected',
        context: {
          contentPreview: textualContent.substring(0, 30),
          risk: 'Prompt Injection / Semantic Deception',
        },
        isRecoverable: true,
      });
    }

    return !hasSuspiciousBidi;
  }
}
