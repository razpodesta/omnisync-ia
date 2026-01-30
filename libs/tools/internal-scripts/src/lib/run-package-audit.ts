/** libs/tools/internal-scripts/src/lib/run-package-audit.ts */

import { OmnisyncSovereignPackageAuditor } from './package-auditor.apparatus';
import { IPackageFinding } from './schemas/package-auditor.schema';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @name ignitePackageAuditor
 * @description Punto de ignición para la auditoría de simetría de manifiestos.
 * Orquesta la ejecución del OSPA y formatea la salida para consumo humano e IA.
 * 
 * @protocol OEDP-Level: Elite (Clean-Execution V3.0)
 */
async function ignitePackageAuditor(): Promise<void> {
  const apparatusName = 'PackageAuditorRunner';

  try {
    console.log('\n--- 🛡️  OMNISYNC: SOVEREIGN PACKAGE AUDITOR START ---');
    
    const report = await OmnisyncSovereignPackageAuditor.executeSovereignAudit();
    
    if (report.statistics.integrityPercentage < 100) {
      console.warn(`\n⚠️  [BREACH_DETECTED]: Integridad del ${report.statistics.integrityPercentage}%`);
      
      /**
       * @section Reporte de Anomalías (Typed Output)
       * RESOLUCIÓN TS7006: Se tipa explícitamente el parámetro 'finding' para erradicar el 'any'.
       */
      const breachTable = report.findings
        .filter((finding: IPackageFinding) => !finding.isSovereign)
        .map((finding: IPackageFinding) => ({
          Package: finding.declaredName,
          Anomalies: finding.anomalies.length,
          Primary_Issue: finding.anomalies[0]?.type ?? 'UNKNOWN',
          Remediation: finding.anomalies[0]?.remediation ?? 'N/A'
        }));

      console.table(breachTable);
    } else {
      console.log('\n✅ [SIMETRÍA_TOTAL]: Todos los manifiestos están perfectamente alineados.\n');
    }

    OmnisyncTelemetry.verbose(apparatusName, 'audit_finished', `Integridad: ${report.statistics.integrityPercentage}%`);
    
    // Finalización exitosa del proceso de Node
    process.exit(0);
  } catch (criticalFailure: unknown) {
    console.error('\n--- ❌ CRITICAL AUDIT FAILURE ---');
    console.error(String(criticalFailure));
    
    process.exit(1);
  }
}

// Ejecución controlada
ignitePackageAuditor();