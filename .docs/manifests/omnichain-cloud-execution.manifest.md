/** .docs/manifests/omnichain-cloud-execution.manifest.md */

# ☁️ Omnisync Cloud-Native & Zero-Local Manifest

## 1. Filosofía de Ejecución
Omnisync-AI se desarrolla bajo el principio de "Huella Local Cero". No se requiere la instalación de bases de datos, motores de búsqueda o entornos de ejecución locales.

## 2. Ecosistema de Proveedores (Free Tiers)
| Capa | Proveedor | Recurso |
| :--- | :--- | :--- |
| **SQL Database** | Neon.tech | PostgreSQL Serverless (Migraciones vía GitHub Actions) |
| **Vector DB** | Qdrant Cloud | Motor RAG para manuales técnicos |
| **Cache/Memory** | Upstash | Redis para hilos de conversación |
| **Backend Apps** | Render | Apps de NestJS (Free Web Services) |
| **Frontend Admin** | Vercel | Dashboard Next.js 15 |
| **WA Gateway** | Railway / Render | Evolution API (Instancia Dockerizada) |

## 3. Validación y Pruebas (GitHub Actions)
Dado que no hay recursos locales, GitHub Actions es el único entorno de verdad.
- Cada `push` dispara una validación completa.
- Las migraciones de Prisma se ejecutan contra la base de datos de Neon en la nube durante el CI.
- Los secretos (`.env`) se gestionan exclusivamente en **GitHub Secrets**.

## 4. Despliegue de Evolution API (Sin Local)
Para evitar instalaciones locales, se utilizará el botón "Deploy to Render" o "Deploy to Railway" de la imagen oficial de Evolution API, conectándola a la URL de la base de datos de Neon.

---



---

