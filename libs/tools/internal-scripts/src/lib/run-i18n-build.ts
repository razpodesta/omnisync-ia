/** libs/tools/internal-scripts/src/lib/run-i18n-build.ts */

import { InternationalizationAggregator } from './i18n-aggregator.apparatus';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';

/**
 * @name runInternationalizationBuild
 * @description Punto de ignición soberano para la agregación de ADN lingüístico.
 * Orquesta la fusión de fragmentos JSON distribuidos en el monorepo hacia la 
 * bóveda de seguridad core, garantizando que el build de producción posea 
 * diccionarios íntegros y sincronizados.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (ESM-Native-Ignition V3.6.6)
 * @vision Ultra-Holística: Zero-Loader-Dependency & Forensic-Triage
 */
async function runInternationalizationBuild(): Promise<void> {
  const apparatusName = 'I18nBuildRunner';
  const operationName = 'executeBuild';
  const executionStartTime = performance.now();

  console.log('\n--- 🌐 OMNISYNC I18N: AGGREGATION ENGINE START ---');

  try {
    /**
     * @section Fase 1: Registro de Intención
     * Notificamos al sistema de telemetría el inicio de la hidratación de ADN.
     */
    OmnisyncTelemetry.verbose(apparatusName, operationName, 'Iniciando compilación de diccionarios soberanos...');

    /**
     * @section Fase 2: Ejecución del Agregador
     * El aparato especialista realiza el escaneo recursivo y la fusión de namespaces.
     */
    await InternationalizationAggregator.executeInternationalizationDictionaryAggregation();

    const durationInMilliseconds = (performance.now() - executionStartTime).toFixed(2);

    /**
     * @section Fase 3: Consolidación y Telemetría
     * Sellamos el éxito del build inyectando la métrica de performance.
     */
    OmnisyncTelemetry.verbose(apparatusName, 'build_success', `ADN Lingüístico sincronizado exitosamente.`, {
      latency: `${durationInMilliseconds}ms`,
      engine: 'tsx/esm',
      version: 'OEDP-V3.6.6'
    });

    console.log(`--- ✅ I18N SYNC COMPLETE [${durationInMilliseconds}ms] --- \n`);
    
    /**
     * @note Terminación Limpia
     * Informamos al SO del éxito de la tarea para continuar la cadena de despliegue.
     */
    process.exit(0);

  } catch (criticalAggregationError: unknown) {
    /**
     * @section Gestión de Desastres (Sentinel Bridge)
     * Ante un colapso (JSON corrupto, permisos de disco), el Sentinel reporta
     * la anomalía con severidad HIGH para bloquear el deploy.
     */
    const errorTrace = String(criticalAggregationError);
    
    await OmnisyncSentinel.report({
      errorCode: 'OS-CORE-001',
      severity: 'HIGH',
      apparatus: apparatusName,
      operation: operationName,
      message: 'Fallo crítico en la agregación de fragmentos i18n.',
      context: { errorTrace },
      isRecoverable: false
    });

    console.error('\n--- ❌ I18N AGGREGATION CRITICAL FAILURE ---');
    console.error(errorTrace);
    
    process.exit(1);
  }
}

/**
 * @section Ignición Inmediata
 * Ejecución controlada con captura de excepciones no controladas del kernel.
 */
runInternationalizationBuild().catch((kernelError) => {
  console.error('[KERNEL-FAILURE]: Error no controlado en el runner i18n.', kernelError);
  process.exit(1);
});