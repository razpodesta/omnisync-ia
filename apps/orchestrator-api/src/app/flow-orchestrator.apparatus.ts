/** apps/orchestrator-api/src/app/flow-orchestrator.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncDatabase } from '@omnisync/core-persistence';
import { OmnisyncMemory } from '@omnisync/core-persistence';
import { AIDriverFactory } from '@omnisync/ai-engine';
import { 
  INeuralIntent, 
  INeuralFlowResult, 
  AIResponseSchema,
  NeuralFlowResultSchema 
} from '@omnisync/core-contracts';

/**
 * @name NeuralFlowOrchestrator
 * @description Punto central de inteligencia. Coordina la persistencia, 
 * la recuperación de memoria y la inferencia de IA.
 */
export class NeuralFlowOrchestrator {
  
  public static async process(intent: INeuralIntent): Promise<INeuralFlowResult> {
    return await OmnisyncTelemetry.traceExecution(
      'NeuralFlowOrchestrator',
      'process',
      async () => {
        const startTime = performance.now();

        // 1. Resolución de Tenant y Configuración (PostgreSQL)
        const tenant = await OmnisyncDatabase.db.tenant.findUnique({
          where: { id: intent.tenantId }
        });

        if (!tenant) throw new Error('TENANT_NOT_FOUND');

        // 2. Recuperación de Memoria (Upstash Redis)
        const sessionId = `${intent.tenantId}:${intent.externalUserId}`;
        const history = await OmnisyncMemory.getHistory(sessionId);

        // 3. Inferencia de IA (Agnóstica)
        const driver = AIDriverFactory.getDriver(tenant.aiProvider);
        const aiSuggestion = await driver.generateResponse(
          intent.payload.content,
          tenant.aiConfig as any, // Cast controlado del JSON de Prisma
          history as any
        );

        // 4. Actualización de Memoria (Asíncrona)
        const userMsg = { role: 'user', parts: [{ text: intent.payload.content }] };
        const modelMsg = { role: 'model', parts: [{ text: aiSuggestion }] };
        
        await OmnisyncMemory.pushHistory(sessionId, userMsg);
        await OmnisyncMemory.pushHistory(sessionId, modelMsg);

        // 5. Respuesta Final (SSOT)
        return NeuralFlowResultSchema.parse({
          intentId: intent.id,
          tenantId: intent.tenantId,
          aiResponse: {
            conversationId: sessionId,
            suggestion: aiSuggestion,
            status: 'RESOLVED',
            confidenceScore: 1,
            sourceManuals: []
          },
          finalMessage: aiSuggestion,
          executionTime: performance.now() - startTime
        });
      }
    );
  }
}