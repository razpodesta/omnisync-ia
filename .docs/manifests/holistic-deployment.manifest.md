/** .docs/manifests/holistic-deployment.manifest.md */

# 🌐 Holistic Deployment Protocol (HDP)

1. **Soberanía de Secretos**: 
   - Las API Keys nunca se suben al repo. Se cargan manualmente en los dashboards de Vercel y Render.
2. **Sincronización de Base de Datos**: 
   - Antes de cada despliegue en Render, se debe ejecutar `npx prisma db push` desde GitHub Actions para asegurar que Neon.tech tiene la última versión del ADN (Esquema).
3. **Aislamiento de Carga**: 
   - El `orchestrator-api` es el único que habla con la DB. El `admin-dashboard` solo habla con el `orchestrator-api`.
4. **Widget Embeddable**: 
   - El widget generado es un "Micro-Frontend" que puede inyectarse en cualquier sitio web de prueba usando un `<script>` que apunte al bundle de Vercel.