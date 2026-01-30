/** libs/integrations/omnichannel-orchestrator/src/lib/persistence/apparatus/thread-audit.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncContracts } from '@omnisync/core-contracts';
import { Prisma } from '@prisma/client';
/**
 * @section Sincronización de Persistencia
 * Sincronizado con OmnisyncDatabase V3.0 para acceso por patrón Singleton.
 */
import { OmnisyncDatabase } from '@omnisync/core-persistence';
import {
  ThreadAuditEntrySchema,
  IThreadAuditEntry,
} from '../schemas/thread-audit.schema';

/**
 * @name ThreadAuditApparatus
 * @description Aparato de grado militar especializado en la persistencia forense y auditoría legal.
 * Orquesta el registro inmutable de hilos de conversación en el cluster relacional (SQL), 
 * garantizando la trazabilidad biyectiva entre intenciones neurales y registros físicos.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Relational-Audit-Sovereignty V3.2)
 * @vision Ultra-Holística: Deterministic-Rehydration & SQL-Integrity
 */
export class ThreadAuditApparatus {
  /**
   * @method executeAtomicAuditPersistence
   * @description Registra un evento de comunicación bajo contrato de auditoría inmutable.
   * Resuelve la anomalía TS1354 mediante el uso correcto de Readonly<T>.
   *
   * @param {Readonly<IThreadAuditEntry>} auditPayload - Datos validados para persistencia física.
   * @returns {Promise<void>} Operación atómica de escritura.
   */
  public static async executeAtomicAuditPersistence(
    /**
     * NIVELACIÓN TS1354: Se sustituye el modificador sintáctico inválido 
     * por el Utility Type soberano de TypeScript.
     */
    auditPayload: Readonly<IThreadAuditEntry>,
  ): Promise<void> {
    const apparatusName = 'ThreadAuditApparatus';
    const operationName = 'executeAtomicAuditPersistence';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        // 1. Fase de Validación de ADN de Entrada (Aduana Interna)
        const validatedData = OmnisyncContracts.validate(
          ThreadAuditEntrySchema,
          auditPayload,
          apparatusName,
        );

        try {
          /**
           * @section Escritura en Cluster Relacional
           * Mapeamos el contrato de auditoría al esquema físico de Prisma,
           * inyectando metadatos técnicos para trazabilidad de orquestación.
           */
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
                notarizedBy: 'OEDP-V3.2-NOTARY'
              } as Prisma.InputJsonValue,
            },
          });

          OmnisyncTelemetry.verbose(
            apparatusName,
            'audit_entry_sealed',
            `Registro forense sellado para intención: ${validatedData.intentIdentifier}`,
          );
        } catch (criticalDatabaseError: unknown) {
          /**
           * @note Propagación Controlada
           * El error se eleva al orquestador superior para que el Sentinel 
           * gestione el reintento o la degradación de servicio.
           */
          OmnisyncTelemetry.verbose(
            apparatusName,
            'sql_persistence_failure',
            `Fallo físico en SQL: ${String(criticalDatabaseError)}`,
          );
          throw criticalDatabaseError;
        }
      },
      { intentId: auditPayload.intentIdentifier, channel: auditPayload.originChannel }
    );
  }

  /**
   * @method retrieveThreadHistory
   * @description Recupera cronológicamente los registros de auditoría de una sesión.
   * Implementa una rehidratación determinista que erradica la ambigüedad de tipos del JSON de DB.
   *
   * @param {string} tenantId - Identificador del nodo organizacional.
   * @param {string} externalUserId - Identificador del usuario final.
   * @param {number} limit - Cantidad de registros a recuperar (Default: 50).
   * @returns {Promise<IThreadAuditEntry[]>} Colección de registros validados por SSOT.
   */
  public static async retrieveThreadHistory(
    tenantId: string,
    externalUserId: string,
    limit = 50,
  ): Promise<IThreadAuditEntry[]> {
    const apparatusName = 'ThreadAuditApparatus';
    const operationName = 'retrieveThreadHistory';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        /**
         * @section Consulta de Baja Latencia
         * Recuperamos el ADN histórico ordenado por secuencia temporal.
         */
        const persistedRecords =
          await OmnisyncDatabase.databaseEngine.supportThread.findMany({
            where: { tenantId, externalUserId },
            orderBy: { createdAt: 'asc' },
            take: limit,
          });

        /**
         * @section Protocolo de Rehidratación Segura
         * Transformamos los registros crudos de Prisma en el contrato inmutable IThreadAuditEntry.
         * Se maneja la extracción del JSON 'metadata' sin incurrir en 'any'.
         */
        return persistedRecords.map((record) => {
          // Extracción segura del objeto de metadatos persistido
          const rawMetadata = (record.metadata as Record<string, unknown>) ?? {};

          const recoveryPayload: unknown = {
            intentIdentifier: rawMetadata['intentId'] || 'unknown_trace_id',
            externalUserIdentifier: record.externalUserId,
            tenantOrganizationIdentifier: record.tenantId,
            textualContent: record.content,
            originChannel: record.channel,
            authorRole: rawMetadata['role'] ?? 'USER',
            auditMetadata: rawMetadata,
            createdAt: record.createdAt.toISOString(),
          };

          /**
           * @note Aduana de Reingreso
           * Validamos cada registro recuperado para asegurar que la base de datos 
           * no haya sido manipulada fuera del estándar SSOT.
           */
          return OmnisyncContracts.validate(
            ThreadAuditEntrySchema,
            recoveryPayload,
            `${apparatusName}:DeterministicRehydration`
          );
        });
      },
      { tenantId, userId: externalUserId }
    );
  }
}