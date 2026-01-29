/** libs/integrations/omnichannel-orchestrator/src/lib/urgency-analyst.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncContracts } from '@omnisync/core-contracts';
import {
  UrgencyReportSchema,
  IUrgencyReport,
} from './schemas/urgency-analyst.schema';

/**
 * @name UrgencyAnalystApparatus
 * @description Aparato de élite para el análisis de criticidad multilingüe.
 * Actúa como un sensor cognitivo que evalúa la presión del mensaje del usuario
 * antes de la inferencia, permitiendo respuestas de baja latencia ante crisis.
 *
 * @protocol OEDP-Level: Elite (Multilingual Triage)
 */
export class UrgencyAnalystApparatus {
  /**
   * @method analyzeTextUrgency
   * @description Realiza un triaje lingüístico basado en diccionarios inyectados.
   *
   * @param {string} content - Texto saneado del usuario.
   * @param {string[]} localizedKeys - Palabras clave del idioma detectado.
   * @returns {IUrgencyReport} Diagnóstico de urgencia validado por SSOT.
   */
  public static analyzeTextUrgency(
    content: string,
    localizedKeys: string[],
  ): IUrgencyReport {
    const apparatusName = 'UrgencyAnalystApparatus';

    return OmnisyncTelemetry.traceExecutionSync(
      apparatusName,
      'analyze',
      () => {
        const lowerContent = content.toLowerCase();
        const matchedKeywords: string[] = [];

        // Detección de colisiones semánticas
        localizedKeys.forEach((key) => {
          const normalizedKey = key.toLowerCase().trim();
          if (lowerContent.includes(normalizedKey)) {
            matchedKeywords.push(normalizedKey);
          }
        });

        const matchCount = matchedKeywords.length;
        // Heurística de Élite: Cada coincidencia suma un 25% de score, hasta un techo de 100.
        const score = Math.min(matchCount * 25, 100);

        const report: IUrgencyReport = {
          isUrgent: score >= 25,
          score: score,
          level: this.resolveInstitutionalLevel(score),
          matchedKeywords: matchedKeywords,
        };

        return OmnisyncContracts.validate(
          UrgencyReportSchema,
          report,
          apparatusName,
        );
      },
    );
  }

  /**
   * @method resolveInstitutionalLevel
   * @private
   */
  private static resolveInstitutionalLevel(
    score: number,
  ): IUrgencyReport['level'] {
    if (score >= 90) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
  }
}
