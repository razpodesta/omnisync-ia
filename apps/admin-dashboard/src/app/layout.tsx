/** apps/admin-dashboard/src/app/layout.tsx */

import React from 'react';

/**
 * @name RootLayout
 * @description Punto de entrada técnico y absoluto para el árbol de componentes.
 * Siguiendo el estándar de arquitectura de internacionalización, este layout actúa
 * únicamente como un contenedor pasante (Pass-Through) para delegar la construcción
 * del documento HTML al layout de localización dinámico.
 *
 * @param {Object} properties - Propiedades del componente.
 * @param {React.ReactNode} properties.children - Nodos hijos que representan la aplicación.
 * @returns {React.ReactNode} El árbol de componentes sin modificaciones estructurales.
 */
export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}): React.ReactNode {
  return children;
}
