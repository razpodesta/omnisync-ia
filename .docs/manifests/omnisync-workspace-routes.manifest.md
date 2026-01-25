/** .docs/manifests/omnisync-workspace-routes.manifest.md */

# 🗺️ Omnisync Workspace Route Map (LEGO Structure)

## 1. APPS (Puntos de Ejecución)
- `apps/orchestrator-api`: Cerebro NestJS (WhatsApp + IA + ERP logic).
- `apps/admin-dashboard`: Panel Next.js (UX para gestión de nodos).
- `apps/comms-gateway`: Microservicio dedicado a Webhooks de WhatsApp.

## 2. LIBS (Piezas LEGO Autónomas)

### A. Capa Core (Invariantes Técnicos)
- `libs/core/telemetry`: (Ex shared/logger) Medición de performance, logs e IA Monitoring.
- `libs/core/security`: Encriptación, Auth y Row Level Security (RLS).
- `libs/core/contracts`: Esquemas Zod globales y tipos compartidos (SSOT).

### B. Capa Integrations (Conectores Externos)
- `libs/integrations/google-gemini`: Aparatos específicos para el LLM.
- `libs/integrations/whatsapp-evolution`: Lógica de conexión con el Gateway.
- `libs/integrations/erp-standard`: Abstracción para conectar cualquier ERP.

### C. Capa Domain (Lógica de Negocio)
- `libs/domain/tenants`: Gestión de nodos/sedes (Ex libs/tenant).
- `libs/domain/support`: Lógica de tickets, problemas y resoluciones.

## 3. TESTS (Espejo de Integridad)
- `tests/libs/[layer]/[module]`: Estructura 1:1 con las librerías para Mirror Testing.