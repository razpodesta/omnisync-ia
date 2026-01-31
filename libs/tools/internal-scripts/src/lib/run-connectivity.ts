/** libs/tools/internal-scripts/src/lib/run-connectivity.ts */

import { ConnectivityIntegrity } from './connectivity-integrity.apparatus';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @name runConnectivityAudit
 * @description Punto de ignición soberano para la validación física de la infraestructura Cloud.
 * Orquesta la ejecución de sondas de red contra los pilares de datos (SQL, Redis, Vector)
 * y emite un reporte de integridad inmutable validado por el protocolo OEDP.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Infrastructure-Pulse-Ignition V3.2.5)
 * @vision Ultra-Holística: Zero-Unused-Vars & Traceable-Handshakes
 */
async function runConnectivityAudit(): Promise<void> {
  const apparatusName = 'ConnectivityRunner';
  const operationName = 'runConnectivityAudit';

  console.log('\n--- 🛰️  OMNISYNC: CLOUD CONNECTIVITY PULSE START ---');
  
  /**
   * @section Registro de Telemetría de Ignición
   * RESOLUCIÓN LINT: Integramos 'operationName' para sanar la inconsistencia de ADN.
   */
  OmnisyncTelemetry.verbose(
    apparatusName, 
    operationName, 
    'tools.infrastructure.pulse.ignition'
  );

  try {
    // 1. Ejecución del Aparato de Integridad (Sovereign Audit)
    const report = await ConnectivityIntegrity.executeSovereignAudit();
    
    // 2. Registro de Resultados en Telemetría Sistémica
    OmnisyncTelemetry.verbose(
      apparatusName, 
      operationName, 
      'tools.infrastructure.pulse.complete', 
      {
        reportId: report.reportId,
        environment: report.environment,
        overallStatus: report.overallStatus
      }
    );

    // 3. Visualización para el Ingeniero (CLI Feedback Obsidian & Milk)
    console.log(`\nESTADO GLOBAL: [${report.overallStatus}]`);
    console.table(Object.entries(report.nodes).map(([key, val]) => ({
      Nodo: key,
      Status: val.status,
      Latencia: `${val.latencyInMilliseconds ?? 'N/A'}ms`,
      Provider: val.provider
    })));

    console.log(`\n--- ✅ REPORTE GENERADO: ${report.reportId} ---\n`);

    /**
     * @note Terminación del Proceso
     * Si el estado es FAILING, salimos con código 1 para bloquear pipelines de CI/CD.
     */
    process.exit(report.overallStatus === 'FAILING' ? 1 : 0);

  } catch (criticalFailure: unknown) {
    const errorMessage = String(criticalFailure);

    /**
     * @section Gestión de Desastres
     * Reportamos el colapso al motor de telemetría inyectando el nombre de la operación.
     */
    OmnisyncTelemetry.verbose(
      apparatusName, 
      operationName, 
      'tools.infrastructure.pulse.critical_failure',
      { errorTrace: errorMessage }
    );

    console.error('\n❌ CRITICAL_CONNECTIVITY_COLAPSE:', errorMessage);
    process.exit(1);
  }
}

// Ignición de Auditoría de Infraestructura
runConnectivityAudit();