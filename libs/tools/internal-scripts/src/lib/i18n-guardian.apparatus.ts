/** libs/tools/internal-scripts/src/lib/i18n-guardian.apparatus.ts */

import * as fileSystem from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { glob } from 'glob';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncContracts } from '@omnisync/core-contracts';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';

/** 
 * @section Sincronización de ADN Local 
 */
import { 
  I18nIntegrityReportSchema,
  II18nIntegrityReport,
  II18nAnomaly
} from './schemas/i18n-guardian.schema';

/**
 * @name I18nSymmetryGuardian
 * @description Aparato de élite encargado de velar por la paridad absoluta 
 * entre los silos lingüísticos del monorepo. Realiza una auditoría biyectiva 
 * profunda comparando estructuras JSON, presencia de archivos y densidad de 
 * contenido entre los idiomas de soberanía (ES, EN, PT).
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Linguistic-Symmetry V4.0)
 * @vision Ultra-Holística: Zero-Missing-Translations & Content-Density-Check
 */
export class I18nSymmetryGuardian {
  private static readonly SOVEREIGN_LOCALES = ['es', 'en', 'pt'] as const;
  private static readonly MASTER_LOCALE = 'es';

  /**
   * @method executeSovereignAudit
   * @description Orquesta la inspección profunda de la arquitectura lingüística.
   * Retorna un reporte inmutable validado por contrato SSOT.
   */
  public static async executeSovereignAudit(): Promise<II18nIntegrityReport> {
    const apparatusName = 'I18nSymmetryGuardian';
    const operationName = 'executeSovereignAudit';

    return await OmnisyncTelemetry.traceExecution(apparatusName, operationName, async () => {
      OmnisyncTelemetry.verbose(apparatusName, 'audit_initiation', 'Iniciando escaneo biyectivo de silos i18n...');

      // 1. Localización de fragmentos ignorando artefactos de construcción
      const dictionaryFragmentsFound = await glob(`{libs,apps}/**/i18n/**/*.json`, {
        ignore: [
          '**/node_modules/**', 
          '**/dist/**', 
          '**/.next/**', 
          '**/core/security/src/lib/i18n/**' // Evitamos auditar el bundle consolidado
        ]
      });

      const detectedAnomaliesCollection: II18nAnomaly[] = [];
      const componentGroups = this.groupLinguisticAssetsByApparatus(dictionaryFragmentsFound);

      /**
       * @section Fase de Inspección Granular
       */
      for (const [apparatusPath, localeMap] of Object.entries(componentGroups)) {
        await this.auditApparatusLinguisticIntegrity(
          apparatusPath, 
          localeMap, 
          detectedAnomaliesCollection
        );
      }

      const totalNamespaces = Object.keys(componentGroups).length;
      const isSymmetric = detectedAnomaliesCollection.length === 0;

      const rawReport: II18nIntegrityReport = {
        reportIdentifier: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        isSymmetric,
        auditedNamespacesCount: totalNamespaces,
        anomalies: detectedAnomaliesCollection,
        aiContext: {
          summary: `Auditoría finalizada para ${totalNamespaces} namespaces. ${detectedAnomaliesCollection.length} anomalías detectadas.`,
          remediationPath: isSymmetric ? 'NONE' : 'REPAIR_IDENTIFIED_DNA_GAPS'
        }
      };

      /**
       * @section Validación de Soberanía (SSOT)
       */
      return OmnisyncContracts.validate(
        I18nIntegrityReportSchema,
        rawReport,
        apparatusName
      );
    });
  }

  /**
   * @method auditApparatusLinguisticIntegrity
   * @private
   */
  private static async auditApparatusLinguisticIntegrity(
    apparatusBaseIdentifier: string,
    localeFileMap: Record<string, string>,
    anomaliesAccumulator: II18nAnomaly[]
  ): Promise<void> {
    const linguisticNamespace = path.basename(Object.values(localeFileMap)[0], '.json');

    for (const targetLocale of this.SOVEREIGN_LOCALES) {
      // 1. Verificación de Presencia Física
      if (!localeFileMap[targetLocale]) {
        anomaliesAccumulator.push({
          apparatusIdentifier: apparatusBaseIdentifier,
          targetLocale,
          namespace: linguisticNamespace,
          severity: 'CRITICAL',
          anomalyType: 'MISSING_FILE',
          technicalDetails: `El aparato carece del silo para el idioma: ${targetLocale.toUpperCase()}`
        });
        continue;
      }

      // 2. Verificación de Simetría de Contrato contra el Master (ES)
      if (targetLocale !== this.MASTER_LOCALE && localeFileMap[this.MASTER_LOCALE]) {
        this.performBiyectiveDnaComparison(
          localeFileMap[this.MASTER_LOCALE],
          localeFileMap[targetLocale],
          targetLocale,
          linguisticNamespace,
          anomaliesAccumulator
        );
      }
    }
  }

  /**
   * @method performBiyectiveDnaComparison
   * @private
   */
  private static performBiyectiveDnaComparison(
    masterFilePath: string,
    targetFilePath: string,
    targetLocale: string,
    namespace: string,
    anomalies: II18nAnomaly[]
  ): void {
    try {
      const masterContent = JSON.parse(fileSystem.readFileSync(masterFilePath, 'utf-8'));
      const targetContent = JSON.parse(fileSystem.readFileSync(targetFilePath, 'utf-8'));

      const masterKeys = this.flattenLinguisticKeys(masterContent);
      const targetKeys = this.flattenLinguisticKeys(targetContent);

      // Auditoría de llaves faltantes
      for (const masterKey of masterKeys) {
        if (!targetKeys.includes(masterKey)) {
          anomalies.push({
            apparatusIdentifier: targetFilePath,
            targetLocale,
            namespace,
            severity: 'CRITICAL',
            anomalyType: 'KEY_MISMATCH',
            technicalDetails: `La clave [${masterKey}] está ausente en el silo ${targetLocale.toUpperCase()}.`
          });
        } else {
          // Auditoría de Densidad: Verificar que no sea un string vacío o placeholder
          const value = this.resolveKeyPath(targetContent, masterKey);
          if (!value || String(value).trim().length === 0) {
            anomalies.push({
              apparatusIdentifier: targetFilePath,
              targetLocale,
              namespace,
              severity: 'WARNING',
              anomalyType: 'EMPTY_CONTENT',
              technicalDetails: `La clave [${masterKey}] existe pero su valor de ADN está vacío.`
            });
          }
        }
      }
    } catch (criticalParsingError: unknown) {
      anomalies.push({
        apparatusIdentifier: targetFilePath,
        targetLocale,
        namespace,
        severity: 'CRITICAL',
        anomalyType: 'INVALID_JSON',
        technicalDetails: `Error de sintaxis JSON: ${String(criticalParsingError)}`
      });
    }
  }

  /**
   * @method flattenLinguisticKeys
   * @private
   */
  private static flattenLinguisticKeys(dictionary: Record<string, unknown>, prefix = ''): string[] {
    return Object.keys(dictionary).reduce((accumulator: string[], key) => {
      const keyPath = prefix ? `${prefix}.${key}` : key;
      const value = dictionary[key];
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        accumulator.push(...this.flattenLinguisticKeys(value as Record<string, unknown>, keyPath));
      } else {
        accumulator.push(keyPath);
      }
      return accumulator;
    }, []);
  }

  /**
   * @method resolveKeyPath
   * @private
   */
  private static resolveKeyPath(obj: any, path: string): unknown {
    return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
  }

  /**
   * @method groupLinguisticAssetsByApparatus
   * @private
   */
  private static groupLinguisticAssetsByApparatus(filePaths: string[]): Record<string, Record<string, string>> {
    const groups: Record<string, Record<string, string>> = {};

    for (const filePath of filePaths) {
      const normalizedPath = filePath.replace(/\\/g, '/');
      const parts = normalizedPath.split('/');
      const i18nIndex = parts.indexOf('i18n');
      
      if (i18nIndex === -1) continue;

      const localeIdentifier = parts[i18nIndex + 1];
      const apparatusKey = parts.slice(0, i18nIndex).join('/');

      if (!groups[apparatusKey]) groups[apparatusKey] = {};
      groups[apparatusKey][localeIdentifier] = filePath;
    }
    return groups;
  }
}