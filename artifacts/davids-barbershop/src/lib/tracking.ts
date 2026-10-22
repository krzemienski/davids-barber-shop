import { createContext, useCallback, useContext } from 'react';
import { useTrackEvent } from '@workspace/api-client-react';
import type { TrackEventInput } from '@workspace/api-client-react';

const ATTR_KEY = 'dbs_attribution';
const SESSION_KEY = 'dbs_session_id';

export type Attribution = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  gclid: string | null;
  fbclid: string | null;
};

const EMPTY: Attribution = {
  utmSource: null, utmMedium: null, utmCampaign: null, utmContent: null, utmTerm: null, gclid: null, fbclid: null,
};

function safeStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

function uuid(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** First-touch capture. Call once on app boot. Never throws. */
export function captureAttribution(): void {
  try {
    const ls = safeStorage();
    if (!ls) return;
    if (!ls.getItem(SESSION_KEY)) ls.setItem(SESSION_KEY, uuid());
    const existing = getAttribution();
    const p = new URLSearchParams(window.location.search);
    const incoming: Attribution = {
      utmSource: p.get('utm_source'),
      utmMedium: p.get('utm_medium'),
      utmCampaign: p.get('utm_campaign'),
      utmContent: p.get('utm_content'),
      utmTerm: p.get('utm_term'),
      gclid: p.get('gclid'),
      fbclid: p.get('fbclid'),
    };
    const next: Attribution = { ...existing };
    let changed = false;
    (Object.keys(incoming) as (keyof Attribution)[]).forEach((k) => {
      if (!next[k] && incoming[k]) {
        next[k] = incoming[k]!.slice(0, 300);
        changed = true;
      }
    });
    if (changed || !ls.getItem(ATTR_KEY)) ls.setItem(ATTR_KEY, JSON.stringify(next));
  } catch {
    /* tracking must never throw */
  }
}

export function getAttribution(): Attribution {
  try {
    const raw = safeStorage()?.getItem(ATTR_KEY);
    if (!raw) return { ...EMPTY };
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<Attribution>) };
  } catch {
    return { ...EMPTY };
  }
}

export function getSessionId(): string {
  try {
    const ls = safeStorage();
    let id = ls?.getItem(SESSION_KEY);
    if (!id) {
      id = uuid();
      ls?.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return uuid();
  }
}

/** Landing-page context so any Book/Call button inside knows its slug + variant. */
export type LandingCtx = { slug: string; variant: 'A' | 'B' } | null;
export const LandingContext = createContext<LandingCtx>(null);

export function getVariant(slug: string, hasB: boolean): 'A' | 'B' {
  if (!hasB) return 'A';
  try {
    const ls = safeStorage();
    const key = `dbs_variant_${slug}`;
    const v = ls?.getItem(key);
    if (v === 'A' || v === 'B') return v;
    const pick: 'A' | 'B' = Math.random() < 0.5 ? 'A' : 'B';
    ls?.setItem(key, pick);
    return pick;
  } catch {
    return 'A';
  }
}

type DL = { push: (o: Record<string, unknown>) => void };

function pushDataLayer(event: string, barber: string | null) {
  try {
    const w = window as unknown as { dataLayer?: DL | Record<string, unknown>[] };
    if (!w.dataLayer) w.dataLayer = [];
    (w.dataLayer as DL).push({ event, barber: barber ?? undefined });
  } catch {
    /* ignore */
  }
}

export type TrackOpts = { barberId?: number | null; barberName?: string | null };

/** Returns a fire-and-forget tracker. Never blocks navigation, never throws. */
export function useTracker() {
  const landing = useContext(LandingContext);
  const { mutate } = useTrackEvent();
  return useCallback(
    (type: TrackEventInput['type'], opts: TrackOpts = {}) => {
      try {
        const a = getAttribution();
        const data: TrackEventInput = {
          type,
          sessionId: getSessionId(),
          path: (window.location.pathname + window.location.search).slice(0, 500),
          barberId: opts.barberId ?? null,
          landingPageSlug: landing?.slug ?? null,
          variant: landing?.variant ?? null,
          ...a,
        };
        if (type !== 'landing_view') pushDataLayer(type, opts.barberName ?? null);
        mutate({ data }, { onError: () => undefined });
      } catch {
        /* ignore */
      }
    },
    [landing, mutate],
  );
}
