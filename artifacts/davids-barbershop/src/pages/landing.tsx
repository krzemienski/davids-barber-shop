import { useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'wouter';
import { MapPin, Phone, ArrowLeft } from 'lucide-react';
import { useGetLandingPage, getGetLandingPageQueryKey, useListTestimonials, useListServices } from '@workspace/api-client-react';
import type { LandingPageDetail } from '@workspace/api-client-react';
import { BookButton, BooksyBarberNote, CallLink, Eyebrow, AnnouncementBanner, BarberPortrait, HoursTable, TestimonialCard, SkeletonBlock, SkeletonLines, Wordmark, closedDaysLine, useSettings, MobileBar, ServiceRow, ui } from '@/components/site';
import { HeroVideo } from '@/components/hero-video';
import { LandingContext, getVariant, useTracker } from '@/lib/tracking';
import { usePageMeta } from '@/lib/meta';
import { formatPhone, fullAddress, money } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? '';
  const q = useGetLandingPage(slug, { query: { enabled: !!slug, queryKey: getGetLandingPageQueryKey(slug), retry: false } });
  const page = q.data && q.data.active ? q.data : undefined;
  const variant = useMemo<'A' | 'B'>(() => (page ? getVariant(page.slug, !!page.variantBHeadline) : 'A'), [page]);
  const ctx = useMemo(() => (page ? { slug: page.slug, variant } : null), [page, variant]);

  if (q.isLoading) return <LandingSkeleton />;
  if (!page) return <LandingNotFound />;
  return (
    <LandingContext.Provider value={ctx}>
      <LandingBody page={page} variant={variant} />
    </LandingContext.Provider>
  );
}

function LandingBody({ page, variant }: { page: LandingPageDetail; variant: 'A' | 'B' }) {
  const { data: s } = useSettings();
  const testimonials = useListTestimonials();
  const services = useListServices();
  const track = useTracker();
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track('landing_view', { barberId: page.barber?.id ?? null, barberName: page.barber?.name ?? null });
  }, [track, page]);

  const headline = variant === 'B' && page.variantBHeadline ? page.variantBHeadline : page.headline;
  const sub = variant === 'B' && page.variantBHeadline ? (page.variantBSubheadline ?? page.subheadline) : page.subheadline;
  const barber = page.kind === 'barber' ? page.barber : null;
  usePageMeta(`${headline} | David's Barber Shop`, sub || "Book at David's Barber Shop on the Upper East Side.", { noindex: true });

  const reviews = (testimonials.data ?? []).filter((t) => !barber || !t.barberName || t.barberName.toLowerCase().includes(barber.name.split(' ')[0]!.toLowerCase())).slice(0, 3);
  const topServices = [...(services.data ?? [])].sort((a, b) => a.displayOrder - b.displayOrder).slice(0, 4);

  return (
    <div className="grain min-h-[100dvh] pb-28 lg:pb-0" data-testid={`landing-${page.slug}-${variant}`}>
      <AnnouncementBanner settings={s} />
      <header className="relative z-30">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <Wordmark small />
          {s && <CallLink settings={s} variant="ghost" size="sm" testId="link-landing-header-call" className="font-mono text-[13px]" />}
        </div>
      </header>

      <section className="relative z-10 -mt-[72px] flex min-h-[100dvh] items-center">
        {!barber && <HeroVideo />}
        {barber && (
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-y-0 right-0 w-full md:w-[52%] opacity-50 md:opacity-100"><BarberPortrait barber={barber} /></div>
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 md:via-ink/70 to-ink/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
          </div>
        )}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 lg:px-8 pt-28 pb-16">
          <div className="max-w-2xl">
            <div className="rise"><Eyebrow>{barber ? `${barber.title} · ${s ? `Since ${s.foundedYear}` : 'Upper East Side'}` : 'Upper East Side · East 84th St'}</Eyebrow></div>
            <h1 className="rise mt-6 font-display text-[clamp(2.75rem,7.5vw,6rem)] font-semibold leading-[0.92] text-bone" style={{ animationDelay: '120ms' }} data-testid="text-landing-headline">{headline}</h1>
            {sub && <p className="rise mt-6 text-lg md:text-xl text-bone/80 leading-relaxed" style={{ animationDelay: '220ms' }} data-testid="text-landing-subheadline">{sub}</p>}
            {s && (
              <div className="rise mt-8 flex items-baseline gap-4" style={{ animationDelay: '300ms' }}>
                <span className="font-display text-6xl text-gold">{money(s.offerPriceCents)}</span>
                <span className="text-sm uppercase tracking-[0.25em] text-bone/70">a cut</span>
                {s.comparisonPriceCents != null && <span className="font-mono text-xs text-bone/50">vs. {money(s.comparisonPriceCents)} median at nearby UES shops</span>}
              </div>
            )}
            <div className="rise mt-9 flex flex-col sm:flex-row gap-3" style={{ animationDelay: '380ms' }}>
              <BookButton settings={s} barber={barber} size="lg" label={barber ? `Book with ${barber.name}` : 'Book your cut'} testId="button-landing-book" />
              <CallLink settings={s} size="lg" barber={barber} testId="link-landing-call" className="bg-ink/40 backdrop-blur" />
            </div>
            <BooksyBarberNote settings={s} barber={barber} className="mt-3" />
            {s && <p className="rise mt-6 flex items-center gap-2 text-sm text-bone/60" style={{ animationDelay: '460ms' }}><MapPin className="h-4 w-4 text-gold" />{fullAddress(s)}{closedDaysLine(s) && <> · {closedDaysLine(s)}</>}</p>}
          </div>
        </div>
      </section>

      <div className="relative z-10 bg-background">
        <div className="pole-rule" />
        {(barber?.specialties.length ?? 0) > 0 && (
          <section className="mx-auto max-w-5xl px-5 py-16">
            <Eyebrow>What {barber!.name.split(' ')[0]} does best</Eyebrow>
            <ul className="mt-6 flex flex-wrap gap-2">{barber!.specialties.map((sp) => <li key={sp} className="border border-gold/35 px-4 py-2 text-bone">{sp}</li>)}</ul>
            {barber!.bio && <p className="mt-8 max-w-2xl text-bone/75 leading-relaxed line-clamp-5">{barber!.bio}</p>}
          </section>
        )}
        {!barber && topServices.length > 0 && (
          <section className="mx-auto max-w-3xl px-5 py-16">
            <Eyebrow>Posted prices</Eyebrow>
            <ul className="mt-4 divide-y divide-border/60">{topServices.map((x) => <ServiceRow key={x.id} s={x} />)}</ul>
          </section>
        )}
        {testimonials.isLoading ? <div className="mx-auto max-w-5xl px-5 pb-16"><SkeletonBlock className="h-40" /></div> : reviews.length > 0 && (
          <section className="mx-auto max-w-6xl px-5 pb-16 pt-6 grid gap-6 md:grid-cols-3">
            {reviews.map((t) => <TestimonialCard key={t.id} t={t} />)}
          </section>
        )}
        {s && (
          <section className="border-t border-gold/15 bg-ink">
            <div className="mx-auto max-w-5xl px-5 py-16 grid gap-10 md:grid-cols-2 items-start">
              <div>
                <h2 className="font-display text-4xl text-bone">Ready when <span className="italic text-gold">you are.</span></h2>
                <div className="mt-8 flex flex-col gap-3">
                  <BookButton settings={s} barber={barber} size="lg" label={barber ? `Book with ${barber.name}` : 'Book your cut'} testId="button-landing-book-bottom" />
                  <CallLink settings={s} size="lg" barber={barber} testId="link-landing-call-bottom"><Phone className="h-4 w-4" /> Call {formatPhone(s.phone)}</CallLink>
                </div>
              </div>
              <div className="border border-gold/20 bg-card p-6"><HoursTable settings={s} compact /></div>
            </div>
            <p className="pb-10 text-center text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} {s.shopName} · <Link href="/privacy" className="hover:text-gold" data-testid="link-landing-privacy">Privacy</Link>
            </p>
          </section>
        )}
      </div>
      <MobileBar settings={s} barber={barber} />
    </div>
  );
}

function LandingSkeleton() {
  return (
    <div className="min-h-[100dvh] bg-ink px-5 pt-32">
      <div className="mx-auto max-w-2xl space-y-6"><SkeletonBlock className="h-4 w-48" /><SkeletonBlock className="h-24 w-full" /><SkeletonLines n={3} /><SkeletonBlock className="h-14 w-60" /></div>
    </div>
  );
}

function LandingNotFound() {
  usePageMeta("Offer not found | David's Barber Shop", 'This offer is no longer available.', { noindex: true });
  return (
    <div className="grain tile-floor flex min-h-[100dvh] items-center justify-center px-5">
      <div className="max-w-lg text-center">
        <Wordmark className="justify-center" />
        <h1 className="mt-10 font-display text-5xl text-bone">This offer has <span className="italic text-gold">closed up shop.</span></h1>
        <p className="mt-4 text-bone/70">The link may be old. The chairs are still open.</p>
        <Link href="/" className={cn(ui.btnBase, ui.btnSizes.lg, ui.btnVariants.gold, 'mt-10')} data-testid="link-landing-home"><ArrowLeft className="h-4 w-4" /> Go to the shop</Link>
      </div>
    </div>
  );
}
