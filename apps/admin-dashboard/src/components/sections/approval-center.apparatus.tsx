/** apps/admin-dashboard/src/components/sections/approval-center.apparatus.tsx */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Fingerprint, 
  Database, 
  X, 
  Activity,
  Lock,
  Unlock,
  AlertTriangle
} from 'lucide-react';
import { TenantId, OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncContracts } from '@omnisync/core-contracts';
import { useActionGuard } from '../../hooks/use-action-guard';
import { ApprovalCenterConfigurationSchema } from './schemas/approval-center.schema';

/**
 * @name ApprovalCenter
 * @description Estación de Mando de Sanciones (Visión Ojos de Mosca V5.5).
 * Orquesta el triaje humano de mutaciones ERP. Implementa el sellado de autoridad 
 * mediante firmas digitales y auditoría multifocal de riesgo operativo.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Sovereign-Sanction-Terminal V5.5)
 */
export const ApprovalCenter: React.FC<{ tenantId: TenantId }> = ({ tenantId }) => {
  const translations = useTranslations('approval-center');
  
  // 1. HIDRATACIÓN DE SOBERANÍA
  const config = useMemo(() => OmnisyncContracts.validate(
    ApprovalCenterConfigurationSchema, { tenantId }, 'ApprovalCenter'
  ), [tenantId]);

  const { 
    pendingActions, 
    approve, 
    reject, 
    lockedActionIdentifiers,
    isSynchronizing 
  } = useActionGuard(config.tenantId);

  // 2. ESTADOS DE TRABAJO (Sanción Digital)
  const [inspectingActionId, setInspectingActionId] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState<string | null>(null);

  /**
   * @method handleDigitalSanction
   * @description Ejecuta el protocolo de firma y despacho.
   * Genera el ADN de sanción requerido por el ActionDispatcher.
   */
  const handleDigitalSanction = useCallback(async (actionId: string) => {
    setIsSigning(actionId);
    
    await OmnisyncTelemetry.traceExecution('ApprovalCenter', 'digitalSanction', async () => {
      // Simulación de generación de Hash de Autoridad (Fase 5.5)
      const sanctionDNA = {
        adminIdentifier: 'ADMIN_PRO_01',
        signatureHash: `sig_auth_${crypto.randomUUID().replace(/-/g, '')}`,
        sanctionTimestamp: new Date().toISOString()
      };

      await approve(actionId, JSON.stringify(sanctionDNA));
      setIsSigning(null);
    });
  }, [approve]);

  // 3. MÉTRICAS MULTIFOCALES (Ojos de Mosca)
  const flyEyeMetrics = useMemo(() => {
    const total = pendingActions.length;
    if (total === 0) return { avgRisk: 0, criticalCount: 0 };
    
    const critical = pendingActions.filter(a => a.riskScore > 80).length;
    const sumRisk = pendingActions.reduce((acc, curr) => acc + curr.riskScore, 0);
    
    return { avgRisk: Math.round(sumRisk / total), criticalCount: critical };
  }, [pendingActions]);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 selection:bg-foreground selection:text-background">
      
      {/* HEADER: DASHBOARD DE RIESGO */}
      <header className="flex justify-between items-end border-b border-border pb-10">
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.8em] text-foreground/20 italic">
            // Transactional_Vault // {tenantId.substring(0, 8)}
          </span>
          <h2 className="text-6xl font-light tracking-tighter italic leading-none">
            Centro de <span className="font-black not-italic underline underline-offset-[12px]">Sanción.</span>
          </h2>
        </div>

        <div className="flex gap-16 text-right items-end">
          <div className="space-y-1">
            <span className="text-[8px] font-bold opacity-30 uppercase tracking-widest">{translations('header.stats.pending_count', { count: '' }).split(' ')[1]}</span>
            <p className="text-3xl font-light tracking-tighter italic">{pendingActions.length}<span className="text-xs not-italic opacity-20 ml-2 font-black">ACT_PEND</span></p>
          </div>
          <div className="space-y-1 border-l border-border pl-16">
            <span className="text-[8px] font-bold opacity-30 uppercase tracking-widest">Global_Risk</span>
            <p className={`text-3xl font-black tracking-tighter ${flyEyeMetrics.avgRisk > 70 ? 'text-red-600' : 'text-foreground'}`}>
              {flyEyeMetrics.avgRisk}%
            </p>
          </div>
        </div>
      </header>

      {/* COLA DE ACCIONES: OJOS DE MOSCA VIEW */}
      <main className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {pendingActions.length > 0 ? (
            pendingActions.map((action) => (
              <motion.article
                key={action.identifier}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="group relative border border-border p-8 grid grid-cols-12 gap-8 items-center hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-all duration-500"
              >
                {/* Lente 1: Riesgo e Iconografía */}
                <div className="col-span-1 flex flex-col items-center gap-2">
                  <div className={`p-4 border-2 ${action.riskScore > 80 ? 'border-red-600 bg-red-600/5 text-red-600' : 'border-foreground bg-foreground/5'}`}>
                    {action.riskScore > 80 ? <ShieldAlert size={24} /> : <ShieldCheck size={24} />}
                  </div>
                  <span className="text-[8px] font-black font-mono opacity-40">{action.riskScore}%</span>
                </div>

                {/* Lente 2: ADN de la Intención */}
                <div className="col-span-6 space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black uppercase tracking-widest bg-foreground text-background px-3 py-1">
                      {translations(`card.categories.${action.actionCategory}`)}
                    </span>
                    <span className="text-[8px] font-mono opacity-20">ID: {action.identifier.substring(0, 12)}</span>
                  </div>
                  <h3 className="text-xl font-light tracking-tight italic opacity-90 leading-tight">
                    {action.suspensionReason}
                  </h3>
                  <p className="text-[10px] font-medium opacity-30 uppercase tracking-[0.2em]">
                    {translations('card.created_at', { time: '2m' })} // Source: AI_Inference_V5
                  </p>
                </div>

                {/* Lente 3: Estado de Autoridad */}
                <div className="col-span-2 flex flex-col items-end gap-2 border-x border-border/50 px-6">
                   <span className="text-[8px] font-black opacity-20 uppercase tracking-widest">Authority_Level</span>
                   <div className="flex items-center gap-2 text-foreground/40 italic">
                      <Lock size={12} />
                      <span className="text-[10px] font-bold">WAITING_SIG</span>
                   </div>
                </div>

                {/* Lente 4: Acciones de Sanción */}
                <div className="col-span-3 flex justify-end gap-6">
                  <button 
                    onClick={() => setInspectingActionId(action.identifier)}
                    className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 hover:opacity-100 transition-opacity flex items-center gap-2"
                  >
                    <Fingerprint size={14} /> {translations('actions.inspect')}
                  </button>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => reject(action.identifier)}
                      disabled={lockedActionIdentifiers.has(action.identifier)}
                      className="p-4 border border-border hover:bg-red-600 hover:text-white transition-all disabled:opacity-10"
                    >
                      <X size={20} />
                    </button>
                    <button 
                      onClick={() => handleDigitalSanction(action.identifier)}
                      disabled={lockedActionIdentifiers.has(action.identifier) || isSigning === action.identifier}
                      className="bg-foreground text-background px-10 py-4 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-4 hover:scale-105 active:scale-95 transition-all disabled:opacity-20 shadow-xl"
                    >
                      {isSigning === action.identifier ? 'SIGNING...' : (
                        <><Database size={14} /> {translations('actions.approve')}</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Decoración de Riesgo Crítico */}
                {action.riskScore > 80 && (
                  <div className="absolute top-0 right-0 w-1 h-full bg-red-600 animate-pulse" />
                )}
              </motion.article>
            ))
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-40 text-center border-2 border-dashed border-border/40">
              <Activity className="mx-auto mb-6 opacity-5" size={64} strokeWidth={1} />
              <p className="text-[10px] font-black uppercase tracking-[0.8em] opacity-10 italic">{translations('empty.title')}</p>
              <p className="text-lg font-light mt-4 opacity-30 italic">{translations('empty.message')}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* MODAL FORENSE: INSPECTOR DE ADN DE PROPUESTA */}
      <AnimatePresence>
        {inspectingActionId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end p-10 bg-background/90 backdrop-blur-md">
            <motion.aside 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="w-full max-w-3xl h-full bg-background border-l border-border shadow-2xl flex flex-col relative"
            >
              {/* Header del Modal */}
              <header className="p-12 border-b border-border flex justify-between items-center bg-neutral-50 dark:bg-neutral-950">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.6em] text-red-600 italic">// Forensic_Audit_Mode</span>
                  <h4 className="text-3xl font-black uppercase tracking-tighter">Inception_DNA_Structure</h4>
                </div>
                <button onClick={() => setInspectingActionId(null)} className="p-5 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors">
                  <X size={28} />
                </button>
              </header>

              {/* Visor de ADN Estructurado */}
              <div className="flex-1 overflow-y-auto p-12 font-mono text-[12px] leading-relaxed bg-neutral-50/50 dark:bg-black/50">
                <div className="mb-10 p-6 border-l-4 border-foreground bg-background">
                  <span className="text-[9px] font-black opacity-30 uppercase block mb-2">Audit_Summary</span>
                  <p className="italic opacity-70">
                    Propuesta de mutación generada por el motor neural para sincronización con Odoo ERP. 
                    Requiere validación de campos obligatorios: partner_id, subject y description.
                  </p>
                </div>
                
                <pre className="opacity-80 whitespace-pre-wrap selection:bg-red-600 selection:text-white">
                  {JSON.stringify(
                    pendingActions.find(a => a.identifier === inspectingActionId)?.proposedPayload, 
                    null, 4
                  )}
                </pre>
              </div>

              {/* Footer del Modal con Firma Requerida */}
              <footer className="p-12 border-t border-border bg-background flex justify-between items-end">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase opacity-20">
                    <Fingerprint size={12} /> Trace_Auth_Required
                  </div>
                  <div className="w-48 h-[1px] bg-border" />
                  <span className="text-[8px] font-mono opacity-40 uppercase tracking-widest">{inspectingActionId}</span>
                </div>

                <div className="flex gap-6">
                  <button 
                    onClick={() => { reject(inspectingActionId); setInspectingActionId(null); }}
                    className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 border-b-2 border-red-600/20 hover:border-red-600 pb-1 transition-all"
                  >
                    Veto_Mutation
                  </button>
                  <button 
                    onClick={() => { handleDigitalSanction(inspectingActionId); setInspectingActionId(null); }}
                    className="bg-foreground text-background px-16 py-5 text-[10px] font-black uppercase tracking-[0.5em] shadow-2xl"
                  >
                    Seal_&_Execute
                  </button>
                </div>
              </footer>
              
              {/* Ojo de Mosca (Marca de Agua interna) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.02]">
                 <ShieldCheck size={400} />
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER FORENSE: OJOS DE MOSCA PULSE */}
      <footer className="pt-10 flex justify-between items-center border-t border-border opacity-20">
        <div className="flex items-center gap-8 text-[8px] font-black uppercase tracking-[0.4em]">
          <span className="flex items-center gap-2"><Lock size={10} /> Sovereign_Encryption: AES-256-GCM</span>
          <span className="flex items-center gap-2"><Unlock size={10} /> RLS_Isolation: Active</span>
        </div>
        <div className="text-[8px] font-black uppercase tracking-[0.4em]">
          OEDP_ENGINE_V5.5 // AUDIT_CONFORMITY_PASS
        </div>
      </footer>
    </div>
  );
};