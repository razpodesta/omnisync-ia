/** libs/tools/internal-scripts/src/lib/i18n-aggregator.apparatus.ts */

import * as fs from 'node:fs';
import { glob } from 'glob';
import { merge } from 'lodash'; // Se requiere instalar lodash para merge profundo

/**
 * @name I18nAggregator
 * @description Compila fragmentos JSON distribuidos en un Diccionario Global SSOT.
 */
export class I18nAggregator {
  private static readonly LOCALES = ['es', 'en', 'pt'];
  private static readonly OUTPUT_PATH = 'libs/core/security/src/lib/i18n';

  /**
   * @method buildMasterDictionaries
   * @description Ejecuta el ciclo de agregación para todos los idiomas soportados.
   */
  public static async buildMasterDictionaries(): Promise<void> {
    for (const locale of this.LOCALES) {
      const fragments = await glob(`libs/**/i18n/${locale}.json`);
      let masterDictionary = {};

      for (const fragmentPath of fragments) {
        const content = JSON.parse(fs.readFileSync(fragmentPath, 'utf-8'));
        // Fusionamos recursivamente el fragmento en el diccionario maestro
        masterDictionary = merge(masterDictionary, content);
      }

      // Guardamos el resultado en el punto de verdad central
      const finalPath = `${this.OUTPUT_PATH}/${locale}.json`;
      fs.writeFileSync(finalPath, JSON.stringify(masterDictionary, null, 2));
      
      console.log(`[i18n] Diccionario Maestro [${locale}] sincronizado con ${fragments.length} fragmentos.`);
    }
  }
}