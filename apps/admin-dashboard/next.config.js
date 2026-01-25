/** apps/admin-dashboard/next.config.ts */

import { withNx } from '@nx/next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  nx: { svgr: true },
  experimental: {
    // Preparados para Next.js 16 Partial Prerendering
    ppr: true, 
  },
  // Seguridad de cabeceras para Vercel
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: []
  }
};

export default withNx(withNextIntl(nextConfig));