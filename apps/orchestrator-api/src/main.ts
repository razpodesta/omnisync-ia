/** apps/orchestrator-api/src/main.ts (Nivelación de Élite) */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { OmnisyncTelemetry } from '@omnisync/core-telemetry';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CONFIGURACIÓN HOLÍSTICA DE CORS
  // Permite que el Dashboard en Vercel y el Widget en cualquier web hablen con el core.
  app.enableCors({
    origin: '*', // En producción madura se restringe a los dominios del Tenant
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, x-omnisync-tenant, Authorization',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  OmnisyncTelemetry.verbose(
    'System',
    'bootstrap',
    `Neural Core online on port ${port}`,
  );
}
bootstrap();
