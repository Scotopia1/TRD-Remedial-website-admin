'use client';

import { useReportWebVitals } from 'next/web-vitals';

/**
 * Web Vitals Monitoring Component
 *
 * Tracks Core Web Vitals metrics for performance monitoring:
 * - LCP (Largest Contentful Paint): Target <2500ms
 * - FID (First Input Delay): Target <100ms
 * - CLS (Cumulative Layout Shift): Target <0.1
 * - FCP (First Contentful Paint): Target <1800ms
 * - TTFB (Time to First Byte): Target <600ms
 * - INP (Interaction to Next Paint): Target <200ms
 *
 * Phase 2.1 Implementation - SEO Optimization
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
      });
    }

    // Ready for analytics integration (Google Analytics, Vercel Analytics, etc.)
    // Uncomment and configure when analytics service is set up:

    // Google Analytics 4 Integration
    // window.gtag?.('event', metric.name, {
    //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    //   metric_id: metric.id,
    //   metric_value: metric.value,
    //   metric_delta: metric.delta,
    //   metric_rating: metric.rating,
    // });

    // Vercel Analytics Integration
    // import { sendToVercelAnalytics } from '@vercel/analytics';
    // sendToVercelAnalytics(metric);

    // Custom Analytics Endpoint
    // fetch('/api/analytics/vitals', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     name: metric.name,
    //     value: metric.value,
    //     rating: metric.rating,
    //     delta: metric.delta,
    //     id: metric.id,
    //     navigationType: metric.navigationType,
    //   }),
    // });
  });

  return null;
}
