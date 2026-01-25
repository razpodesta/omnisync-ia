/** .docs/manifests/omnisync-cloud-execution.manifest.md */

# ☁️ Omnisync Cloud-First & Zero-Local Manifest (CEIM)

## 1. Filosofía de Ejecución
Queda estrictamente prohibido depender de recursos locales (`localhost`, `127.0.0.1`) para el desarrollo y las pruebas. El ecosistema opera bajo el principio de "Soberanía Remota".

## 2. Ecosistema de Servicios (Tier Gratuito)
Para mantener la mantenibilidad y el costo cero en la fase MVP, se utilizan exclusivamente:
- **SQL / Persistencia**: Neon.tech (PostgreSQL Serverless).
- **Cache / Sesiones**: Upstash (Redis Cloud).
- **Vector DB / RAG**: Qdrant Cloud (Cluster Gratuito).
- **AI Engine**: Google AI Studio (Gemini 1.5 Flash).
- **WhatsApp Gateway**: Evolution API (Desplegada en Render o Railway - Free Tier).

## 3. Estrategia de Pruebas (Remote Mirror Testing)
Dado que no se dispone de recursos computacionales locales:
- **GitHub Actions**: Actúa como nuestro único entorno de validación (CI/CD).
- **Secrets de Entorno**: Todas las API Keys residen en `GitHub Repository Secrets`.
- **E2E Testing**: Se ejecutará mediante Playwright dentro de los runners de GitHub, conectando con las bases de datos de la nube en tiempo real.

## 4. Desarrollo Atómico
Los desarrolladores envían código (Push). El "Sentinel" en GitHub Actions valida la integridad, ejecuta los tests y reporta los resultados. Solo los builds exitosos en la nube son considerados válidos.