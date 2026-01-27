/** apps/admin-dashboard/postcss.config.js */

/**
 * @name PostcssConfiguration
 * @description Punto de entrada para el procesamiento de estilos.
 * Requerido para que Next.js 16 transforme las reglas nativas de Tailwind v4.
 */
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    'autoprefixer': {},
  },
};
