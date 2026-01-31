/** apps/comms-gateway/src/app/app.module.ts */

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * @name AppModule
 * @description Orquestador de dependencias raíz del Gateway de Comunicaciones. 
 * Centraliza el registro de controladores de ingesta y servicios de despacho, 
 * actuando como el nodo de unión entre el tráfico físico (Webhooks) y 
 * la normalización omnicanal del sistema.
 * 
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Module-Ingestion V3.2)
 * @vision Ultra-Holística: Clean-Dependency-Injection & Service-Sovereignty
 */
@Module({
  /**
   * @section Capas de Integración
   * En V3.2, las librerías Core (Telemetry, Sentinel, Orchestrator) se consumen 
   * como aparatos estáticos de alto rendimiento para minimizar la latencia de 
   * inyección y maximizar el throughput del Gateway.
   */
  imports: [],

  /**
   * @section Capa de Entrada (Ingress)
   * Registra el controlador nivelado que gestiona handshakes de Meta, 
   * Evolution y tráfico Web Chat.
   */
  controllers: [AppController],

  /**
   * @section Capa de Lógica (Internal Service)
   * Provee el servicio encargado del despacho neural y efectos secundarios 
   * de red no-bloqueantes.
   */
  providers: [AppService],
})
export class AppModule {}