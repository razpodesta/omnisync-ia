/** libs/tools/internal-scripts/src/lib/i18n-aggregator.apparatus.ts */

import * as fileSystem from 'node:fs';
import * as path from 'node:path';
import { glob } from 'glob';
import { merge } from 'lodash';
/**
 * @note Tras ejecutar 'pnpm add -D @types/lodash', el error 7016 desaparece,
 * permitiendo que 'merge' posea firmas de tipo completas para el análisis de IA.
 */

export class InternationalizationAggregator {
  private static readonly SUPPORTED_LOCALES = ['es', 'en', 'pt'];
  private static readonly MASTER_OUTPUT_DIRECTORY = 'libs/core/security/src/lib/i18n';

  public static async executeInternationalizationDictionaryAggregation(): Promise<void> {
    console.log('--- 🌐 OMNISYNC INTERNATIONALIZATION: AGGREGATION START ---');

    for (const localeIdentifier of this.SUPPORTED_LOCALES) {
      const dictionaryFragmentsFound = await glob(`libs/**/i18n/${localeIdentifier}.json`, {
        ignore: 'node_modules/**'
      });

      let masterDictionaryAccumulator: Record<string, unknown> = {};

      for (const fragmentPath of dictionaryFragmentsFound) {
        try {
          const fragmentRawContent = fileSystem.readFileSync(fragmentPath, 'utf-8');
          const fragmentParsedContent = JSON.parse(fragmentRawContent) as Record<string, unknown>;

          // La función merge ahora está tipada correctamente
          masterDictionaryAccumulator = merge(masterDictionaryAccumulator, fragmentParsedContent);
        } catch (parsingError: unknown) {
          console.error(`[AGGREGATOR_ERROR] Error en fragmento: ${fragmentPath}`, parsingError);
        }
      }

      this.persistMasterDictionary(localeIdentifier, masterDictionaryAccumulator);
    }
  }

  private static persistMasterDictionary(
    localeIdentifier: string,
    content: Record<string, unknown>
  ): void {
    const finalDictionaryPath = path.join(this.MASTER_OUTPUT_DIRECTORY, `${localeIdentifier}.json`);

    if (!fileSystem.existsSync(this.MASTER_OUTPUT_DIRECTORY)) {
      fileSystem.mkdirSync(this.MASTER_OUTPUT_DIRECTORY, { recursive: true });
    }

    fileSystem.writeFileSync(finalDictionaryPath, JSON.stringify(content, null, 2), 'utf-8');
    console.log(`[i18n] Diccionario [${localeIdentifier.toUpperCase()}] sincronizado.`);
  }
}
