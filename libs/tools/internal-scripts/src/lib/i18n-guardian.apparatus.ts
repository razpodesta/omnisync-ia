/** libs/tools/internal-scripts/src/lib/i18n-guardian.apparatus.ts */

import * as fileSystem from 'node:fs';
import * as path from 'node:path';
import { glob } from 'glob';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncContracts } from '@omnisync/core-contracts';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';

/** 
 * @section Sincronización de ADN Local 
 * Implementación de esquemas para garantizar reportes de auditoría íntegros.
 */
import { 
  II18nAnomaly, 
  I18nIntegrityReportSchema,
  II18nIntegrityReport
} from './schemas/i18n-guardian.schema';

/**
 * @name I18nSymmetryGuardian
 * @description Aparato de élite encargado de velar por la paridad absoluta 
 * entre los silos lingüísticos del monorepo. Realiza una auditoría biyectiva 
 * comparando archivos físicos y claves JSON internas entre los idiomas de 
 * soberanía (ES, EN, PT), garantizando un deploy libre de textos faltantes.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Linguistic-Symmetry V3.2)
 * @vision Ultra-Holística: Zero-Missing-Translations & Forensic-Audit
 */
export class I18nSymmetryGuardian {
  private static readonly SOVEREIGN_LOCALES = ['es', 'en', 'pt'] as const;
  private static readonly MASTER_LOCALE = 'es';

  /**
   * @method executeSovereignAudit
   * @description Orquesta la inspección profunda de los diccionarios. 
   * Genera un reporte validado por contrato SSOT.
   */
  public static async executeSovereignAudit(): Promise<void> {
    const apparatusName = 'I18nSymmetryGuardian';
    
    return await OmnisyncTelemetry.traceExecution(apparatusName, 'executeSovereignAudit', async () => {
      console.log('\n🛡️  [I18N_GUARDIAN]: Iniciando auditoría forense de paridad estructural...');

      const dictionaryFragmentsFound = await glob(`{libs,apps}/**/i18n/**/*.json`, {
        ignore: ['node_modules/**', 'dist/**', '**/core/security/**']
      });

      const auditAnomalies: II18nAnomaly[] = [];
      const analyzedGroups = this.groupFilesByComponent(dictionaryFragmentsFound);

      for (const [componentPath, locales] of Object.entries(analyzedGroups)) {
        this.auditComponentSilos(componentPath, locales, auditAnomalies);
      }

      /**
       * @section Generación de Semilla de Integridad
       */
      const rawReport: II18nIntegrityReport = {
        reportIdentifier: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        isSymmetric: auditAnomalies.length === 0,
        auditedNamespacesCount: Object.keys(analyzedGroups).length,
        anomalies: auditAnomalies,
        aiContext: {
          summary: `Audit finished for ${Object.keys(analyzedGroups).length} namespaces.`,
          remediationPath: auditAnomalies.length > 0 ? 'FIX_REPORTED_ANOMALIES' : 'NONE'
        }
      };

      // Validación del reporte contra el esquema local
      const validatedReport = OmnisyncContracts.validate(
        I18nIntegrityReportSchema,
        rawReport,
        apparatusName
      );

      this.evaluateFinalIntegrity(validatedReport);
    });
  }

  /**
   * @method auditComponentSilos
   * @private
   */
  private static auditComponentSilos(
    componentBase: string, 
    localesFound: Record<string, string>, 
    anomalies: II18nAnomaly[]
  ): void {
    const namespace = path.basename(Object.values(localesFound)[0], '.json');

    for (const targetLocale of this.SOVEREIGN_LOCALES) {
      if (!localesFound[targetLocale]) {
        console.error(`❌ [SILO_MISSING]: El aparato en [${componentBase}] carece de ADN [${targetLocale.toUpperCase()}].`);
        anomalies.push({ 
          apparatusIdentifier: componentBase,
          targetLocale, 
          namespace,
          severity: 'CRITICAL',
          anomalyType: 'MISSING_FILE',
          technicalDetails: `Falta archivo físico para el local: ${targetLocale}`
        });
        continue;
      }

      if (targetLocale !== this.MASTER_LOCALE && localesFound[this.MASTER_LOCALE]) {
        this.compareJsonKeys(
          localesFound[this.MASTER_LOCALE],
          localesFound[targetLocale],
          targetLocale,
          namespace,
          anomalies
        );
      }
    }
  }

  /**
   * @method compareJsonKeys
   * @private
   */
  private static compareJsonKeys(
    masterPath: string, 
    targetPath: string, 
    locale: string, 
    namespace: string, 
    anomalies: II18nAnomaly[]
  ): void {
    try {
      const masterContent = JSON.parse(fileSystem.readFileSync(masterPath, 'utf-8')) as Record<string, unknown>;
      const targetContent = JSON.parse(fileSystem.readFileSync(targetPath, 'utf-8')) as Record<string, unknown>;

      const masterKeys = this.extractFlatKeys(masterContent);
      const targetKeys = this.extractFlatKeys(targetContent);

      for (const key of masterKeys) {
        if (!targetKeys.includes(key)) {
          console.error(`⚠️  [KEY_MISMATCH]: Llave "${key}" inexistente en [${locale.toUpperCase()}] | Namespace: ${namespace}.`);
          anomalies.push({ 
            apparatusIdentifier: targetPath,
            targetLocale: locale, 
            namespace, 
            severity: 'WARNING',
            anomalyType: 'KEY_MISMATCH',
            technicalDetails: `La clave de ADN [${key}] presente en Master ('es') no existe en este local.`
          });
        }
      }
    } catch (parsingError: unknown) {
      /**
       * RESOLUCIÓN LINT: Consumimos el error para aportar valor forense al reporte.
       */
      const errorString = String(parsingError);
      
      anomalies.push({ 
        apparatusIdentifier: targetPath,
        targetLocale: locale, 
        namespace, 
        severity: 'CRITICAL',
        anomalyType: 'INVALID_JSON',
        technicalDetails: `Error de parseo estructural: ${errorString}`
      });

      OmnisyncSentinel.report({
        errorCode: 'OS-CORE-001',
        severity: 'MEDIUM',
        apparatus: 'I18nSymmetryGuardian',
        operation: 'compareKeys',
        message: 'JSON_CORRUPTION_DETECTED',
        context: { path: targetPath, error: errorString }
      });
    }
  }

  /**
   * @method extractFlatKeys
   * @private
   */
  private static extractFlatKeys(obj: Record<string, unknown>, prefix = ''): string[] {
    return Object.keys(obj).reduce((keys: string[], k) => {
      const name = prefix ? `${prefix}.${k}` : k;
      const value = obj[k];
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys.push(...this.extractFlatKeys(value as Record<string, unknown>, name));
      } else {
        keys.push(name);
      }
      return keys;
    }, []);
  }

  /**
   * @method groupFilesByComponent
   * @private
   */
  private static groupFilesByComponent(files: string[]): Record<string, Record<string, string>> {
    const groups: Record<string, Record<string, string>> = {};

    for (const file of files) {
      const parts = file.split(/[\\/]/);
      const localeIndex = parts.indexOf('i18n') + 1;
      const locale = parts[localeIndex];
      const componentKey = parts.slice(0, localeIndex - 1).join('/');

      if (!groups[componentKey]) groups[componentKey] = {};
      groups[componentKey][locale] = file;
    }
    return groups;
  }

  /**
   * @method evaluateFinalIntegrity
   * @private
   */
  private static evaluateFinalIntegrity(report: II18nIntegrityReport): void {
    if (!report.isSymmetric) {
      console.log(`\n❌ [AUDITORÍA_FALLIDA]: Se detectaron ${report.anomalies.length} violaciones de simetría en ${report.auditedNamespacesCount} aparatos.`);
      process.exit(1);
    }
    console.log(`\n✅ [SIMETRÍA_DE_ÉLITE]: ${report.auditedNamespacesCount} aparatos validados con paridad de ADN 1:1.\n`);
  }
}