/** apps/admin-dashboard/index.d.ts */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @section Declaraciones de Recursos
 */
declare module '*.svg' {
  const content: any;
  export const ReactComponent: any;
  export default content;
}

/**
 * @section Declaraciones de Librerías Externas
 * Nivelación para la soberanía de tipado en componentes de UI.
 */
declare module 'react-world-flags' {
  import React from 'react';

  /**
   * @interface FlagProperties
   * @description Propiedades para el renderizado de iconografía de soberanía territorial.
   */
  interface FlagProperties {
    /** Código ISO 3166-1 (alpha-2, alpha-3 o numérico) */
    code?: string | number;
    /** Clases de Tailwind o CSS dinámico */
    className?: string;
    /** Estilos de respaldo para el contenedor */
    style?: React.CSSProperties;
    /** Texto alternativo para motores de accesibilidad */
    alt?: string;
    /** Callback para gestión de fallos de carga de recurso */
    onError?: () => void;
  }

  /**
   * @name Flag
   * @description Componente para visualización de banderas internacionales.
   */
  const Flag: React.FC<FlagProperties>;
  export default Flag;
}
