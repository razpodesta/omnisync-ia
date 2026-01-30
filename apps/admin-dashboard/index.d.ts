/** apps/admin-dashboard/index.d.ts */

/**
 * @section Declaraciones de Recursos Multimedia
 * Define el ADN para activos estáticos procesados por el motor de build (Webpack/Turbopack).
 */
declare module '*.svg' {
  import React from 'react';
  /** Representa la ruta URI del recurso */
  const content: string;
  /** Representa el recurso transformado en un componente React de alta fidelidad */
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

/**
 * @section Declaraciones de Librerías Externas
 * Nivelación para la soberanía de tipado en componentes de UI sin definiciones nativas.
 */
declare module 'react-world-flags' {
  import React from 'react';

  /**
   * @interface FlagProperties
   * @description Atributos inmutables para el renderizado de iconografía de soberanía territorial.
   */
  interface FlagProperties {
    /**
     * Código ISO 3166-1 (alpha-2, alpha-3 o numérico).
     * Ejemplos: 'ES', 'USA', 724.
     */
    code?: string | number;
    /** Clases de Tailwind CSS o CSS dinámico para Obsidian & Milk aesthetics */
    className?: string;
    /** Estilos de respaldo para el contenedor del SVG de la bandera */
    style?: React.CSSProperties;
    /** Texto alternativo para motores de accesibilidad (W3C Compliance) */
    alt?: string;
    /** Nodo visual a renderizar mientras el recurso se sincroniza o si falla */
    fallback?: React.ReactNode;
    /** Callback disparado ante una anomalía de carga detectada por el Sentinel */
    onError?: () => void;
  }

  /**
   * @name Flag
   * @description Componente funcional para la visualización de banderas internacionales.
   */
  const Flag: React.FC<FlagProperties>;
  export default Flag;
}
