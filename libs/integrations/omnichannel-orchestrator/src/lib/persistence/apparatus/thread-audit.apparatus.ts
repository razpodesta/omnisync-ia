/** libs/integrations/omnichannel-orchestrator/src/lib/persistence/apparatus/thread-audit.apparatus.ts */

import { OmnisyncDatabase } from '@omnisync-ecosystem/persistence';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncContracts } from '@omnisync/core-contracts';
import { Prisma } from '@prisma/client';
import {
  ThreadAuditEntrySchema,
  IThreadAuditEntry,
} from '../schemas/thread-audit.schema';

/**
 * @name ThreadAuditApparatus
 * @description Aparato de élite encargado de la persistencia forense y auditoría legal.
 * Orquesta la reconstrucción de hilos de conversación bajo soberanía de tipos.
 *
 * @protocol OEDP-Level: Elite (Zero-Any Compliance)
 */
export class ThreadAuditApparatus {
  /**
   * @method executeAtomicAuditPersistence
   * @description Registra un evento de comunicación en el cluster relacional.
   */
  public static async executeAtomicAuditPersistence(
    auditPayload: IThreadAuditEntry,
  ): Promise<void> {
    const apparatusName = 'ThreadAuditApparatus';
    const operationName = 'executeAtomicAuditPersistence';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        const validatedData = OmnisyncContracts.validate(
          ThreadAuditEntrySchema,
          auditPayload,
          apparatusName,
        );

        try {
          await OmnisyncDatabase.databaseEngine.supportThread.create({
            data: {
              externalUserId: validatedData.externalUserIdentifier,
              tenantId: validatedData.tenantOrganizationIdentifier,
              content: validatedData.textualContent,
              channel: validatedData.originChannel,
              metadata: {
                intentId: validatedData.intentIdentifier,
                role: validatedData.authorRole,
                ...validatedData.auditMetadata,
              } as Prisma.InputJsonValue,
            },
          });

          OmnisyncTelemetry.verbose(
            apparatusName,
            'audit_saved',
            `Vínculo de intención: ${validatedData.intentIdentifier}`,
          );
        } catch (criticalDatabaseError: unknown) {
          OmnisyncTelemetry.verbose(
            apparatusName,
            'persistence_failure',
            String(criticalDatabaseError),
          );
          throw criticalDatabaseError;
        }
      },
    );
  }

  /**
   * @method retrieveThreadHistory
   * @description Recupera cronológicamente los registros de auditoría de una sesión.
   * RESOLUCIÓN ESLINT: Erradicación de 'as any' mediante el uso de schemas para el mapeo.
   */
  public static async retrieveThreadHistory(
    tenantId: string,
    externalUserId: string,
    limit = 50,
  ): Promise<IThreadAuditEntry[]> {
    const apparatusName = 'ThreadAuditApparatus';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      'retrieveThreadHistory',
      async () => {
        const persistedRecords =
          await OmnisyncDatabase.databaseEngine.supportThread.findMany({
            where: { tenantId, externalUserId },
            orderBy: { createdAt: 'asc' },
            take: limit,
          });

        /**
         * @section Mapeo Determínistico (Safe Rehydration)
         * No realizamos casts forzados. Dejamos que Zod valide el objeto 'unknown'
         * proveniente de la base de datos SQL.
         */
        return persistedRecords.map((record) => {
          const rawMetadata =
            (record.metadata as Record<string, unknown>) ?? {};

          const recoveryPayload: unknown = {
            intentIdentifier: rawMetadata['intentId'] || crypto.randomUUID(),
            externalUserIdentifier: record.externalUserId,
            tenantOrganizationIdentifier: record.tenantId,
            textualContent: record.content,
            originChannel: record.channel,
            authorRole: rawMetadata['role'], // Zod manejará el fallback si es inválido
            auditMetadata: rawMetadata,
            createdAt: record.createdAt.toISOString(),
          };

          return ThreadAuditEntrySchema.parse(recoveryPayload);
        });
      },
    );
  }
}
