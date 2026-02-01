/** apps/admin-dashboard/src/hooks/use-action-guard.ts */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { TenantId, OmnisyncContracts } from '@omnisync/core-contracts';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { nexusApi } from '@omnisync/api-client';

import { 
  PendingActionEntrySchema, 
  IPendingActionEntry,
  ActionDecisionSchema,
} from './schemas/action-guard-hook.schema';

/**
 * @interface IActionGuardState
 * @description ADN reactivo del gestor de aprobaciones con soporte para bloqueo granular.
 */
interface IActionGuardState {
  readonly pendingActions: readonly IPendingActionEntry[];
  readonly isSynchronizing: boolean;
  readonly lockedActionIdentifiers: ReadonlySet<string>;
  readonly lastOperationStatus: 'IDLE' | 'SUCCESS' | 'FAILURE';
  readonly connectionAnomaly: string | null;
}

/**
 * @name useActionGuard
 * @description Hook de orquestación de élite para el protocolo Action Guard (Human-in-the-Loop).
 * Gestiona la cola de suspensión transaccional, permitiendo al administrador sancionar
 * o vetar las propuestas operativas de la Inteligencia Artificial.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Transactional-Governance V4.0)
 * @vision Ultra-Holística: Zero-Unintended-Mutations & Atomic-Action-Locking
 */
export const useActionGuard = (tenantId: TenantId) => {
  const apparatusName = 'useActionGuard';
  
  // Referencia para la cancelación de procesos asíncronos
  const networkControllerReference = useRef<AbortController | null>(null);

  const [state, setState] = useState<IActionGuardState>({
    pendingActions: [],
    isSynchronizing: false,
    lockedActionIdentifiers: new Set(),
    lastOperationStatus: 'IDLE',
    connectionAnomaly: null
  });

  /**
   * @method fetchPendingQueue
   * @description Sincroniza la bóveda de acciones suspendidas desde el Orchestrator.
   */
  const fetchPendingQueue = useCallback(async (): Promise<void> => {
    // Abortamos cualquier sincronización previa en curso
    if (networkControllerReference.current) networkControllerReference.current.abort();
    networkControllerReference.current = new AbortController();

    setState(prev => ({ ...prev, isSynchronizing: true, connectionAnomaly: null }));

    await OmnisyncTelemetry.traceExecution(apparatusName, 'fetchPendingQueue', async () => {
      try {
        const rawCollection = await nexusApi.nexusApi<unknown[]>(
          '/v1/neural/action/pending' as any, // Endpoint de cola nivelado en el Hub
          tenantId,
          { method: 'GET' }
        );

        /**
         * @section Aduana de Datos (Batch Validation)
         * Validamos la colección completa contra el contrato de la Fase 4.
         */
        const validatedActions = OmnisyncContracts.validateCollection(
          PendingActionEntrySchema,
          rawCollection,
          `${apparatusName}:QueueAudit`
        );

        setState(prev => ({
          ...prev,
          pendingActions: validatedActions,
          isSynchronizing: false,
          lastOperationStatus: 'SUCCESS'
        }));

      } catch (transmissionError: unknown) {
        if ((transmissionError as Error).name === 'AbortError') return;

        const forensicTrace = String(transmissionError);
        setState(prev => ({ 
          ...prev, 
          isSynchronizing: false, 
          connectionAnomaly: forensicTrace, 
          lastOperationStatus: 'FAILURE' 
        }));

        OmnisyncTelemetry.verbose(apparatusName, 'fetch_failure', forensicTrace);
      }
    }, { tenantId });
  }, [tenantId]);

  /**
   * @method resolveActionDecision
   * @description Transmite el sello de aprobación o rechazo al cluster operativo.
   * Implementa bloqueo atómico por ID para prevenir condiciones de carrera.
   */
  const resolveActionDecision = useCallback(async (
    actionIdentifier: string, 
    decision: 'APPROVED' | 'REJECTED',
    adminNote?: string
  ): Promise<void> => {
    const operationName = `resolveAction:${decision}`;

    // 1. Verificación de Bloqueo: Si la acción ya está en vuelo, ignoramos el disparo.
    if (state.lockedActionIdentifiers.has(actionIdentifier)) return;

    // 2. Validación de Contrato de Decisión (Aduana Frontal)
    const validatedDecision = OmnisyncContracts.validate(ActionDecisionSchema, {
      actionIdentifier,
      decision,
      adminNote: adminNote?.trim()
    }, apparatusName);

    // 3. Bloqueo Atómico de la Acción
    setState(prev => {
      const nextLocks = new Set(prev.lockedActionIdentifiers);
      nextLocks.add(actionIdentifier);
      return { ...prev, lockedActionIdentifiers: nextLocks };
    });

    await OmnisyncTelemetry.traceExecution(apparatusName, operationName, async () => {
      try {
        await nexusApi.nexusApi(
          '/v1/neural/action/resolve' as any,
          tenantId,
          validatedDecision
        );

        OmnisyncTelemetry.verbose(apparatusName, 'decision_consummated', 
          `Acción [${actionIdentifier}] sancionada como [${decision}]`
        );

        // 4. Limpieza de Memoria Local (Optimistic UI Strategy)
        setState(prev => {
          const nextLocks = new Set(prev.lockedActionIdentifiers);
          nextLocks.delete(actionIdentifier);
          return {
            ...prev,
            pendingActions: prev.pendingActions.filter(a => a.identifier !== actionIdentifier),
            lockedActionIdentifiers: nextLocks,
            lastOperationStatus: 'SUCCESS'
          };
        });

      } catch (criticalGovernanceError: unknown) {
        /**
         * @section Reporte Sentinel
         * Un fallo aquí es crítico: significa que un humano aprobó algo pero el 
         * ERP no pudo ejecutarlo. Requiere atención inmediata.
         */
        await OmnisyncSentinel.report({
          errorCode: 'OS-INTEG-404',
          severity: 'CRITICAL',
          apparatus: apparatusName,
          operation: operationName,
          message: 'Incapacidad de sincronizar decisión humana con el ERP.',
          context: { actionId: actionIdentifier, decision, errorTrace: String(criticalGovernanceError) },
          isRecoverable: true
        });

        // Liberamos el bloqueo para permitir reintento manual
        setState(prev => {
          const nextLocks = new Set(prev.lockedActionIdentifiers);
          nextLocks.delete(actionIdentifier);
          return { ...prev, lockedActionIdentifiers: nextLocks, lastOperationStatus: 'FAILURE' };
        });
      }
    }, { actionId: actionIdentifier, decision, tenantId });
  }, [tenantId, state.lockedActionIdentifiers]);

  /**
   * @section Ciclo de Vida: Hidratación y Limpieza
   */
  useEffect(() => {
    fetchPendingQueue();
    return () => {
      if (networkControllerReference.current) networkControllerReference.current.abort();
    };
  }, [fetchPendingQueue]);

  return useMemo(() => ({
    ...state,
    /** @method approve - Sella la acción para ejecución real */
    approve: (id: string, note?: string) => resolveActionDecision(id, 'APPROVED', note),
    /** @method reject - Veta la acción y la erradica de la cola */
    reject: (id: string, note?: string) => resolveActionDecision(id, 'REJECTED', note),
    /** @method refresh - Sincronización manual de la cola */
    refresh: fetchPendingQueue
  }), [state, resolveActionDecision, fetchPendingQueue]);
};