/** libs/tools/internal-scripts/src/lib/run-guardian.ts */

import { I18nSymmetryGuardian } from './i18n-guardian.apparatus';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @name igniteSovereignGuardian
 * @description Punto de ignición para la auditoría de integridad estructural.
 * Bloquea la cadena de ejecución ante cualquier inconsistencia de ADN.
 */
async function igniteSovereignGuardian(): Promise<void> {
  const processStartTime = performance.now();

  try {
    await I18nSymmetryGuardian.executeSovereignAudit();
    
    const duration = (performance.now() - processStartTime).toFixed(2);
    OmnisyncTelemetry.verbose('GuardianRunner', 'success', `Symmetry verified in ${duration}ms`);
    
    process.exit(0);
  } catch (criticalFailure: unknown) {
    console.error('--- 🚨 GUARDIAN CRITICAL ANOMALY ---', criticalFailure);
    process.exit(1);
  }
}

igniteSovereignGuardian();