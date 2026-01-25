# 1. Crear el workspace de Nx con pnpm
pnpm dlx create-nx-workspace@latest raznode-ecosystem --preset=apps --packageManager=pnpm

# 2. Instalar dependencias core de alta performance
pnpm add @nestjs/graphql @nestjs/apollo apollo-server-express graphql next-intl next-themes
pnpm add zod clsx tailwind-merge framer-motion
pnpm add -D tailwindcss@next @tailwindcss/postcss postcss jest @testing-library/react

# 3. Crear las aplicaciones base
pnpm nx generate @nx/next:app apps/frontend-web --directory=apps/frontend-web --style=postcss
pnpm nx generate @nx/nest:app apps/backend-api --directory=apps/backend-api

# 4. Crear librerías compartidas iniciales
pnpm nx generate @nx/js:library libs/shared/logger --directory=libs/shared/logger
pnpm nx generate @nx/react:library libs/shared/ui-kit --directory=libs/shared/ui-kit --style=postcss
