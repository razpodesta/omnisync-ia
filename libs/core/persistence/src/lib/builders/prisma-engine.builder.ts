/** libs/core/persistence/src/lib/builders/prisma-engine.builder.ts */

import { PrismaClient, Prisma } from '@prisma/client';
import { IDatabaseInfrastructureConfiguration } from '../schemas/database.schema';

/**
 * @interface ISovereignPrismaOptions
 * @description Extensión técnica de las opciones de Prisma para permitir 
 * la inyección dinámica de datasources. Resuelve el bloqueo TS2353 
 * garantizando la soberanía de tipos durante la ignición.
 */
interface ISovereignPrismaOptions extends Prisma.PrismaClientOptions {
  datasources?: {
    db?: {
      url?: string;
    };
  };
}

/**
 * @name PrismaEngineBuilder
 * @description Aparato de grado industrial encargado de la instanciación 
 * programática del motor Prisma. Implementa la técnica de "Inyección de ADN 
 * Dinámico", permitiendo ruteo hacia Supabase/Neon en tiempo de ejecución. 
 * Erradica bloqueos de compilación mediante contratos extendidos.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Persistence-Ignition V3.2)
 * @vision Ultra-Holística: Zero-Local & Type-Safe-Injection
 */
export class PrismaEngineBuilder {
  /**
   * @method buildSovereignClient
   * @description Orquesta la construcción técnica de PrismaClient. Resuelve la 
   * anomalía TS2353 mediante un cast estructural hacia la interfaz soberana, 
   * asegurando que la URL relacional se inyecte correctamente.
   *
   * @param {Readonly<IDatabaseInfrastructureConfiguration>} infrastructureConfiguration - ADN de conexión validado.
   * @returns {PrismaClient} Instancia del motor lista para la orquestación.
   */
  public static buildSovereignClient(
    infrastructureConfiguration: Readonly<IDatabaseInfrastructureConfiguration>
  ): PrismaClient {
    
    /**
     * @section Fase 1: Calibración de Observabilidad
     */
    const logLevelConfiguration: Prisma.LogLevel[] =
      infrastructureConfiguration.executionEnvironment === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'];

    /**
     * @section Fase 2: Construcción de Opciones (Safe Extension)
     * RESOLUCIÓN TS2353: Creamos el objeto de opciones utilizando la interfaz 
     * extendida. Esto permite al compilador aceptar 'datasources' sin 
     * recurrir a 'any', manteniendo el estándar OEDP.
     */
    const clientOptions: ISovereignPrismaOptions = {
      log: logLevelConfiguration,
      /**
       * @note Inyección de Soberanía de Datos
       * Sobrescribimos la URL de conexión definida en el esquema físico 
       * con la URL activa de la infraestructura Cloud.
       */
      datasources: {
        db: {
          url: infrastructureConfiguration.relationalDatabaseUrl,
        },
      },
    };

    /**
     * @note Ignición del Motor
     * Realizamos el despacho hacia el constructor de PrismaClient.
     */
    return new PrismaClient(clientOptions as Prisma.PrismaClientOptions);
  }
}