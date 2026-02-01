/** libs/tools/internal-scripts/src/lib/run-guardian.ts */

import * as fileSystem from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { I18nSymmetryGuardian } from './i18n-guardian.apparatus';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';

/**
 * @name SovereignIntegrityIgniter
 * @description Orquestador de ignición para la auditoría de simetría lingüística.
 * Gestiona el ciclo de vida de la ejecución del Guardián, capturando métricas de
 * performance, persistiendo resultados forenses y bloqueando la tubería de
 * CI/CD ante discrepancias de ADN en los diccionarios.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Full-Forensic-Ignition V4.0)
 * @vision Ultra-Holística: Zero-Discrepancy & Persistent-Audit-Trail
 */
class SovereignIntegrityIgniter {
  private static readonly REPORT_OUTPUT_DIRECTORY = path.resolve(
    process.cwd(),
    'reports/infrastructure/i18n'
  );

  /**
   * @method ignite
   * @description Punto de entrada principal para el proceso de auditoría.
   */
  public static async ignite(): Promise<void> {
    const apparatusName = 'SovereignIntegrityIgniter';
    const operationName = 'executeGlobalAudit';
    const processStartTimeMilliseconds = performance.now();
    const auditUniqueIdentifier = crypto.randomUUID();

    console.log('\n--- 🛡️  OMNISYNC: I18N SYMMETRY GUARDIAN PULSE START ---');
    console.log(`[TRACE_ID]: ${auditUniqueIdentifier}`);

    try {
      /**
       * @section Fase 1: Ejecución del Escaneo Biyectivo
       * Delegamos la lógica de comparación de ADN al aparato especialista.
       */
      await I18nSymmetryGuardian.executeSovereignAudit();

      const executionDurationSeconds = (
        (performance.now() - processStartTimeMilliseconds) / 1000
      ).toFixed(3);

      /**
       * @section Fase 2: Consolidación de Telemetría
       */
      OmnisyncTelemetry.verbose(
        apparatusName,
        operationName,
        'Linguistic symmetry verified successfully across all apparatuses.',
        {
          duration: `${executionDurationSeconds}s`,
          reportId: auditUniqueIdentifier,
          environment: process.env['NODE_ENV'] || 'development'
        }
      );

      // Persistencia del rastro de éxito para el CloudHealthAuditor
      this.persistAuditSeed(auditUniqueIdentifier, 'SUCCESS', executionDurationSeconds);

      console.log(`\n✅ [SIMETRÍA_DE_ÉLITE]: El ADN lingüístico es íntegro.`);
      console.log(`[LATENCIA_AUDITORÍA]: ${executionDurationSeconds}s\n`);

      process.exit(0);

    } catch (criticalAuditAnomaly: unknown) {
      /**
       * @section Fase 3: Gestión de Desastres y Reporte Sentinel
       * No permitimos que un fallo de simetría pase desapercibido por el Sentinel.
       */
      const errorDescription = String(criticalAuditAnomaly);

      await OmnisyncSentinel.report({
        errorCode: 'OS-CORE-001',
        severity: 'CRITICAL',
        apparatus: apparatusName,
        operation: operationName,
        message: 'Discrepancia detectada en la simetría de diccionarios i18n.',
        context: {
          errorTrace: errorDescription,
          auditId: auditUniqueIdentifier
        },
        isRecoverable: false
      });

      this.persistAuditSeed(auditUniqueIdentifier, 'CRITICAL_FAILURE', '0', errorDescription);

      console.error('\n--- 🚨 OMNISYNC: LINGUISTIC INTEGRITY BREACH DETECTED ---');
      console.error(`[CAUSE]: ${errorDescription}`);
      console.error(`[ACTION]: Verify missing keys in Portuguese or English silos.\n`);

      process.exit(1);
    }
  }

  /**
   * @method persistAuditSeed
   * @private
   * @description Vuelca la semilla del resultado en disco para auditoría histórica.
   */
  private static persistAuditSeed(
    id: string,
    status: string,
    latency: string,
    details?: string
  ): void {
    try {
      if (!fileSystem.existsSync(this.REPORT_OUTPUT_DIRECTORY)) {
        fileSystem.mkdirSync(this.REPORT_OUTPUT_DIRECTORY, { recursive: true });
      }

      const reportFileName = `${new Date().toISOString().replace(/[:.]/g, '-')}-i18n-audit.json`;
      const reportPayload = {
        reportId: id,
        timestamp: new Date().toISOString(),
        operationalStatus: status,
        auditLatencySeconds: latency,
        forensicDetails: details || 'Integrity check passed without anomalies.',
        engineVersion: 'OEDP-V4.0-ELITE'
      };

      fileSystem.writeFileSync(
        path.join(this.REPORT_OUTPUT_DIRECTORY, reportFileName),
        JSON.stringify(reportPayload, null, 2),
        'utf-8'
      );
    } catch (ioError) {
      console.error('[INTERNAL-ERROR]: Incapacidad de persistir semilla de auditoría.', ioError);
    }
  }
}

// Ejecución del Nodo de Ignición
SovereignIntegrityIgniter.ignite();