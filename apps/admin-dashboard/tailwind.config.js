/** apps/admin-dashboard/tailwind.config.js */

/**
 * @name TailwindConfiguration
 * @description Aparato de configuración para el motor de diseño atómico Tailwind CSS.
 * Nivelado para la versión 4.0+, este archivo define los límites de escaneo semántico
 * dentro del monorepo, asegurando que tanto la aplicación como las piezas LEGO
 * (librerías compartidas) inyecten sus estilos en el bundle final de producción.
 */
module.exports = {
  /**
   * Definición de rutas de contenido.
   * Se incluyen las fuentes de la aplicación y las librerías de UI para
   * garantizar que el "Tree Shaking" de estilos sea preciso.
   */
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../libs/ui-kit/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  /**
   * Extensión del tema Obsidian & Milk.
   * La mayoría de las variables ahora residen en global.css por estándar v4,
   * este bloque se mantiene para futuras extensiones de plugins específicos.
   */
  theme: {
    extend: {},
  },

  plugins: [],
};
