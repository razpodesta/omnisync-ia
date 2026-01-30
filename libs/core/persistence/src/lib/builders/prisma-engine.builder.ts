/** libs/core/persistence/src/lib/builders/prisma-engine.builder.ts */

import { PrismaClient, Prisma } from '@prisma/client';
import { IDatabaseInfrastructureConfiguration } from '../schemas/database.schema';

/**
 * @name PrismaEngineBuilder
 * @description Aparato especializado de la capa de infraestructura encargado de la 
 * instanciación determinista del motor de persistencia. Implementa la "Ignición Soberana", 
 * permitiendo que el framework Omnisync-AI inyecte dinámicamente credenciales SQL 
 * sin depender de archivos .env locales durante el tiempo de ejecución en la nube.
 * 
 * @protocol OEDP-Level: Elite (Persistence-Ignition V3.2)
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @vision Ultra-Holística: Zero-Local & Resilient
 */
export class PrismaEngineBuilder {
  /**
   * @method buildSovereignClient
   * @description Orquesta la construcción técnica de una instancia de PrismaClient. 
   * Resuelve la anomalía TS2353 mediante el uso del objeto 'datasources' (SSOT de Prisma)
   * y garantiza la inmutabilidad del parámetro mediante el Utility Type 'Readonly'.
   *
   * @param {Readonly<IDatabaseInfrastructureConfiguration>} infrastructureConfiguration - ADN de conexión validado por contrato.
   * @returns {PrismaClient} Instancia del motor lista para la orquestación de datos.
   */
  public static buildSovereignClient(
    /**
     * NIVELACIÓN TS1354: Se utiliza el Utility Type 'Readonly' para proteger 
     * la integridad de la configuración de infraestructura.
     */
    infrastructureConfiguration: Readonly<IDatabaseInfrastructureConfiguration>
  ): PrismaClient {
    
    /**
     * @section Fase 1: Calibración de Observabilidad
     * Mapeo de niveles de telemetría del motor. En producción, restringimos 
     * los logs para maximizar el throughput del proceso.
     */
    const logLevelConfiguration: Prisma.LogLevel[] =
      infrastructureConfiguration.executionEnvironment === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'];

    /**
     * @section Fase 2: Configuración de Opciones (Handshake Sincronizado)
     * RESOLUCIÓN TS2353: Corregimos el ruteo de la URL relacional. 
     * Prisma exige que el override de la base de datos se realice mediante 
     * el objeto 'datasources', mapeando la clave al nombre de la fuente (db).
     */
    const clientOptions: Prisma.PrismaClientOptions = {
      log: logLevelConfiguration,
      /**
       * @note Soberanía de Persistencia Remota
       * Inyectamos la URL del cluster (Supabase/Neon) directamente en el constructor 
       * para permitir escalabilidad multi-región sin cambios de código.
       */
      datasources: {
        db: {
          url: infrastructureConfiguration.relationalDatabaseUrl,
        },
      },
    };

    /**
     * @note Erradicación de Redundancia
     * El aparato retorna la instancia pura. La gestión de reintentos y 
     * errores de conexión es delegada al 'OmnisyncSentinel' mediante 
     * el aparato orquestador 'OmnisyncDatabase'.
     */
    return new PrismaClient(clientOptions);
  }
}