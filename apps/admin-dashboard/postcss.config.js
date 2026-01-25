/** apps/admin-dashboard/postcss.config.js */

/**
 * @name PostcssConfiguration
 * @description Aparato de configuración para el procesamiento de estilos CSS.
 * Nivelado específicamente para Tailwind CSS v4 y Next.js 16. Sustituye la 
 * invocación directa del motor por el plugin especializado de PostCSS para 
 * garantizar la compatibilidad con el compilador Turbopack en Vercel.
 */
module.exports = {
  plugins: {
    /** 
     * Invocación del plugin oficial de Tailwind v4 para PostCSS.
     * Requerido por el estándar de la versión 4.0+.
     */
    '@tailwindcss/postcss': {},
    
    /** 
     * Plugin para la adición automática de prefijos de navegadores, 
     * asegurando la consistencia visual en entornos de producción.
     */
    'autoprefixer': {},
  },
};