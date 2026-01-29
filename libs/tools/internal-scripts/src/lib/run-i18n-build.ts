/** libs/tools/internal-scripts/src/lib/run-i18n-build.ts */

import { InternationalizationAggregator } from './i18n-aggregator.apparatus';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @name runInternationalizationBuild
 * @description Punto de entrada soberano para la agregación de diccionarios JSON.
 * Garantiza que todos los fragmentos i18n del monorepo se unifiquen en el SSOT de seguridad.
 */
async function runInternationalizationBuild(): Promise<void> {
  const processStartTime = performance.now();

  try {
    console.log('--- 🌐 OMNISYNC I18N: AGGREGATION ENGINE START ---');

    await InternationalizationAggregator.executeInternationalizationDictionaryAggregation();

    const duration = (performance.now() - processStartTime).toFixed(2);

    // CORRECCIÓN LINT: Uso proactivo de Telemetry para registrar el éxito del build
    OmnisyncTelemetry.verbose(
      'I18nRunner',
      'build_success',
      `Aggregation completed in ${duration}ms`,
    );

    console.log(`--- ✅ I18N SYNC COMPLETE [${duration}ms] ---`);
    process.exit(0);
  } catch (criticalError: unknown) {
    console.error(
      '--- ❌ I18N AGGREGATION CRITICAL FAILURE ---',
      criticalError,
    );
    process.exit(1);
  }
}

// Ejecución inmediata controlada
runInternationalizationBuild();
