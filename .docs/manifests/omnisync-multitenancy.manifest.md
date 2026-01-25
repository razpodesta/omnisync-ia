/** .docs/manifests/omnisync-multitenancy.manifest.md */

# 🧬 Omnisync Multi-tenancy Neural Manifest (OMN)

## 1. Soberanía de Datos
Cada `Tenant` (inquilino) opera en un entorno de ejecución lógicamente aislado. Las configuraciones de modelos de IA, credenciales de ERP y manuales técnicos son privados y nunca se cruzan entre nodos.

## 2. Inyección Dinámica de LEGOs
El sistema no tiene configuraciones estáticas. El `TenantManager` es responsable de inyectar en los orquestadores:
- El `AI-Driver` específico (ej. Gemini Pro para Soporte).
- El `ERP-Adapter` configurado (ej. Odoo para Admin).
- Los temas visuales para el `Web-Chat-Widget`.

## 3. Resolución de Identidad
El sistema debe resolver el `TenantId` en menos de 50ms mediante una capa de caché (Redis) para evitar latencias en la conversación inicial.