/** libs/tools/internal-scripts/src/lib/run-i18n-build.ts */

import { I18nAggregator } from './i18n-aggregator.apparatus';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @name runI18nBuild
 * @description Punto de entrada para la agregación de diccionarios en tiempo de compilación.
 */
async function runI18nBuild() {
  try {
    console.log('--- 🌐 OMNISYNC I18N AGGREGATOR START ---');
    await I18nAggregator.buildMasterDictionaries();
    console.log('--- ✅ I18N SYNC COMPLETE ---');
  } catch (error) {
    console.error('--- ❌ I18N SYNC FAILED ---', error);
    process.exit(1);
  }
}

runI18nBuild();