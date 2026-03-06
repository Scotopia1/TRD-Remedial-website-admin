import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  // Optimize production builds
  productionBrowserSourceMaps: false,

  // Webpack configuration for bundle analysis and optimization
  webpack: (config, { isServer }) => {
    // Add bundle analyzer in production when ANALYZE env var is set
    if (process.env.ANALYZE === 'true') {
      // eslint-disable-next-line global-require
      const BundleAnalyzerPlugin = require('@next/bundle-analyzer')({
        enabled: true,
        openAnalyzer: !isServer,
      });
      config.plugins.push(BundleAnalyzerPlugin);
    }

    // Tree-shaking optimization for three.js
    config.module.rules.push({
      test: /three\.module\.js$/,
      sideEffects: false,
    });

    // Optimize GSAP imports (tree-shakeable)
    config.resolve.alias = {
      ...config.resolve.alias,
      'gsap': 'gsap/dist/gsap.js',
    };

    return config;
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Enhanced image optimization
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Aggressive image compression for production
    unoptimized: false,
  },

  // Headers for video and image files
  async headers() {
    return [
      {
        source: '/videos/:path*.mp4',
        headers: [
          {
            key: 'Content-Type',
            value: 'video/mp4',
          },
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/videos/:path*.webm',
        headers: [
          {
            key: 'Content-Type',
            value: 'video/webm',
          },
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/videos/:path*.webp',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Static JS/CSS immutable caching
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // API routes with stale-while-revalidate
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=300, stale-while-revalidate=60',
          },
        ],
      },
      // Security headers for all assets
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Turbopack configuration - root resolves multiple lockfile warning
  turbopack: { root: resolve(".") },

  // Compression settings
  compress: true,

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'gsap',
      '@gsap/react',
      'framer-motion',
    ],
    optimizeCss: true,
  },
};

export default nextConfig;
