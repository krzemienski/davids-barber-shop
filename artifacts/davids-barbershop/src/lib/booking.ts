import { createContext, useContext } from 'react';
import type { Barber, Service, SiteSettings } from '@workspace/api-client-react';
import { getAttribution } from './tracking';

export const BOOKSY_ORIGIN = 'https://booksy.com';

export type BookingRequest = {
  barber?: Barber | null;
  service?: Service | null;
  /** Called when Booksy reports that a booking was made in this session. */
  onCompleted?: () => void;
};

export const BookingContext = createContext<{ open: (r: BookingRequest) => void } | null>(null);
export const useBooking = () => useContext(BookingContext);

/**
 * The widget opens inside the site when a business ID is set. A barber with a
 * custom Booksy link but no staff ID keeps that link, since the widget can't
 * reproduce what the link selects.
 */
export function canUseWidget(barber: Pick<Barber, 'booksyStafferId' | 'booksyUrl'> | null | undefined, s: SiteSettings | undefined): boolean {
  if (s?.booksyBusinessId == null) return false;
  return !(barber && barber.booksyStafferId == null && barber.booksyUrl);
}

/** Booksy's own short link to a business, used when there is no business URL. */
export const booksyProfileUrl = (businessId: number) => `${BOOKSY_ORIGIN}/en-us/dl/show-business/${businessId}`;

/**
 * Booksy widget page. `stafferId` and `variantId` are read by Booksy's widget
 * app but are not documented by Booksy; a wrong ID shows Booksy's own error
 * over the full service list. See docs/research/booksy-integration.md.
 */
export function booksyWidgetUrl(businessId: number, uniqueId: string, opts: { stafferId?: number | null; variantId?: number | null }): string {
  const url = new URL(`${BOOKSY_ORIGIN}/widget-2021/index.html`);
  const p = url.searchParams;
  p.set('id', String(businessId));
  p.set('country', 'us');
  p.set('lang', 'en');
  p.set('mode', 'dialog');
  p.set('theme', 'default');
  p.set('uniqueId', uniqueId);
  if (opts.stafferId != null) p.set('stafferId', String(opts.stafferId));
  if (opts.variantId != null) p.set('variantId', String(opts.variantId));
  const a = getAttribution();
  const utm: [string, string | null][] = [
    ['utm_source', a.utmSource], ['utm_medium', a.utmMedium], ['utm_campaign', a.utmCampaign],
    ['utm_content', a.utmContent], ['utm_term', a.utmTerm],
  ];
  for (const [k, v] of utm) if (v) p.set(k, v);
  return url.toString();
}
