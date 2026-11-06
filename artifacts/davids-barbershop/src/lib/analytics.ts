type AnalyticsData = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: {
      track(name: string, data?: AnalyticsData): void;
    };
    /** Defined in index.html. */
    gtag?: (...args: unknown[]) => void;
    /** Set by index.html when the Google tag loads on this page view. */
    __dbsGa?: boolean;
  }
}

/** GA4 records campaign tags and ad clicks itself, and counts page views from the URL. */
const GA_SKIP_PARAMS = new Set(['utm_source', 'utm_campaign', 'ad_click']);
const GA_SKIP_EVENTS = new Set(['landing_view']);

/**
 * Custom event to Replit Analytics and, on the live site, Google Analytics 4
 * (through the Google tag in index.html). A no-op where neither tracker is loaded.
 */
export function trackEvent(name: string, data?: AnalyticsData): void {
  if (typeof window === 'undefined') return;
  try {
    const clean = data && (Object.fromEntries(Object.entries(data).filter(([, v]) => v !== '')) as AnalyticsData);
    window.umami?.track(name, clean);
    if (window.__dbsGa && window.gtag && !GA_SKIP_EVENTS.has(name)) {
      const params = clean ? Object.fromEntries(Object.entries(clean).filter(([k]) => !GA_SKIP_PARAMS.has(k))) : {};
      window.gtag('event', name, params);
    }
  } catch {
    // Analytics must never break the app.
  }
}

/** "button-hero-book" → "hero", "link-mobilebar-call" → "mobilebar". */
export function placementFromTestId(testId: string): string {
  const p = testId.replace(/^(button|link)-/, '').replace(/^(book|call)-/, '').replace(/-(book|call)$/, '').replace(/-/g, '_');
  return p === 'book' || p === 'call' ? 'other' : p;
}

const OPT_OUT_KEY = 'dbs_analytics_off';
export const GA4_ID = 'G-K1CZTWPT3V';

/** True when this browser has turned Google Analytics off (read by index.html before the tag loads). */
export function analyticsOptedOut(): boolean {
  try {
    return window.localStorage.getItem(OPT_OUT_KEY) === '1';
  } catch {
    return false;
  }
}

/** Turns Google Analytics off for this browser at once, or back on from the next page load. */
export function setAnalyticsOptOut(off: boolean): void {
  try {
    if (off) {
      window.localStorage.setItem(OPT_OUT_KEY, '1');
      (window as unknown as Record<string, unknown>)[`ga-disable-${GA4_ID}`] = true;
      window.gtag?.('consent', 'update', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });
      window.__dbsGa = false;
    } else {
      window.localStorage.removeItem(OPT_OUT_KEY);
    }
  } catch {
    // Storage blocked: nothing was stored, so nothing to change.
  }
}
