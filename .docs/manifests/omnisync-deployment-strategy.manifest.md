/** .docs/manifests/omnisync-deployment-strategy.manifest.md */

# 🚢 Omnisync Deployment & CI/CD Strategy

## 1. Filosofía de Entrega
- **Independencia Atómica**: Cada aplicación (`orchestrator-api`, `comms-gateway`, `admin-dashboard`) posee su propio ciclo de vida de despliegue.
- **Validación Sentinel**: Ningún código se despliega si el aparato de Sentinel detecta una regresión en las interfaces de contratos (`core-contracts`).
- **Entornos Externos**: 
  - **Vercel**: Host oficial del `admin-dashboard` (Next.js).
  - **Render**: Host oficial de los microservicios NestJS.

## 2. Pipeline de GitHub Actions
1. **Lint & Format**: Verificación de reglas OEDP y Erradicación de Any.
2. **Build Test**: Compilación individual de cada pieza LEGO.
3. **Mirror Testing**: Ejecución de pruebas en el workspace `tests/`.
4. **Deploy**: Disparo de Webhooks de Render y CLI de Vercel.
2. Aparato de Orquestación: GitHub Actions Workflow
Este archivo automatiza la validación y el despliegue. Está diseñado para ser procesado por la nube de GitHub.
code
Yaml
/** .github/workflows/omnisync-pipeline.yml */

name: Omnisync Elite CI/CD

on:
  push:
    branches: [ master, main ]
  pull_request:
    branches: [ master, main ]

jobs:
  quality-assurance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js and PNPM
        uses: pnpm/action-setup@v3
        with:
          version: 10
      
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Nx Lint Check
        run: pnpm nx run-many -t lint --all

      - name: Nx Build Test (LEGO Integrity)
        run: pnpm nx run-many -t build --all

      - name: Mirror Testing (Logic Validation)
        run: pnpm nx test tests

  deploy-backend:
    needs: quality-assurance
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Render Deploy (Orchestrator)
        run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_ORCHESTRATOR }}
      
      - name: Trigger Render Deploy (Comms Gateway)
        run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_COMMS }}

  deploy-frontend:
    needs: quality-assurance
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: .
          vercel-args: '--prod'
3. Configuración de Plataformas (Independent Builds)
Para Vercel (admin-dashboard):
En el panel de Vercel, la configuración debe ser:
Build Command: npx nx build admin-dashboard --prod
Output Directory: dist/apps/admin-dashboard/.next
Root Directory: ./
Para Render (orchestrator-api):
En el panel de Render:
Build Command: pnpm install && npx nx build orchestrator-api --prod
Start Command: node dist/apps/orchestrator-api/main.js