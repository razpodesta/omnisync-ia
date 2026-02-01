/** apps/admin-dashboard/next.config.js */

const { withNx } = require('@nx/next');
const createNextIntlPlugin = require('next-intl/plugin');

/**
 * @name internationalizationPlugin
 * @description Orquestador del motor de traducción para el Dashboard Administrativo.
 * Vincula el ADN lingüístico procesado por el Aggregator.
 */
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * @type {import('next').NextConfig}
 * @name nextConfiguration
 * @description Aparato de configuración maestra para Next.js 16.
 * Optimizado para el compilador Turbopack y el despliegue en Vercel Edge.
 * Implementa el protocolo OEDP para garantizar soberanía de datos y performance.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Next-16-Turbopack-Standard V3.6.3)
 */
const nextConfiguration = {
  /**
   * @section Integración con Ecosistema Nx
   */
  nx: {
    scalableVectorGraphics: true,
  },

  /**
   * @section Funcionalidades Experimentales de Élite
   * RESOLUCIÓN VERCEL-ERROR: Se actualiza 'partialPrerendering' al estándar Next 16.
   */
  experimental: {
    ppr: 'incremental',
    /**
     * @note Aislamiento de Paquetes de Servidor
     * Evita que el compilador intente procesar binarios nativos de persistencia.
     */
    serverExternalPackages: ['@prisma/client'],
  },

  /**
   * @section Observabilidad de Red
   * Habilita trazas detalladas en Vercel Logs para auditoría de latencia neural.
   */
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  /**
   * @section Optimización de Activos Visuales
   */
  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Permitir logos dinámicos de los Tenants
      },
    ],
  },

  /**
   * @section Protocolos de Seguridad de Grado Institucional
   * Implementación de cabeceras de blindaje para proteger el Dashboard.
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
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self' data:; connect-src 'self' https://*.onrender.com https://*.googleapis.com https://*.qdrant.io;",
          },
        ],
      },
    ];
  },

  /**
   * @section Redirecciones de Soberanía
   */
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/es/dashboard',
        permanent: true,
      },
    ];
  },
};

module.exports = withNx(withNextIntl(nextConfiguration));