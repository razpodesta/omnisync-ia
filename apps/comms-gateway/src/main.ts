/** apps/comms-gateway/src/main.ts */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';
import { OmnisyncSentinel } from '@omnisync/core-sentinel';
import * as helmet from 'helmet';

/**
 * @name bootstrapOmnichannelGateway
 * @description Punto de ignición soberano del Gateway de Comunicaciones. 
 * Orquesta la apertura de canales físicos (Webhooks/Sockets) bajo un entorno 
 * de alta disponibilidad y blindaje de seguridad institucional. Implementa 
 * el protocolo OEDP para la normalización de tráfico multimodal.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (High-Availability-Gateway V3.2.1)
 * @vision Ultra-Holística: Resilient-Edge & Sovereign-Traffic-Isolation
 */
async function bootstrapOmnichannelGateway(): Promise<void> {
  const apparatusName = 'CommsGateway';
  const executionStartTime = performance.now();

  /**
   * @section 1. Inicialización de Infraestructura NestJS
   * Optimizamos el buffer de logs para delegar la observabilidad al OmnisyncTelemetry
   * y garantizar que no se pierdan trazas durante el arranque.
   */
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  try {
    /**
     * @section 2. Blindaje de Seguridad Institucional (Fix TS2307)
     * Implementación de Helmet para la protección de cabeceras HTTP.
     * RESOLUCIÓN: Se utiliza importación nominal para asegurar compatibilidad.
     */
    app.use(helmet.default());

    /**
     * @section 3. Soberanía de Orígenes (CORS)
     * Limitamos el acceso al gateway basándonos en la lista blanca de la organización.
     */
    app.enableCors({
      origin: process.env['ALLOWED_ORIGINS']?.split(',') || '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    /**
     * @section 4. Estrategia de Versionamiento (Standard 2026)
     * Permite la evolución de los webhooks de mensajería (v1 -> v2) sin 
     * romper la compatibilidad con proveedores externos (Meta).
     */
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
      prefix: 'v',
    });

    /**
     * @section 5. Prefijo Global de Ruta
     * Centraliza el tráfico bajo un namespace técnico para facilitar 
     * el ruteo en el API Gateway o Balanceador.
     */
    const globalPrefix = 'api/gateway';
    app.setGlobalPrefix(globalPrefix);

    /**
     * @section 6. Aduana de Datos Atómica
     * Transforma y valida payloads entrantes antes de que toquen los traductores.
     * Erradica inyecciones de campos no permitidos en el ADN del sistema.
     */
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    /**
     * @section 7. Ignición y Escucha de Red
     * El gateway opera tradicionalmente en el puerto 3001 para coexistir 
     * con el Orchestrator en entornos de desarrollo.
     */
    const port = process.env['PORT'] || 3001;
    await app.listen(port);

    const ignitionDuration = (performance.now() - executionStartTime).toFixed(2);

    OmnisyncTelemetry.verbose(
      apparatusName,
      'bootstrap_success',
      `Gateway operacional en puerto ${port}. ADN de red sincronizado.`,
      { 
        latency: `${ignitionDuration}ms`,
        environment: process.env['NODE_ENV'] || 'development',
        engineVersion: 'OEDP-V3.2.1-ELITE'
      }
    );

    /**
     * @section 8. Gestión de Ciclo de Vida (Graceful Shutdown)
     * Asegura que el gateway cierre conexiones pendientes con la DB y Redis 
     * antes de la terminación del proceso por el orquestador de nube.
     */
    app.enableShutdownHooks();

  } catch (criticalIgnitionError: unknown) {
    /**
     * @note Protocolo de Desastre (Sentinel Bridge)
     * Si la ignición falla (Puerto ocupado, RAM insuficiente), el Sentinel 
     * reporta la anomalía antes del colapso total.
     */
    await OmnisyncSentinel.report({
      errorCode: 'OS-CORE-503',
      severity: 'CRITICAL',
      apparatus: apparatusName,
      operation: 'bootstrap',
      message: 'FALLO_CRITICO_IGNICION_GATEWAY',
      context: { errorTrace: String(criticalIgnitionError) },
    });
    
    process.exit(1);
  }
}

// Ignición del Nodo de Comunicaciones
bootstrapOmnichannelGateway();