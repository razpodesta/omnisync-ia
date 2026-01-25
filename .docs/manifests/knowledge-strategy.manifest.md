/** .docs/manifests/knowledge-strategy.manifest.md */

# 📚 Omnisync Knowledge Strategy (RAG-Elite)

## 1. El Ciclo de Vida del Dato
- **Captura**: El usuario pega el texto o sube el PDF en el Dashboard.
- **Enriquecimiento**: La IA decide la categoría y los tags para evitar ruido.
- **Fragmentación**: El texto se divide en 'chunks' de 1000 caracteres con solapamiento.
- **Indexación**: Se guarda en Qdrant Cloud con el ID del Tenant para aislamiento total.

## 2. Seguridad
- Los manuales de un Tenant NUNCA son visibles para otro Tenant.
- Se filtran datos sensibles (PII) antes de la vectorización mediante `OmnisyncSecurity`.