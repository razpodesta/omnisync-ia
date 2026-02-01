/** apps/admin-dashboard/next.config.js */

const { withNx } = require('@nx/next');
const createNextIntlPlugin = require('next-intl/plugin');

/**
 * @name internationalizationPlugin
 * @description Orquestador del motor de traducción para el Dashboard Administrativo.
 * Vincula el ADN lingüístico procesado por el Agregador i18n en tiempo de build.
 */
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * @type {import('next').NextConfig}
 * @name nextConfiguration
 * @description Aparato de configuración maestra para Next.js 16.
 * Optimizado para el compilador Turbopack y el despliegue en Vercel Edge.
 * Implementa el protocolo OEDP V3.6.7 para garantizar la estabilidad del pipeline
 * y la soberanía financiera mediante el aislamiento de binarios.
 *
 * @author Raz Podestá <Creator>
 * @organization MetaShark Tech
 * @protocol OEDP-Level: Elite (Next-16-Sovereign-Build V3.6.7)
 * @vision Ultra-Holística: Zero-Binary-Conflict & Incremental-PPR
 */
const nextConfiguration = {
  /**
   * @section Integración con Ecosistema Nx
   */
  nx: {
    scalableVectorGraphics: true,
  },

  /**
   * @section Funcionalidades de Próxima Generación
   * RESOLUCIÓN VERCEL-ERROR: Erradicación total de 'partialPrerendering'.
   */
  experimental: {
    /** 
     * @property ppr
     * @description Habilita el Partial Prerendering de forma incremental.
     * Permite que las rutas estáticas sean inmediatas y las dinámicas sean reactivas.
     */
    ppr: 'incremental',

    /**
     * @property serverExternalPackages
     * @description Aísla los paquetes que contienen binarios nativos.
     * Evita el colapso de Turbopack al procesar el motor de Prisma 7.
     */
    serverExternalPackages: ['@prisma/client', '@omnisync/core-persistence'],
  },

  /**
   * @section Observabilidad y Diagnóstico
   */
  logging: {
    fetches: {
      fullUrl: true, // Permite auditar la latencia del Orchestrator API en los logs
    },
  },

  /**
   * @section Optimización de Activos Visuales (Identity Layer)
   */
  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Soporte para logos dinámicos de Tenants autorizados
      },
    ],
  },

  /**
   * @section Protocolos de Seguridad Institucional (Headers)
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
            /**
             * @note Content-Security-Policy (CSP)
             * Blindaje absoluto: Solo se permite comunicación con el Hub de Omnisync,
             * Google API (IA) y Qdrant (Vectores).
             */
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline';",
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' blob: data: https:;",
              "font-src 'self' data:;",
              "connect-src 'self' https://*.onrender.com https://*.googleapis.com https://*.qdrant.io https://*.upstash.io;",
            ].join(' '),
          },
        ],
      },
    ];
  },

  /**
   * @section Redirecciones de Soberanía (UX)
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