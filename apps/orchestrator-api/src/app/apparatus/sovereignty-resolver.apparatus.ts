/** apps/orchestrator-api/src/app/apparatus/sovereignty-resolver.apparatus.ts */

import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import { OmnisyncDatabase } from '@omnisync/core-persistence';
import {
  ITenantConfiguration,
  TenantConfigurationSchema,
  TenantId,
  OmnisyncContracts,
} from '@omnisync/core-contracts';

/**
 * @interface ICachedSovereignty
 * @description Contenedor para la persistencia volátil de la configuración del nodo.
 */
interface ICachedSovereignty {
  readonly configuration: ITenantConfiguration;
  readonly expirationTimestamp: number;
}

/**
 * @name SovereigntyResolverApparatus
 * @description Aparato de gobernanza encargado de la resolución y validación de identidades corporativas.
 * Actúa como la aduana primaria del sistema, gestionando el acceso al ADN del suscriptor 
 * mediante una arquitectura de caché de dos niveles y validación estricta de contratos.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Identity-Caching-Resilience V3.2)
 * @vision Ultra-Holística: Zero-Latency-Resolution & Sovereign-Gatekeeping
 */
export class SovereigntyResolverApparatus {
  /**
   * @private
   * @description Caché de Nivel 1 (L1) en memoria para evitar saturación de la capa relacional.
   */
  private static readonly L1_SOVEREIGNTY_CACHE = new Map<TenantId, ICachedSovereignty>();

  /**
   * @private
   * @description Tiempo de vida de la configuración en memoria (5 minutos).
   */
  private static readonly CACHE_TTL_MILLISECONDS = 5 * 60 * 1000;

  /**
   * @method resolveTenantSovereignty
   * @description Localiza, valida y entrega el ADN técnico de una organización.
   * Implementa una estrategia de "Cache-First" seguida de "Resilient-Database-Handshake".
   *
   * @param {TenantId} tenantOrganizationIdentifier - Identificador nominal del nodo suscriptor.
   * @returns {Promise<ITenantConfiguration>} Configuración sellada y validada por SSOT.
   * @throws {Error} Excepciones OS-DOM-404 (Inexistente) o OS-DOM-403 (Inactivo).
   */
  public static async resolveTenantSovereignty(
    tenantOrganizationIdentifier: TenantId,
  ): Promise<ITenantConfiguration> {
    const apparatusName = 'SovereigntyResolverApparatus';
    const operationName = 'resolveTenantSovereignty';

    return await OmnisyncTelemetry.traceExecution(
      apparatusName,
      operationName,
      async () => {
        /**
         * @section Fase 1: Resolución vía Caché L1
         * Si el ADN del nodo está caliente y es válido, lo entregamos con latencia <1ms.
         */
        const cachedEntry = this.L1_SOVEREIGNTY_CACHE.get(tenantOrganizationIdentifier);
        if (cachedEntry && cachedEntry.expirationTimestamp > Date.now()) {
          OmnisyncTelemetry.verbose(apparatusName, 'cache_hit', `Soberanía resuelta desde memoria: ${tenantOrganizationIdentifier}`);
          return cachedEntry.configuration;
        }

        try {
          /**
           * @section Fase 2: Handshake Relacional Resiliente
           * Utilizamos el Sentinel para proteger la consulta contra inestabilidades del cluster SQL.
           */
          const rawConfigurationRecord = await OmnisyncSentinel.executeWithResilience(
            async () => {
              return await OmnisyncDatabase.databaseEngine.tenant.findUnique({
                where: { id: tenantOrganizationIdentifier },
              });
            },
            apparatusName,
            'database_fetch'
          );

          /**
           * @section Fase 3: Verificación Forense de Existencia
           */
          if (!rawConfigurationRecord) {
            await this.reportSovereigntyAnomaly(
              tenantOrganizationIdentifier,
              'OS-DOM-404',
              'core.sovereignty.error.node_not_found'
            );
            throw new Error(`OS-DOM-404: Nodo [${tenantOrganizationIdentifier}] no registrado.`);
          }

          /**
           * @section Fase 4: Validación de ADN Estructural (SSOT)
           */
          const validatedConfiguration = OmnisyncContracts.validate(
            TenantConfigurationSchema,
            rawConfigurationRecord,
            `${apparatusName}:DatabaseSymmetry`
          );

          /**
           * @section Fase 5: Auditoría de Salud Operativa
           * Bloqueo proactivo si el nodo no está en fase 'ACTIVE'.
           */
          if (validatedConfiguration.status !== 'ACTIVE') {
            OmnisyncTelemetry.verbose(apparatusName, 'security_block', `Acceso denegado: Nodo en estado ${validatedConfiguration.status}`);
            throw new Error(`OS-DOM-403: El servicio se encuentra en fase ${validatedConfiguration.status}.`);
          }

          /**
           * @section Fase 6: Memorización (Hydration)
           * Sellamos el resultado en la caché para las próximas peticiones.
           */
          this.L1_SOVEREIGNTY_CACHE.set(tenantOrganizationIdentifier, {
            configuration: validatedConfiguration,
            expirationTimestamp: Date.now() + this.CACHE_TTL_MILLISECONDS
          });

          return validatedConfiguration;

        } catch (criticalResolverError: unknown) {
          return this.handleCriticalHandshakeFailure(
            tenantOrganizationIdentifier,
            criticalResolverError
          );
        }
      },
      { tenantId: tenantOrganizationIdentifier }
    );
  }

  /**
   * @method handleCriticalHandshakeFailure
   * @private
   */
  private static handleCriticalHandshakeFailure(
    tenantId: TenantId,
    error: unknown
  ): never {
    const errorString = String(error);

    // Si es un error de dominio ya procesado, solo lo propagamos
    if (errorString.includes('OS-DOM')) {
      throw error;
    }

    // Errores de infraestructura son reportados al Sentinel con criticidad ALTA
    OmnisyncSentinel.report({
      errorCode: 'OS-CORE-503',
      severity: 'CRITICAL',
      apparatus: 'SovereigntyResolverApparatus',
      operation: 'handshake_colapse',
      message: 'Fallo sistémico en la resolución de soberanía.',
      context: { tenantId, errorTrace: errorString },
      isRecoverable: true
    });

    throw new Error('OS-CORE-503: Incapacidad técnica de resolver identidad organizacional.');
  }

  /**
   * @method reportSovereigntyAnomaly
   * @private
   */
  private static async reportSovereigntyAnomaly(
    tenantId: string,
    code: string,
    key: string
  ): Promise<void> {
    await OmnisyncSentinel.report({
      errorCode: code,
      severity: 'HIGH',
      apparatus: 'SovereigntyResolverApparatus',
      operation: 'identify_anomaly',
      message: key,
      context: { requestedTenantId: tenantId },
      isRecoverable: false
    });
  }

  /**
   * @method invalidateCache
   * @description Permite forzar la re-validación del ADN de un nodo. 
   * Útil tras actualizaciones en el Dashboard administrativo.
   */
  public static invalidateCache(tenantId: TenantId): void {
    this.L1_SOVEREIGNTY_CACHE.delete(tenantId);
    OmnisyncTelemetry.verbose('SovereigntyResolverApparatus', 'cache_invalidation', `ADN de nodo invalidado: ${tenantId}`);
  }
}