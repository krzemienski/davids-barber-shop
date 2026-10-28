import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowUpRight, Loader2, Phone, X } from 'lucide-react';
import type { SiteSettings } from '@workspace/api-client-react';
import { BOOKSY_ORIGIN, BookingContext, booksyProfileUrl, booksyWidgetUrl, type BookingRequest } from '@/lib/booking';
import { formatPhone, telHref } from '@/lib/format';
import { PoleRule, useSettings } from './site';

const SLOW_MS = 15000;

type Open = BookingRequest & { uniqueId: string };

function newUniqueId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `dbs-${crypto.randomUUID()}`;
  } catch {
    /* fall through */
  }
  return `dbs-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const { data: settings } = useSettings();
  const [current, setCurrent] = useState<Open | null>(null);
  const api = useMemo(() => ({ open: (r: BookingRequest) => setCurrent({ ...r, uniqueId: newUniqueId() }) }), []);
  return (
    <BookingContext.Provider value={api}>
      {children}
      {current && settings?.booksyBusinessId != null && (
        <BookingSheet key={current.uniqueId} request={current} settings={settings} businessId={settings.booksyBusinessId} onClose={() => setCurrent(null)} />
      )}
    </BookingContext.Provider>
  );
}

type BooksyMessage = { uniqueId?: unknown; events?: Record<string, unknown> };

function BookingSheet({ request, settings, businessId, onClose }: { request: Open; settings: SiteSettings; businessId: number; onClose: () => void }) {
  const { barber, service, uniqueId, onCompleted } = request;
  const frame = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'slow'>('loading');
  const src = useMemo(
    () => booksyWidgetUrl(businessId, uniqueId, { stafferId: barber?.booksyStafferId, variantId: service?.booksyVariantId }),
    [businessId, uniqueId, barber?.booksyStafferId, service?.booksyVariantId],
  );
  const fallbackUrl = barber?.booksyUrl ?? settings.booksyBusinessUrl ?? booksyProfileUrl(businessId);
  const firstName = barber?.name.split(' ')[0];
  const title = service ? service.name : firstName ? `Book with ${firstName}` : `Book at ${settings.shopName}`;

  const finish = useCallback((completed: boolean) => {
    if (completed) onCompleted?.();
    onClose();
  }, [onCompleted, onClose]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== BOOKSY_ORIGIN || e.source !== frame.current?.contentWindow) return;
      const data = e.data as BooksyMessage | null;
      if (!data || typeof data !== 'object' || data.uniqueId !== uniqueId || !data.events) return;
      const ev = data.events;
      if ('ready' in ev) setStatus('loaded');
      if ('goToUrl' in ev) {
        const url = (ev.goToUrl as { url?: unknown } | null)?.url;
        if (typeof url === 'string' && url.startsWith('https://')) {
          const w = window.open(url, '_blank');
          if (w) w.opener = null;
          else window.location.assign(url);
        }
      }
      if ('close' in ev) finish((ev.close as { appointmentCompleted?: unknown } | null)?.appointmentCompleted === true);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [uniqueId, finish]);

  useEffect(() => {
    if (status !== 'loading') return;
    const t = window.setTimeout(() => setStatus('slow'), SLOW_MS);
    return () => window.clearTimeout(t);
  }, [status]);

  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-ink/85 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          data-testid="dialog-booking"
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed z-[61] inset-0 flex flex-col bg-ink outline-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-[min(880px,calc(100dvh-3rem))] sm:w-[min(820px,calc(100vw-3rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:border sm:border-gold/30 sm:shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98]"
        >
          <header className="flex items-start gap-4 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-7 sm:pt-5">
            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.32em] text-gold">Book your chair</p>
              <Dialog.Title className="mt-1 truncate font-display text-2xl text-bone sm:text-3xl" data-testid="text-booking-title">{title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-bone/55">
                Booking is handled by Booksy. What you enter goes to Booksy, not to us.
              </Dialog.Description>
            </div>
            <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" data-testid="link-booking-open-booksy"
              className="hidden shrink-0 items-center gap-1 pt-1 text-xs text-bone/65 transition-colors hover:text-gold sm:inline-flex">
              Open in Booksy <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <Dialog.Close className="-mr-2 -mt-1 shrink-0 p-2 text-bone/80 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold" aria-label="Close booking" data-testid="button-booking-close">
              <X className="h-6 w-6" />
            </Dialog.Close>
          </header>
          <PoleRule />
          {barber && barber.booksyStafferId == null && (
            <p className="border-b border-gold/20 bg-gold/10 px-5 py-2 text-xs text-bone/85 sm:px-7" data-testid="text-booking-barber-hint">
              Choose {firstName} when Booksy asks who you&rsquo;d like.
            </p>
          )}
          <div className="relative flex-1 bg-white">
            <iframe
              ref={frame}
              src={src}
              title={`Booksy booking for ${settings.shopName}`}
              allow="payment"
              onLoad={() => setStatus('loaded')}
              className="absolute inset-0 h-full w-full border-0"
              data-testid="iframe-booksy"
            />
            {status !== 'loaded' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink px-6 text-center" data-testid="status-booking-loading">
                {status === 'loading' ? (
                  <>
                    <Loader2 className="h-7 w-7 animate-spin text-gold" />
                    <p className="text-sm text-bone/70">Loading Booksy&hellip;</p>
                  </>
                ) : (
                  <>
                    <p className="font-display text-2xl text-bone">Booksy is taking too long.</p>
                    <p className="max-w-sm text-sm text-bone/70">You can book on Booksy&rsquo;s own site, or call and we&rsquo;ll fit you in.</p>
                    <div className="mt-2 flex flex-wrap justify-center gap-3">
                      <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" data-testid="link-booking-fallback"
                        className="inline-flex h-12 items-center gap-2 rounded-sm bg-gold px-6 text-sm font-semibold text-ink hover:bg-[hsl(42_60%_68%)]">
                        Open Booksy <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                      <a href={telHref(settings.phone)} data-testid="link-booking-call"
                        className="inline-flex h-12 items-center gap-2 rounded-sm border border-gold/60 px-6 text-sm font-semibold text-bone hover:border-gold">
                        <Phone className="h-4 w-4" /> {formatPhone(settings.phone)}
                      </a>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <a href={fallbackUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 border-t border-gold/15 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-xs text-bone/65 hover:text-gold sm:hidden">
            Open in Booksy instead <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
