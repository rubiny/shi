'use client';

type MetricName = 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';

interface Metric {
  name: MetricName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

const THRESHOLDS: Record<MetricName, [number, number]> = {
  CLS: [0.1, 0.25],
  FID: [100, 300],
  FCP: [1800, 3000],
  LCP: [2500, 4000],
  TTFB: [800, 1800],
  INP: [200, 500],
};

function getRating(name: MetricName, value: number): Metric['rating'] {
  const [good, poor] = THRESHOLDS[name] || [0, 0];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

function sendToAnalytics(metric: Metric) {
  // Send to PostHog if available
  if (typeof window !== 'undefined') {
    const posthog = (window as unknown as Record<string, unknown>).posthog as {
      capture?: (event: string, properties: Record<string, unknown>) => void;
    } | undefined;

    if (posthog?.capture) {
      posthog.capture('web_vital', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_rating: metric.rating,
        metric_delta: metric.delta,
        metric_id: metric.id,
      });
    }
  }

  // Send to custom analytics endpoint if configured
  const analyticsUrl = process.env.NEXT_PUBLIC_ANALYTICS_URL;
  if (analyticsUrl) {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      page: typeof window !== 'undefined' ? window.location.pathname : '/',
      timestamp: Date.now(),
    });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(`${analyticsUrl}/vitals`, body);
    } else {
      fetch(`${analyticsUrl}/vitals`, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {});
    }
  }
}

export function initWebVitals() {
  if (typeof window === 'undefined') return;

  // Use PerformanceObserver API (no external dependency)
  try {
    // LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        const value = lastEntry.startTime;
        sendToAnalytics({
          name: 'LCP',
          value,
          rating: getRating('LCP', value),
          delta: value,
          id: `lcp-${Date.now()}`,
        });
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // FCP
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          const value = entry.startTime;
          sendToAnalytics({
            name: 'FCP',
            value,
            rating: getRating('FCP', value),
            delta: value,
            id: `fcp-${Date.now()}`,
          });
        }
      }
    });
    fcpObserver.observe({ type: 'paint', buffered: true });

    // CLS
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!layoutShift.hadRecentInput && layoutShift.value) {
          clsValue += layoutShift.value;
        }
      }
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    // Report CLS on page hide
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        sendToAnalytics({
          name: 'CLS',
          value: clsValue,
          rating: getRating('CLS', clsValue),
          delta: clsValue,
          id: `cls-${Date.now()}`,
        });
      }
    });

    // TTFB
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (navEntry) {
      const value = navEntry.responseStart;
      sendToAnalytics({
        name: 'TTFB',
        value,
        rating: getRating('TTFB', value),
        delta: value,
        id: `ttfb-${Date.now()}`,
      });
    }
  } catch {
    // PerformanceObserver not supported
  }
}
