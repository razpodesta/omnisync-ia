/** apps/admin-dashboard/src/components/sections/cognitive-playground.apparatus.tsx */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { 
  Zap, 
  Target, 
  BarChart3, 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  Cpu,
  Mic2
} from 'lucide-react';
import { TenantId, OmnisyncContracts } from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { nexusApi } from '@omnisync/api-client';

/**
 * @name CognitivePlaygroundApparatus
 * @description Terminal de ingeniería de prompts de alta gama.
 * Permite la mutación controlada del ADN instruccional, la auditoría de ROI
 * financiero y la comparación de variantes A/B en tiempo real.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Cognitive-Sovereignty-UI V5.0)
 */
export const CognitivePlayground: React.FC<{ tenantId: TenantId }> = ({ tenantId }) => {
  const translations = useTranslations('cognitive-center');
  
  /** @section Estados de Conciencia */
  const [instructionDNA, setInstructionDNA] = useState({ a: '', b: '' });
  const [activeTier, setActiveTier] = useState<'FLASH' | 'PRO' | 'DEEP_THINK'>('FLASH');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<{ a?: string, b?: string }>({});

  /**
   * @method calculateROI
   * @description Analiza la densidad de información vs el peso de tokens.
   */
  const metrics = useMemo(() => {
    const tokens = Math.ceil(instructionDNA.a.length / 3.8);
    const costPerMillion = activeTier === 'PRO' ? 3.50 : 0.075;
    const estimatedCost = (tokens / 1_000_000) * costPerMillion;
    const efficiency = Math.max(0, 100 - (tokens / 20));

    return { tokens, estimatedCost: estimatedCost.toFixed(6), efficiency: Math.round(efficiency) };
  }, [instructionDNA.a, activeTier]);

  /**
   * @method igniteSimulation
   * @description Dispara la inferencia de prueba bajo el protocolo Action Guard.
   */
  const igniteSimulation = useCallback(async () => {
    const apparatusName = 'CognitivePlayground';
    setIsSimulating(true);

    await OmnisyncTelemetry.traceExecution(apparatusName, 'igniteSimulation', async () => {
      try {
        const result = await nexusApi.dispatchChatInference(tenantId, "SIMULATED_PROMPT_TEST", {
          _experimentalDNA: instructionDNA.a,
          _tier: activeTier
        });
        
        setSimulationResults({ a: result.finalMessage });
        OmnisyncTelemetry.verbose(apparatusName, 'simulation_consummated', `Model: ${activeTier}`);
      } catch (error) {
        setSimulationResults({ a: 'ERROR_NEURAL_COLAPSE: ' + String(error) });
      } finally {
        setIsSimulating(false);
      }
    });
  }, [tenantId, instructionDNA, activeTier]);

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 p-10 bg-background border border-border">
      
      {/* Header: Control de Soberanía */}
      <header className="flex justify-between items-end border-b border-border pb-8">
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.8em] text-foreground/20 italic">
            // Neural_Playground // {tenantId.substring(0, 8)}
          </span>
          <h2 className="text-6xl font-light tracking-tighter italic leading-none">
            Laboratorio <span className="font-black not-italic underline underline-offset-[12px]">Cognitivo.</span>
          </h2>
        </div>

        <nav className="flex gap-6">
          {(['FLASH', 'PRO', 'DEEP_THINK'] as const).map(tier => (
            <button
              key={tier}
              onClick={() => setActiveTier(tier)}
              className={`text-[9px] font-black uppercase tracking-[0.3em] px-6 py-2 border transition-all ${activeTier === tier ? 'bg-foreground text-background border-foreground' : 'opacity-30 border-border hover:opacity-100'}`}
            >
              {tier}
            </button>
          ))}
        </nav>
      </header>

      {/* Grid Principal: ADN e Inferencia */}
      <main className="grid grid-cols-12 gap-10">
        
        {/* Lado Izquierdo: Editor de ADN */}
        <section className="col-span-7 space-y-8">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 italic">
              System_Directive_DNA (Variant_A)
            </label>
            <div className="flex gap-4">
              <span className="text-[9px] font-mono opacity-20">{metrics.tokens}_TK</span>
            </div>
          </div>

          <div className="relative group">
            <textarea
              value={instructionDNA.a}
              onChange={(e) => setInstructionDNA({ ...instructionDNA, a: e.target.value })}
              className="w-full h-[400px] bg-neutral-50/5 dark:bg-neutral-900/5 border border-border p-8 text-[15px] font-light leading-relaxed outline-none focus:ring-1 ring-foreground/20 transition-all scrollbar-hide selection:bg-foreground selection:text-background"
              placeholder="Escriba la directiva maestra para esta simulación..."
            />
            <div className="absolute top-0 left-0 w-1 h-0 bg-foreground group-focus-within:h-full transition-all duration-700" />
          </div>

          <footer className="flex justify-between items-center pt-6">
            <div className="flex gap-10">
               <div className="space-y-1">
                 <p className="text-[8px] font-bold opacity-30 uppercase">Cognitive_ROI</p>
                 <p className="text-xs font-black italic">{metrics.efficiency}%_INDEX</p>
               </div>
               <div className="space-y-1 border-l border-border pl-10">
                 <p className="text-[8px] font-bold opacity-30 uppercase">Forecast_Cost</p>
                 <p className="text-xs font-black text-green-600">${metrics.estimatedCost}</p>
               </div>
            </div>

            <button
              onClick={igniteSimulation}
              disabled={isSimulating || instructionDNA.a.length < 50}
              className="group flex items-center gap-4 bg-foreground text-background px-12 py-5 text-[10px] font-black uppercase tracking-[0.5em] hover:scale-105 active:scale-95 transition-all shadow-2xl"
            >
              {isSimulating ? 'Processing...' : (
                <>Simulate_Inference <Play size={12} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </footer>
        </section>

        {/* Lado Derecho: Output Semántico */}
        <aside className="col-span-5 border-l border-border pl-10 space-y-8">
           <div className="flex items-center gap-3 opacity-30">
              <Target size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Inference_Canvas</span>
           </div>

           <div className="h-[520px] bg-neutral-50/30 dark:bg-neutral-900/10 border border-border p-8 overflow-y-auto relative">
              <AnimatePresence mode="wait">
                {simulationResults.a ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center opacity-20">
                      <span className="text-[8px] font-mono">TRACE_DNA_{activeTier}</span>
                      <ShieldCheck size={12} />
                    </div>
                    <p className="text-sm font-light leading-relaxed italic opacity-80 selection:bg-foreground">
                      {simulationResults.a}
                    </p>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                    <BarChart3 size={48} strokeWidth={1} />
                    <p className="text-[10px] mt-4 font-black uppercase tracking-[0.4em]">Awaiting_Stimulus</p>
                  </div>
                )}
              </AnimatePresence>

              {isSimulating && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                   <div className="flex gap-2">
                     <div className="w-1 h-1 bg-foreground animate-bounce" />
                     <div className="w-1 h-1 bg-foreground animate-bounce [animation-delay:0.2s]" />
                     <div className="w-1 h-1 bg-foreground animate-bounce [animation-delay:0.4s]" />
                   </div>
                </div>
              )}
           </div>
        </aside>
      </main>

      {/* Marca de Agua de Grado Arquitectónico */}
      <footer className="pt-10 flex justify-between items-center border-t border-border opacity-20">
        <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-[0.3em]">
          <Cpu size={10} /> Engine_Status: ACTIVE // OEDP_V5.0
        </div>
        <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-[0.3em]">
          <Mic2 size={10} /> Multimodal_Vocal_DNA: SYNCED
        </div>
      </footer>
    </div>
  );
};