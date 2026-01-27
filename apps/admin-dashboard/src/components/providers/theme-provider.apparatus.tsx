/** apps/admin-dashboard/src/components/providers/theme-provider.apparatus.tsx */

'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * @name ThemeProvider
 * @description Aparato de nivel de infraestructura visual. Envuelve el árbol 
 * de componentes para habilitar el cambio dinámico entre modos Obsidian (#000) y Milk (#FFF).
 */
export function ThemeProvider({ children, ...properties }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...properties}>{children}</NextThemesProvider>;
}