/** apps/admin-dashboard/src/components/sections/health-monitor.apparatus.tsx */

'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncContracts } from '@omnisync/core-contracts';
import { useSystemPulse } from '../../hooks/use-system-pulse';
import { 
  HealthMonitorConfigurationSchema, 
  IHealthMonitorConfiguration 
} from './schemas/health-monitor.schema';

/**
 * @name HealthMonitorApparatus
 * @description Interfaz de observabilidad de alta gama para la infraestructura Cloud.
 * Consume el hook useSystemPulse para visualizar la salud de los 5 pilares 
 * aplicando el estándar Obsidian & Milk. Optimizado para bajo consumo de red.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Visual-Pulse-Triage V4.0)
 * @vision Ultra-Holística: Zero-Waste-UI & Forensic-Infrastructure-View
 */
export const HealthMonitor: React.FC<IHealthMonitorConfiguration> = (properties) => {
  const translations = useTranslations('health-monitor');

  // 1. Hidratación y Validación de ADN de Interfaz
  const configuration = useMemo(() => {
    return OmnisyncContracts.validate(
      HealthMonitorConfigurationSchema, 
      properties, 
      'HealthMonitorApparatus'
    );
  }, [properties]);

  // 2. Orquestación de Lógica de Salud Eficiente
  const { 
    latestReport, 
    isProcessing, 
    requestManualPulse, 
    isStale,
    lastExecutionTimestamp 
  } = useSystemPulse(configuration.tenantId);

  // Cálculo de segundos desde la última sincronización
  const secondsSinceSync = Math.floor((Date.now() - lastExecutionTimestamp) / 1000);

  return OmnisyncTelemetry.traceExecutionSync('HealthMonitor', 'render', () => (
    <section className="space-y-12 border border-border p-10 bg-background relative overflow-hidden">
      
      {/* Header: Diagnóstico y Control de Frescura */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-border pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.6em] opacity-30">
              Infrastructure_Pulse // {latestReport?.executionEnvironment || 'PENDING'}
            </span>
            {isProcessing && (
              <motion.div 
                animate={{ opacity: [0.2, 1, 0.2] }} 
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-foreground rounded-full"
              />
            )}
          </div>
          <h2 className="text-4xl font-light tracking-tighter italic">
            {translations('header.title')} <span className="font-black not-italic">360°.</span>
          </h2>
        </div>

        <div className="flex flex-col items-end gap-4">
          <div className="flex items-center gap-4 text-[9px] font-mono uppercase tracking-widest">
            <span className={isStale ? 'text-red-500 font-bold' : 'opacity-40'}>
              {isStale ? translations('header.stale_warning') : translations('header.freshness', { time: secondsSinceSync })}
            </span>
            <div className="w-24 h-[2px] bg-border relative overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-foreground"
                initial={{ width: "100%" }}
                animate={{ width: isProcessing ? "100%" : "0%" }}
                transition={{ duration: isProcessing ? 0.5 : 300, ease: "linear" }}
              />
            </div>
          </div>
          
          <button
            onClick={() => requestManualPulse()}
            disabled={isProcessing}
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] border-b-2 border-foreground pb-1 disabled:opacity-20 transition-all hover:gap-6"
          >
            {isProcessing ? translations('actions.processing') : translations('actions.force_audit')}
            <span>→</span>
          </button>
        </div>
      </header>

      {/* Grid de 5 Pilares: Triage Visual */}
      <main className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {latestReport ? (
          Object.entries(latestReport.infrastructureComponents).map(([key, pillar]) => (
            <motion.div 
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border p-6 space-y-6 group hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
            >
              <div className="flex justify-between items-start">
                <span className="text-[8px] font-black opacity-20 uppercase tracking-widest font-mono">
                  {pillar.pillar}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  pillar.operationalStatus === 'HEALTHY' ? 'bg-green-500' : 
                  pillar.operationalStatus === 'DEGRADED' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-tighter">
                  {translations(`pillars.${pillar.pillar}`)}
                </p>
                <p className="text-[9px] opacity-50 italic">
                  {translations(`status.${pillar.operationalStatus}`)}
                </p>
              </div>

              <div className="pt-4 border-t border-border/50 flex justify-between items-center font-mono">
                <span className="text-[9px] opacity-30">LATENCY</span>
                <span className="text-[10px] font-bold">{pillar.responseTimeInMilliseconds}ms</span>
              </div>
            </motion.div>
          ))
        ) : (
          // Skeleton Loader (Estado Inicial)
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border border-border p-6 h-32 animate-pulse bg-neutral-50/50 dark:bg-neutral-900/50" />
          ))
        )}
      </main>

      {/* Footer Forense: Trazabilidad Distribuida */}
      <AnimatePresence>
        {configuration.isForensicViewEnabled && latestReport && (
          <motion.footer 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            className="flex justify-between items-center text-[7px] font-mono uppercase tracking-[0.4em] pt-8 border-t border-border/30"
          >
            <span>Trace_ID: {latestReport.traceIdentifier}</span>
            <span>Engine_Version: {latestReport.engineVersion}</span>
            <span>Node_Identity: {latestReport.reportIdentifier.substring(0, 8)}</span>
          </motion.footer>
        )}
      </AnimatePresence>
    </section>
  ));
};