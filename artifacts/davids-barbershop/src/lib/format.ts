import type { HoursEntry, SiteSettings } from '@workspace/api-client-react';

export const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export function money(cents: number | null | undefined, opts: { cents?: boolean } = {}): string {
  if (cents == null) return '';
  const d = cents / 100;
  const whole = Number.isInteger(d);
  return `$${d.toLocaleString('en-US', {
    minimumFractionDigits: opts.cents || !whole ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

export function centsToDollarsInput(cents: number | null | undefined): string {
  if (cents == null) return '';
  return (cents / 100).toFixed(2).replace(/\.00$/, '');
}

export function dollarsToCents(v: string): number | null {
  const t = v.replace(/[$,\s]/g, '');
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

export function formatPhone(e164: string | undefined | null): string {
  if (!e164) return '';
  const d = e164.replace(/\D/g, '');
  const n = d.length === 11 && d.startsWith('1') ? d.slice(1) : d;
  if (n.length !== 10) return e164;
  return `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`;
}

export function telHref(e164: string | undefined | null): string {
  if (!e164) return 'tel:';
  const d = e164.replace(/[^\d+]/g, '');
  return `tel:${d.startsWith('+') ? d : `+${d.length === 10 ? '1' + d : d}`}`;
}

export function time12(hhmm: string | null): string {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hr}:${String(m).padStart(2, '0')} ${ap}` : `${hr} ${ap}`;
}

export function hoursLabel(h: HoursEntry): string {
  if (h.closed || !h.open || !h.close) return 'Closed';
  return `${time12(h.open)} – ${time12(h.close)}`;
}

export function fullAddress(s: SiteSettings): string {
  return `${s.streetAddress}, ${s.city}, ${s.region} ${s.postalCode}`;
}

export function assetUrl(u: string | null | undefined): string | undefined {
  if (!u) return undefined;
  if (/^https?:\/\//.test(u) || u.startsWith('data:')) return u;
  if (u.startsWith('/')) return `${basePath}${u}`;
  return u;
}

export function mediaUrl(file: string): string {
  return `${basePath}/media/${file}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

export function yearsSince(year: number): number {
  return new Date().getFullYear() - year;
}

export function todayName(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', timeZone: 'America/New_York' });
}

export function errorStatus(err: unknown): number | undefined {
  if (err && typeof err === 'object' && 'status' in err) {
    const s = (err as { status?: unknown }).status;
    return typeof s === 'number' ? s : undefined;
  }
  return undefined;
}

export function errorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const d = (err as { data?: { error?: string } }).data;
    if (d?.error) return d.error;
    if (err instanceof Error) return err.message;
  }
  return 'Something went wrong';
}
