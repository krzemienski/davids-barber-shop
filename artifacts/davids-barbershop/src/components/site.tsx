import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { Link, useLocation } from 'wouter';
import { Phone, CalendarCheck, Menu, X, Instagram, MapPin, Clock, ArrowUpRight, Scissors, RotateCw } from 'lucide-react';
import { useGetSiteSettings } from '@workspace/api-client-react';
import type { Barber, SiteSettings, Service, Testimonial } from '@workspace/api-client-react';
import { getAttribution, useTracker } from '@/lib/tracking';
import { assetUrl, basePath, formatPhone, fullAddress, hoursLabel, initials, money, telHref, todayName } from '@/lib/format';
import { cn } from '@/lib/utils';

export const useSettings = () => useGetSiteSettings();

/* ---------- Logo ---------- */
export function Wordmark({ className, small }: { className?: string; small?: boolean }) {
  return (
    <span className={cn('flex items-center gap-3', className)}>
      <img src={`${basePath}/favicon.svg`} alt="" className={small ? 'h-8 w-8' : 'h-10 w-10'} />
      <span className="leading-none">
        <span className={cn('block font-display font-bold text-gold tracking-wide', small ? 'text-xl' : 'text-2xl')}>David&rsquo;s</span>
        <span className="block text-[9.5px] font-semibold tracking-[0.42em] text-bone/80 mt-1">BARBER SHOP · 1972</span>
      </span>
    </span>
  );
}

/* ---------- Reveal ---------- */
export function Reveal({ children, className, delay = 0, as: As = 'div' }: { children: ReactNode; className?: string; delay?: number; as?: 'div' | 'section' | 'li' }) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { setInView(true); io.disconnect(); } }, { rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const style: CSSProperties = { transitionDelay: `${delay}ms` };
  return (
    <As ref={ref as never} style={style} className={cn('reveal', inView && 'in', className)}>
      {children}
    </As>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold', className)}>
      <span className="h-px w-8 bg-gold/70" />
      {children}
    </p>
  );
}

export function PoleRule({ className, animate }: { className?: string; animate?: boolean }) {
  return <div aria-hidden className={cn('pole-rule', animate && 'animate', className)} />;
}

/* ---------- Book + Call ---------- */
export function bookUrlFor(barber: Pick<Barber, 'booksyUrl'> | null | undefined, s: SiteSettings | undefined): string | null {
  const raw = barber?.booksyUrl ?? s?.booksyBusinessUrl ?? null;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const a = getAttribution();
    const utm: [string, string | null][] = [
      ['utm_source', a.utmSource], ['utm_medium', a.utmMedium], ['utm_campaign', a.utmCampaign],
      ['utm_content', a.utmContent], ['utm_term', a.utmTerm],
    ];
    for (const [k, v] of utm) if (v && !url.searchParams.has(k)) url.searchParams.set(k, v);
    return url.toString();
  } catch {
    return raw;
  }
}

/** Booksy has no verified way to preselect a barber, so say so when a barber button opens the shop page. */
export function BooksyBarberNote({ settings, barber, className }: { settings: SiteSettings | undefined; barber: Barber | null | undefined; className?: string }) {
  if (!barber || barber.booksyUrl || !settings?.booksyBusinessUrl) return null;
  return (
    <p data-testid="text-booksy-barber-note" className={cn('text-xs text-bone/55', className)}>
      Opens the shop&rsquo;s Booksy page. Choose {barber.name.split(' ')[0]} when you pick your time.
    </p>
  );
}

type BtnVariant = 'gold' | 'outline' | 'ghost' | 'bare';
const btnBase = 'group inline-flex shrink-0 whitespace-nowrap items-center justify-center gap-2 font-semibold tracking-wide transition-[transform,background-color,color,border-color] duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const btnVariants: Record<BtnVariant, string> = {
  gold: 'bg-gold text-ink hover:bg-[hsl(42_60%_68%)] shadow-[0_10px_30px_-10px_hsl(var(--gold)/0.6)]',
  outline: 'border border-gold/60 text-bone hover:border-gold hover:bg-gold/10',
  ghost: 'text-bone hover:text-gold',
  bare: '',
};
const btnSizes = { sm: 'h-9 px-4 text-xs rounded-sm', md: 'h-12 px-6 text-sm rounded-sm', lg: 'h-14 px-8 text-[15px] rounded-sm' };

export function CallLink({ settings, className, children, variant = 'outline', size = 'md', testId = 'link-call', barber }: {
  settings: SiteSettings | undefined; className?: string; children?: ReactNode; variant?: BtnVariant; size?: keyof typeof btnSizes; testId?: string; barber?: Pick<Barber, 'id' | 'name'> | null;
}) {
  const track = useTracker();
  if (!settings) return null;
  return (
    <a
      href={telHref(settings.phone)}
      data-testid={testId}
      onClick={() => track('call_click', { barberId: barber?.id ?? null, barberName: barber?.name ?? null })}
      className={cn(variant !== 'bare' && btnBase, variant !== 'bare' && btnSizes[size], btnVariants[variant], className)}
    >
      {children ?? (<><Phone className="h-4 w-4" /> {formatPhone(settings.phone)}</>)}
    </a>
  );
}

export function BookButton({ settings, barber, className, label, variant = 'gold', size = 'md', testId = 'button-book' }: {
  settings: SiteSettings | undefined; barber?: Barber | null; className?: string; label?: string; variant?: BtnVariant; size?: keyof typeof btnSizes; testId?: string;
}) {
  const track = useTracker();
  if (!settings) return <span className={cn(btnBase, btnSizes[size], 'bg-gold/30 text-ink/60 animate-pulse', className)}>Book</span>;
  const url = bookUrlFor(barber, settings);
  const text = label ?? (barber ? `Book with ${barber.name.split(' ')[0]}` : 'Book now');
  if (!url) {
    return (
      <CallLink settings={settings} variant={variant} size={size} className={className} testId={testId} barber={barber}>
        <Phone className="h-4 w-4" /> Call to book
      </CallLink>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={testId}
      onClick={() => track('book_click', { barberId: barber?.id ?? null, barberName: barber?.name ?? null })}
      className={cn(btnBase, btnSizes[size], btnVariants[variant], className)}
    >
      <CalendarCheck className="h-4 w-4" />
      {text}
      <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
}

/* ---------- Banner ---------- */
export function AnnouncementBanner({ settings }: { settings: SiteSettings | undefined }) {
  if (!settings?.announcementBanner) return null;
  return (
    <div data-testid="text-announcement" className="relative z-50 bg-oxblood text-bone text-center text-xs sm:text-[13px] font-medium tracking-wide px-4 py-2">
      {settings.announcementBanner}
    </div>
  );
}

/* ---------- Header ---------- */
const NAV = [
  { href: '/barbers', label: 'Barbers' },
  { href: '/services', label: 'Services' },
  { href: '/our-story', label: 'Our Story' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/visit', label: 'Visit' },
];

export function Header({ settings, transparent }: { settings: SiteSettings | undefined; transparent?: boolean }) {
  const [loc] = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => setOpen(false), [loc]);
  const solid = !transparent || scrolled || open;
  return (
    <header className={cn('sticky top-0 z-40 transition-colors duration-300', solid ? 'bg-ink/92 backdrop-blur-md border-b border-gold/15' : 'bg-transparent border-b border-transparent')}>
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" data-testid="link-home" aria-label="David's Barber Shop home"><Wordmark small /></Link>
        <nav className="hidden lg:flex items-center gap-8">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} data-testid={`link-nav-${n.label.toLowerCase().replace(/\s/g, '-')}`}
              className={cn('relative text-[13px] font-medium tracking-wide transition-colors hover:text-gold', loc.startsWith(n.href) ? 'text-gold' : 'text-bone/85')}>
              {n.label}
              {loc.startsWith(n.href) && <span className="absolute -bottom-2 left-0 right-0 h-px bg-gold" />}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          <CallLink settings={settings} variant="ghost" size="sm" testId="link-header-call" className="font-mono text-[13px] tracking-normal" />
          <BookButton settings={settings} size="sm" testId="button-header-book" />
        </div>
        <button className="lg:hidden p-2 -mr-2 text-bone" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} data-testid="button-menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-gold/15 bg-ink px-5 pb-8 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col">
            {NAV.map((n, i) => (
              <Link key={n.href} href={n.href} className="flex items-baseline justify-between border-b border-border py-4 font-display text-3xl text-bone hover:text-gold" data-testid={`link-mobile-${n.href.slice(1)}`}>
                {n.label}
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

/* ---------- Mobile bottom bar ---------- */
export function MobileBar({ settings, barber }: { settings: SiteSettings | undefined; barber?: Barber | null }) {
  return (
    <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-gold/25 bg-ink/95 backdrop-blur-md px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-[1fr_1.4fr] gap-2.5">
        <CallLink settings={settings} barber={barber} testId="link-mobilebar-call" className="h-12 w-full">
          <Phone className="h-4 w-4" /> Call
        </CallLink>
        <BookButton settings={settings} barber={barber} className="h-12 w-full" testId="button-mobilebar-book" label={barber ? `Book ${barber.name.split(' ')[0]}` : 'Book now'} />
      </div>
    </div>
  );
}

/* ---------- Hours ---------- */
export function HoursTable({ settings, compact }: { settings: SiteSettings; compact?: boolean }) {
  const today = todayName();
  return (
    <ul className={cn('divide-y divide-border/70', compact ? 'text-sm' : 'text-[15px]')} data-testid="list-hours">
      {settings.hours.map((h) => {
        const isToday = h.day === today;
        const closed = h.closed || !h.open;
        return (
          <li key={h.day} className={cn('flex items-center justify-between py-2.5', isToday && 'text-gold')}>
            <span className="flex items-center gap-2">
              {h.day}
              {isToday && <span className="rounded-full border border-gold/50 px-2 py-px text-[10px] uppercase tracking-widest">Today</span>}
            </span>
            <span className={cn('font-mono text-[13px]', closed && 'text-[hsl(354_60%_62%)] font-semibold uppercase tracking-wider')}>
              {closed ? `Closed ${h.day}s` : hoursLabel(h)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function closedDaysLine(s: SiteSettings): string | null {
  const closed = s.hours.filter((h) => h.closed || !h.open).map((h) => `${h.day}s`);
  if (!closed.length) return null;
  return `Closed ${closed.join(' & ')}`;
}

/* ---------- Footer ---------- */
export function Footer({ settings }: { settings: SiteSettings | undefined }) {
  return (
    <footer className="relative z-10 bg-ink border-t border-gold/15 pb-28 lg:pb-0">
      <PoleRule />
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4 space-y-5">
          <img src={`${basePath}/logo.svg`} alt="David's Barber Shop" className="h-16 w-auto" />
          {settings && (
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              A father-and-son shop on the Upper East Side, cutting hair since {settings.foundedYear}.
            </p>
          )}
          {settings?.instagramUrl && (
            <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" data-testid="link-footer-instagram"
              className="inline-flex items-center gap-2 text-sm text-bone hover:text-gold transition-colors">
              <Instagram className="h-4 w-4" /> Instagram
            </a>
          )}
        </div>
        <div className="md:col-span-4 space-y-4 text-sm">
          <h3 className="text-[11px] uppercase tracking-[0.3em] text-gold">Find us</h3>
          {settings ? (
            <>
              <p className="flex gap-3 text-bone"><MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" />{fullAddress(settings)}</p>
              <CallLink settings={settings} variant="bare" testId="link-footer-call" className="flex gap-3 font-mono text-bone hover:text-gold">
                <Phone className="h-4 w-4 text-gold" /> {formatPhone(settings.phone)}
              </CallLink>
              <a href={`mailto:${settings.email}`} className="block text-muted-foreground hover:text-gold" data-testid="link-footer-email">{settings.email}</a>
            </>
          ) : <SkeletonLines n={3} />}
        </div>
        <div className="md:col-span-4 text-sm">
          <h3 className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold"><Clock className="h-3.5 w-3.5" /> Hours</h3>
          {settings ? <HoursTable settings={settings} compact /> : <SkeletonLines n={7} />}
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} {settings?.shopName ?? "David's Barber Shop"}</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gold" data-testid="link-privacy">Privacy</Link>
            <Link href="/admin" className="opacity-50 hover:opacity-100 hover:text-gold" data-testid="link-staff">Staff</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Layout ---------- */
export function PublicLayout({ children, transparentHeader, barber }: { children: ReactNode; transparentHeader?: boolean; barber?: Barber | null }) {
  const { data: settings } = useSettings();
  const [loc] = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [loc]);
  return (
    <div className="grain min-h-[100dvh] flex flex-col">
      <AnnouncementBanner settings={settings} />
      <Header settings={settings} transparent={transparentHeader} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <MobileBar settings={settings} barber={barber} />
    </div>
  );
}

export function PageHero({ eyebrow, title, intro, image }: { eyebrow: string; title: ReactNode; intro?: ReactNode; image?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-gold/15">
      {image && (
        <>
          <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        </>
      )}
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 pt-16 pb-14 md:pt-24 md:pb-20">
        <div className="rise"><Eyebrow>{eyebrow}</Eyebrow></div>
        <h1 className="rise mt-5 font-display text-5xl md:text-7xl leading-[0.95] text-bone max-w-4xl" style={{ animationDelay: '80ms' }}>{title}</h1>
        {intro && <div className="rise mt-6 max-w-2xl text-base md:text-lg text-bone/75 leading-relaxed" style={{ animationDelay: '160ms' }}>{intro}</div>}
      </div>
    </section>
  );
}

/* ---------- Barber pieces ---------- */
export function BarberPortrait({ barber, className }: { barber: Pick<Barber, 'name' | 'photoUrl'>; className?: string }) {
  const [broken, setBroken] = useState(false);
  const src = assetUrl(barber.photoUrl);
  if (src && !broken) {
    return <img src={src} alt={`${barber.name}, barber`} onError={() => setBroken(true)} className={cn('h-full w-full object-cover', className)} loading="lazy" />;
  }
  return (
    <div className={cn('tile-floor relative flex h-full w-full items-center justify-center overflow-hidden', className)} aria-label={barber.name}>
      <div className="absolute inset-6 border border-gold/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
      <div className="relative flex flex-col items-center gap-3">
        <span className="font-display text-7xl font-semibold italic text-gold/90">{initials(barber.name)}</span>
        <Scissors className="h-5 w-5 text-gold/50 -rotate-45" />
      </div>
    </div>
  );
}

export function BarberCard({ barber, settings, index = 0 }: { barber: Barber; settings: SiteSettings | undefined; index?: number }) {
  return (
    <Reveal delay={index * 90} className="group">
      <article data-testid={`card-barber-${barber.id}`} className="relative">
        <Link href={`/barbers/${barber.slug}`} className="block" data-testid={`link-barber-${barber.slug}`}>
          <div className="relative aspect-[4/5] overflow-hidden bg-card">
            <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]">
              <BarberPortrait barber={barber} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/10 to-transparent" />
            {barber.yearsCutting != null && (
              <span className="absolute top-4 left-4 bg-ink/80 backdrop-blur px-3 py-1.5 font-mono text-[11px] text-gold border border-gold/30">
                {barber.yearsCutting} yrs in the chair
              </span>
            )}
            <div className="absolute bottom-0 inset-x-0 p-5">
              <p className="text-[11px] uppercase tracking-[0.28em] text-gold">{barber.title}</p>
              <h3 className="mt-1 font-display text-3xl text-bone">{barber.name}</h3>
              {barber.specialties.length > 0 && (
                <p className="mt-2 text-xs text-bone/70 line-clamp-1">{barber.specialties.join(' · ')}</p>
              )}
            </div>
          </div>
        </Link>
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <BookButton settings={settings} barber={barber} size="sm" className="h-11" testId={`button-book-${barber.slug}`} />
          <Link href={`/barbers/${barber.slug}`} className={cn(btnBase, btnSizes.sm, btnVariants.outline, 'h-11')} data-testid={`link-profile-${barber.slug}`}>Profile</Link>
        </div>
      </article>
    </Reveal>
  );
}

/* ---------- Services ---------- */
export function groupServices(services: Service[]): [string, Service[]][] {
  const map = new Map<string, Service[]>();
  [...services].sort((a, b) => a.displayOrder - b.displayOrder).forEach((s) => {
    if (!map.has(s.category)) map.set(s.category, []);
    map.get(s.category)!.push(s);
  });
  return [...map.entries()];
}

export function ServiceRow({ s }: { s: Service }) {
  return (
    <li className="group py-5" data-testid={`row-service-${s.id}`}>
      <div className="flex items-baseline gap-3">
        <h4 className="font-display text-xl md:text-2xl text-bone group-hover:text-gold transition-colors">{s.name}</h4>
        <span className="flex-1 border-b border-dotted border-gold/30 translate-y-[-4px]" />
        <span className="font-display text-2xl text-gold" data-testid={`text-price-${s.id}`}>{money(s.priceCents)}</span>
      </div>
      <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
        {s.description && <p className="flex-1">{s.description}</p>}
        {s.durationMinutes != null && <span className="font-mono text-xs shrink-0 pt-0.5">{s.durationMinutes} min</span>}
      </div>
    </li>
  );
}

/* ---------- Testimonials ---------- */
export function TestimonialCard({ t, featured }: { t: Testimonial; featured?: boolean }) {
  return (
    <figure data-testid={`card-testimonial-${t.id}`} className={cn('relative flex h-full flex-col border border-gold/15 bg-card/80 p-7', featured && 'md:p-10 bg-gradient-to-br from-card to-ink')}>
      <span aria-hidden className="absolute -top-5 left-6 font-display text-7xl leading-none text-gold/70">&ldquo;</span>
      <blockquote className={cn('flex-1 text-bone/90 leading-relaxed', featured ? 'font-display text-2xl md:text-3xl italic' : 'text-[15px]')}>{t.quote}</blockquote>
      <figcaption className="mt-6 flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold uppercase tracking-[0.2em] text-gold">{t.author}</span>
        <span className="text-muted-foreground">{[t.barberName && `with ${t.barberName}`, t.source].filter(Boolean).join(' · ')}</span>
      </figcaption>
    </figure>
  );
}

/* ---------- States ---------- */
export function SkeletonLines({ n = 3, className }: { n?: number; className?: string }) {
  return (
    <div className={cn('space-y-2.5', className)}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="h-3.5 animate-pulse rounded-sm bg-muted" style={{ width: `${88 - ((i * 17) % 40)}%` }} />
      ))}
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-muted', className)} />;
}

export function ErrorState({ message = 'We could not load this right now.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="border border-oxblood/50 bg-oxblood/10 px-6 py-8 text-center" data-testid="status-error">
      <p className="text-bone/90">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className={cn(btnBase, btnSizes.sm, btnVariants.outline, 'mt-4')} data-testid="button-retry">
          <RotateCw className="h-3.5 w-3.5" /> Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="tile-floor relative overflow-hidden border border-gold/15 px-6 py-14 text-center">
      <Scissors className="mx-auto h-7 w-7 text-gold/60 -rotate-45" />
      <p className="mt-4 font-display text-2xl text-bone">{title}</p>
      {body && <p className="mt-2 text-sm text-muted-foreground">{body}</p>}
    </div>
  );
}

export const ui = { btnBase, btnSizes, btnVariants };
