/** apps/admin-dashboard/next.config.js */

const { withNx } = require('@nx/next');
const createNextIntlPlugin = require('next-intl/plugin');

/**
 * @name internationalizationPlugin
 * @description Configuración del motor de traducción para el Dashboard.
 */
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * @type {import('next').NextConfig}
 * @name nextConfiguration
 * @description Aparato de configuración maestra para Next.js 16.
 * Optimizado para el compilador Turbopack. Se utiliza JSDoc para mantener
 * la integridad de tipos sin requerir aserciones de TypeScript que rompan
 * el proceso de evaluación de Node.js en Vercel.
 */
const nextConfiguration = {
  /**
   * Integración con el ecosistema Nx.
   */
  nx: {
    scalableVectorGraphics: true,
  },

  /**
   * Habilitación de Partial Prerendering (PPR) para Next.js 16.
   */
  experimental: {
    partialPrerendering: true,
  },

  /**
   * Configuración de optimización de activos visuales.
   */
  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  /**
   * Implementación de cabeceras de seguridad de grado institucional.
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

module.exports = withNx(withNextIntl(nextConfiguration));
