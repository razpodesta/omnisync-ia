/** apps/admin-dashboard/src/hooks/use-system-pulse.ts */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { TenantId, OmnisyncContracts } from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { nexusApi } from '@omnisync/api-client';
import { 
  IGlobalHealthReport, 
  GlobalHealthReportSchema 
} from '@omnisync/health-engine';

import { 
  SystemPulseConfigurationSchema, 
  ISystemPulseConfiguration 
} from './schemas/system-pulse.schema';

/**
 * @interface IInfrastructurePulseState
 * @description ADN reactivo optimizado para bajo consumo.
 */
interface IInfrastructurePulseState {
  readonly latestReport: IGlobalHealthReport | null;
  readonly isProcessing: boolean;
  readonly lastExecutionTimestamp: number;
  readonly connectionAnomaly: string | null;
}

/**
 * @name useSystemPulse
 * @description Hook de orquestación inteligente de salud. 
 * Abandona el polling automático en favor de una estrategia de "Disparo por Eventos".
 * Protege los recursos de Render/Vercel mediante cache local y tiempos de enfriamiento.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Smart-Action-Pulse V4.0)
 * @vision Ultra-Holística: Zero-Waste-Execution & Action-Triggered-Sovereignty
 */
export const useSystemPulse = (
  tenantId: TenantId,
  customConfiguration: Partial<ISystemPulseConfiguration> = {}
) => {
  const apparatusName = 'useSystemPulse';

  // 1. Hidratación de Aduana de Configuración
  const configuration = useMemo(() => {
    return OmnisyncContracts.validate(
      SystemPulseConfigurationSchema,
      customConfiguration,
      `${apparatusName}:Configuration`
    );
  }, [customConfiguration]);

  const [state, setState] = useState<IInfrastructurePulseState>({
    latestReport: null,
    isProcessing: false,
    lastExecutionTimestamp: 0,
    connectionAnomaly: null
  });

  /**
   * @method executeHealthAudit
   * @description Realiza la sonda física si el ADN de salud está caduco o es una acción forzada.
   */
  const executeHealthAudit = useCallback(async (isForced = false): Promise<void> => {
    const currentTime = Date.now();
    const timeSinceLastCheck = currentTime - state.lastExecutionTimestamp;

    // --- GUARDIA DE PRESUPUESTO ---
    // Si no es forzado y el dato es fresco (TTL), no ejecutamos petición de red.
    if (!isForced && timeSinceLastCheck < configuration.staleTimeInMilliseconds) {
      OmnisyncTelemetry.verbose(apparatusName, 'budget_save', 'Utilizando ADN de salud cacheado (Dato Fresco).');
      return;
    }

    // Si es forzado pero estamos en cooldown, bloqueamos para proteger el servidor.
    if (isForced && timeSinceLastCheck < configuration.cooldownInMilliseconds) {
      OmnisyncTelemetry.verbose(apparatusName, 'cooldown_active', 'Disparo manual bloqueado por enfriamiento.');
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, connectionAnomaly: null }));

    await OmnisyncTelemetry.traceExecution(apparatusName, 'audit_pulse', async () => {
      try {
        const rawReport = await nexusApi.getInfrastructurePulse(tenantId, 'FULL_360');

        const validatedReport = OmnisyncContracts.validate(
          GlobalHealthReportSchema,
          rawReport,
          `${apparatusName}:PulseHandshake`
        );

        setState({
          latestReport: validatedReport,
          isProcessing: false,
          lastExecutionTimestamp: Date.now(),
          connectionAnomaly: null
        });

      } catch (transmissionError: unknown) {
        setState(prev => ({
          ...prev,
          isProcessing: false,
          connectionAnomaly: 'OS-INTEG-701: Fallo de enlace con los signos vitales.'
        }));
        
        OmnisyncTelemetry.verbose(apparatusName, 'audit_failure', String(transmissionError));
      }
    }, { tenantId, isForcedExecution: isForced });
  }, [tenantId, state.lastExecutionTimestamp, configuration]);

  /**
   * @section Gestión de Disparadores Situacionales (Action Triggers)
   */
  useEffect(() => {
    // 1. Disparo por Montaje (Soberanía inicial)
    if (configuration.triggerOnMount) {
      executeHealthAudit();
    }

    // 2. Disparo por Visibilidad (Recuperación de foco de pestaña)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && configuration.triggerOnVisibilityChange) {
        executeHealthAudit();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => window.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [configuration, executeHealthAudit]);

  return {
    ...state,
    /** 
     * @property isStale
     * Indica si el dato actual ha superado el tiempo de frescura.
     */
    isStale: (Date.now() - state.lastExecutionTimestamp) > configuration.staleTimeInMilliseconds,
    
    /**
     * @method requestManualPulse
     * Acción de usuario para forzar una auditoría física.
     */
    requestManualPulse: () => executeHealthAudit(true),
  };
};