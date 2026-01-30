/** libs/tools/internal-scripts/src/lib/i18n-aggregator.apparatus.ts */

import * as fileSystem from 'node:fs';
import * as path from 'node:path';
import { glob } from 'glob';
import merge from 'lodash/merge';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';

/**
 * @name InternationalizationAggregator
 * @description Aparato de ingeniería de procesos encargado de la compilación de
 * diccionarios lingüísticos soberanos. Escanea el monorepo en busca de silos
 * fragmentados por idioma y propósito para generar el SSOT (Single Source of Truth)
 * de traducciones consumido por el ecosistema.
 *
 * @protocol OEDP-Level: Elite (Recursive Namespace Mapping V2.5)
 */
export class InternationalizationAggregator {
  /**
   * @public
   * Definición de la tríada lingüística autorizada por la arquitectura.
   * Exportada para sincronización con el Guardian de Simetría.
   */
  public static readonly AUTHORIZED_LOCALES = ['es', 'en', 'pt'] as const;

  /**
   * @private
   * Ubicación estratégica de la bóveda de diccionarios unificados (SSOT).
   */
  private static readonly MASTER_STORAGE_PATH = path.resolve(
    process.cwd(),
    'libs/core/security/src/lib/i18n'
  );

  /**
   * @method executeInternationalizationDictionaryAggregation
   * @description Orquesta el ciclo completo de recolección, validación y fusión
   * de fragmentos i18n. Implementa el mapeo automático de namespaces basado en archivos.
   *
   * @returns {Promise<void>}
   */
  public static async executeInternationalizationDictionaryAggregation(): Promise<void> {
    const apparatusName = 'InternationalizationAggregator';
    const operationName = 'executeAggregation';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        OmnisyncTelemetry.verbose(apparatusName, 'process_start', 'Iniciando agregación de ADN lingüístico...');

        for (const sovereignLocaleIdentifier of this.AUTHORIZED_LOCALES) {
          await this.processSovereignLocaleSilos(sovereignLocaleIdentifier);
        }

        OmnisyncTelemetry.verbose(apparatusName, 'process_complete', 'Sincronización global i18n finalizada.');
      }
    );
  }

  /**
   * @method processSovereignLocaleSilos
   * @private
   * @description Localiza y fusiona todos los archivos JSON dentro de las carpetas
   * de idioma de cada aparato en apps/ y libs/.
   *
   * @param {string} localeIdentifier - Identificador ISO del idioma (es, en, pt).
   */
  private static async processSovereignLocaleSilos(localeIdentifier: string): Promise<void> {
    const apparatusName = 'InternationalizationAggregator';
    let masterDictionaryAccumulator: Record<string, unknown> = {};

    /**
     * @section Búsqueda Recursiva Granular
     * Captura archivos en: [base]/i18n/[locale]/[namespace].json
     * Ignora artefactos de build y carpetas internas para optimizar el escaneo.
     */
    const dictionaryFragmentsFound = await glob(`{libs,apps}/**/i18n/${localeIdentifier}/*.json`, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/internal-backups/**']
    });

    for (const dictionaryFragmentPath of dictionaryFragmentsFound) {
      try {
        const absoluteFragmentPath = path.resolve(process.cwd(), dictionaryFragmentPath);
        const namespaceIdentifier = path.basename(absoluteFragmentPath, '.json');

        const fragmentRawContent = fileSystem.readFileSync(absoluteFragmentPath, 'utf-8');
        const fragmentParsedContent = JSON.parse(fragmentRawContent) as Record<string, unknown>;

        /**
         * @note Inyección de Soberanía de Namespace
         * El nombre del archivo actúa como la raíz del objeto para evitar colisiones.
         * Estructura final: { "header": { ... }, "footer": { ... } }
         */
        const namespacedContent = {
          [namespaceIdentifier]: fragmentParsedContent
        };

        masterDictionaryAccumulator = merge(masterDictionaryAccumulator, namespacedContent);

      } catch (criticalParsingError: unknown) {
        // En CI/CD, reportamos pero continuamos para identificar todos los fallos.
        await OmnisyncSentinel.report({
          errorCode: 'OS-CORE-001',
          severity: 'MEDIUM',
          apparatus: apparatusName,
          operation: 'parse_fragment',
          message: `Incapacidad de procesar fragmento i18n: ${dictionaryFragmentPath}`,
          context: { errorTrace: String(criticalParsingError) },
          isRecoverable: true
        });
      }
    }

    this.persistSovereignMasterDictionary(localeIdentifier, masterDictionaryAccumulator);
  }

  /**
   * @method persistSovereignMasterDictionary
   * @private
   * @description Vuelca el diccionario consolidado en la capa core-security.
   * Valida la densidad del resultado para evitar archivos corruptos.
   */
  private static persistSovereignMasterDictionary(
    locale: string,
    finalContent: Record<string, unknown>
  ): void {
    const apparatusName = 'InternationalizationAggregator';
    const finalFilePath = path.join(this.MASTER_STORAGE_PATH, `${locale}.json`);

    // Asegurar existencia del directorio de destino (Bóveda de Seguridad)
    if (!fileSystem.existsSync(this.MASTER_STORAGE_PATH)) {
      fileSystem.mkdirSync(this.MASTER_STORAGE_PATH, { recursive: true });
    }

    // Auditoría de densidad antes de la escritura física
    if (Object.keys(finalContent).length === 0) {
      OmnisyncTelemetry.verbose(apparatusName, 'integrity_warning', `El diccionario [${locale}] está vacío.`);
    }

    fileSystem.writeFileSync(
      finalFilePath,
      JSON.stringify(finalContent, null, 2),
      'utf-8'
    );

    const totalNamespaces = Object.keys(finalContent).length;

    OmnisyncTelemetry.verbose(
      apparatusName,
      'persistence_success',
      `Diccionario [${locale.toUpperCase()}] sincronizado (Namespaces: ${totalNamespaces}).`
    );
  }
}