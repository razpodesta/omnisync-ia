/** .docs/manifests/omnisync-observability-resilience.manifest.md */

# 🛡️ Omnisync Holistic Observability & Resilience Manifest (OHORM)

## 1. Filosofía del Error
En Omnisync-AI, un error no es un evento terminal, es un **Dato Diagnóstico**. El sistema debe ser capaz de autosanarse o, en su defecto, reportar la causa raíz con precisión quirúrgica.

## 2. Taxonomía de Códigos de Error (OS-Standard)
Todo error debe seguir el formato: `OS-[CAPA]-[CÓDIGO]`
- **OS-CORE-XXX**: Errores de infraestructura, base de datos o telemetría.
- **OS-INTEG-XXX**: Fallos en Google Gemini, WhatsApp Gateway o ERP Bridge.
- **OS-DOM-XXX**: Violaciones de lógica de negocio o validación de inquilinos (Tenants).
- **OS-SEC-XXX**: Brechas de seguridad, tokens expirados o acceso no autorizado.

## 3. Niveles de Criticidad e Inmunidad
- **LOW (Transient)**: Errores de red temporales. Estrategia: **Retry con Exponential Backoff**.
- **MEDIUM (Operational)**: Fallos de validación o datos faltantes. Estrategia: **Circuit Breaker y Notificación al Admin**.
- **HIGH (Systemic)**: Caída de servicios críticos (Gemini/ERP). Estrategia: **Failsafe Mode (Respuestas predefinidas) y Alerta Crítica**.

## 4. El "Sentinel" como Hub de Reportes
El Sentinel interceptará excepciones de forma global:
- En **NestJS**: Mediante `Global Filters`.
- En **Next.js**: Mediante `Error Boundaries`.
- En **IA**: Mediante monitoreo de alucinaciones y cuotas de tokens.
2. Nivelación de Esquema: Sentinel Intelligence
code
TypeScript
/** libs/core/sentinel/src/lib/schemas/sentinel.schema.ts */

import { z } from 'zod';

export const SentinelSeveritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

/**
 * @description Estructura de reporte de error inteligente.
 */
export const SentinelReportSchema = z.object({
  errorCode: z.string().regex(/^OS-[A-Z]+-\d{3}$/),
  severity: SentinelSeveritySchema,
  apparatus: z.string(),
  operation: z.string(),
  message: z.string(),
  stackTrace: z.string().optional(),
  // Contexto dinámico: Datos del usuario, estado de la IA o payload del ERP
  context: z.record(z.string(), z.unknown()),
  timestamp: z.string().datetime(),
  tenantId: z.string().uuid().optional(),
  isRecoverable: z.boolean().default(false),
});

export type ISentinelSeverity = z.infer<typeof SentinelSeveritySchema>;
export type ISentinelReport = z.infer<typeof SentinelReportSchema>;
3. Nivelación del Aparato: Omnisync Sentinel
code
TypeScript
/** libs/core/sentinel/src/lib/sentinel.apparatus.ts */

import { ISentinelReport, SentinelReportSchema, ISentinelSeverity } from './schemas/sentinel.schema';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

/**
 * @name OmnisyncSentinel
 * @description Aparato central para la resiliencia y el manejo inteligente de errores.
 * Actúa como un interceptor de fallos y orquestador de estrategias de recuperación.
 */
export class OmnisyncSentinel {
  /**
   * @method report
   * @description Clasifica, registra y decide el flujo de acción ante un error.
   */
  public static async report(errorPayload: Partial<ISentinelReport>): Promise<void> {
    const report: ISentinelReport = this.hydrateReport(errorPayload);

    // 1. Registro en Telemetría (Persistencia de logs)
    OmnisyncTelemetry.verbose('OmnisyncSentinel', 'report', `Error detected: ${report.errorCode}`, { 
      severity: report.severity,
      isRecoverable: report.isRecoverable 
    });

    // 2. Lógica de Notificación Crítica
    if (report.severity === 'CRITICAL' || report.severity === 'HIGH') {
      await this.dispatchCriticalAlert(report);
    }

    // 3. Validación de Integridad del Reporte
    try {
      SentinelReportSchema.parse(report);
    } catch (schemaError) {
      console.error('[SENTINEL-INTERNAL-FAILURE] Report schema is invalid', schemaError);
    }
  }

  /**
   * @method executeWithResilience
   * @description Patrón Wrapper que aplica reintentos automáticos a operaciones inestables (ej. APIs externas).
   */
  public static async executeWithResilience<T>(
    operation: () => Promise<T>,
    apparatusName: string,
    operationName: string,
    maxRetries: number = 3
  ): Promise<T> {
    let currentAttempt = 0;

    while (currentAttempt < maxRetries) {
      try {
        return await operation();
      } catch (error) {
        currentAttempt++;
        const isLastAttempt = currentAttempt === maxRetries;

        if (isLastAttempt) {
          await this.report({
            errorCode: 'OS-CORE-001', // General Execution Failure
            severity: 'MEDIUM',
            apparatus: apparatusName,
            operation: operationName,
            message: `Operation failed after ${maxRetries} attempts`,
            context: { error: String(error) },
            isRecoverable: false
          });
          throw error;
        }

        // Delay exponencial antes del próximo intento
        const delay = Math.pow(2, currentAttempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Unreachable code in Sentinel Resilience');
  }

  /**
   * @method hydrateReport
   * @private
   */
  private static hydrateReport(payload: Partial<ISentinelReport>): ISentinelReport {
    return {
      errorCode: payload.errorCode ?? 'OS-CORE-999',
      severity: payload.severity ?? 'LOW',
      apparatus: payload.apparatus ?? 'UnknownApparatus',
      operation: payload.operation ?? 'UnknownOperation',
      message: payload.message ?? 'No error message provided',
      context: payload.context ?? {},
      timestamp: new Date().toISOString(),
      isRecoverable: payload.isRecoverable ?? false,
      tenantId: payload.tenantId,
      stackTrace: payload.stackTrace
    };
  }

  /**
   * @method dispatchCriticalAlert
   * @private
   * @description Envía el error a nuestro propio Dashboard de Administración.
   */
  private static async dispatchCriticalAlert(report: ISentinelReport): Promise<void> {
    // Aquí se implementará el webhook hacia apps/admin-dashboard
    console.error(`🚨 [CRITICAL ALERT] ${report.errorCode}: ${report.message}`);
  }
}