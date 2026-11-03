type AnalyticsData = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: {
      track(name: string, data?: AnalyticsData): void;
    };
  }
}

/** Replit Analytics custom event. A no-op in development and before the published tracker loads. */
export function trackEvent(name: string, data?: AnalyticsData): void {
  if (typeof window === 'undefined') return;
  try {
    const clean = data && (Object.fromEntries(Object.entries(data).filter(([, v]) => v !== '')) as AnalyticsData);
    window.umami?.track(name, clean);
  } catch {
    // Analytics must never break the app.
  }
}

/** "button-hero-book" → "hero", "link-mobilebar-call" → "mobilebar". */
export function placementFromTestId(testId: string): string {
  const p = testId.replace(/^(button|link)-/, '').replace(/^(book|call)-/, '').replace(/-(book|call)$/, '').replace(/-/g, '_');
  return p === 'book' || p === 'call' ? 'other' : p;
}
