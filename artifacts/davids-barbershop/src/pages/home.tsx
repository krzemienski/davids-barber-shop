import { Link } from 'wouter';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import { useListBarbers, useListServices, useListTestimonials } from '@workspace/api-client-react';
import aboutStorefront from '@assets/brand/about2.jpg';
import aboutChairs from '@assets/brand/about3.jpg';
import {
  PublicLayout, useSettings, BookButton, CallLink, Eyebrow, Reveal, PoleRule, BarberCard, ServiceRow, groupServices,
  TestimonialCard, HoursTable, SkeletonBlock, SkeletonLines, ErrorState, EmptyState, closedDaysLine, ui,
} from '@/components/site';
import { HeroVideo } from '@/components/hero-video';
import { usePageMeta, useLocalBusinessJsonLd } from '@/lib/meta';
import { fullAddress, mediaUrl, money, yearsSince } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function Home() {
  const { data: s } = useSettings();
  const barbers = useListBarbers();
  const services = useListServices();
  const testimonials = useListTestimonials();
  usePageMeta(
    s ? `${s.shopName} | ${money(s.offerPriceCents)} haircuts on the Upper East Side since ${s.foundedYear}` : "David's Barber Shop | Upper East Side barbers since 1972",
    s ? `Father-and-son barbershop at ${s.streetAddress}, ${s.city}. Classic cuts, fades and hot-towel shaves, ${money(s.offerPriceCents)} a cut. Book online or call.` : 'Father-and-son barbershop on the Upper East Side. Book online or call.',
  );
  useLocalBusinessJsonLd(s);

  const featuredT = testimonials.data?.[0];
  const restT = testimonials.data?.slice(1, 5) ?? [];
  const cuts = services.data ? groupServices(services.data) : [];

  return (
    <PublicLayout transparentHeader>
      {/* HERO */}
      <section className="relative z-10 -mt-[72px] flex min-h-[100dvh] items-end lg:items-center">
        <HeroVideo />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 lg:px-8 pt-32 pb-36 lg:pb-24">
          <div className="max-w-3xl">
            <div className="rise" style={{ animationDelay: '100ms' }}>
              <Eyebrow>East 84th Street · Upper East Side</Eyebrow>
            </div>
            <h1 className="mt-6 font-display text-[clamp(3rem,9vw,7.25rem)] font-semibold leading-[0.9] tracking-tight text-bone">
              <span className="rise block" style={{ animationDelay: '200ms' }}>Manhattan</span>
              <span className="rise block italic font-normal text-bone/90" style={{ animationDelay: '300ms' }}>quality,</span>
              <span className="rise block" style={{ animationDelay: '420ms' }}>
                {s ? <span className="text-gold" data-testid="text-offer-price">{money(s.offerPriceCents)}</span> : <SkeletonBlock className="inline-block h-[0.8em] w-[2.2em] align-middle" />} a cut.
              </span>
            </h1>
            {s?.comparisonPriceCents != null && (
              <p className="rise mt-5 font-mono text-sm text-bone/70" style={{ animationDelay: '520ms' }} data-testid="text-comparison">
                vs. {money(s.comparisonPriceCents)} median at nearby UES shops
              </p>
            )}
            <p className="rise mt-6 max-w-xl text-base md:text-lg text-bone/80 leading-relaxed" style={{ animationDelay: '600ms' }}>
              {s ? `A father-and-son shop cutting the neighborhood's hair since ${s.foundedYear}.` : 'A father-and-son shop cutting the neighborhood\u2019s hair since 1972.'}
            </p>
            <div className="rise mt-9 flex flex-col sm:flex-row gap-3" style={{ animationDelay: '720ms' }}>
              <BookButton settings={s} size="lg" label="Book your chair" testId="button-hero-book" />
              <CallLink settings={s} size="lg" testId="link-hero-call" className="bg-ink/40 backdrop-blur" />
            </div>
            {s && closedDaysLine(s) && (
              <p className="rise mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-bone/85" style={{ animationDelay: '820ms' }}>
                {closedDaysLine(s)}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="relative z-10 bg-background">
        {/* Marquee */}
        <div className="overflow-hidden border-y border-gold/20 bg-ink py-4">
          <div className="marquee flex w-max gap-10 whitespace-nowrap font-display text-xl italic text-gold/80">
            {Array.from({ length: 2 }).map((_, k) => (
              <div key={k} className="flex gap-10" aria-hidden={k === 1}>
                {['Classic cuts', 'Skin fades', 'Hot-towel shaves', 'Beard work', "Kids' cuts", 'Royal shaves', s ? `Since ${s.foundedYear}` : 'Since 1972'].map((t) => (
                  <span key={t} className="flex items-center gap-10">{t}<span className="text-oxblood not-italic">&#9670;</span></span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* STORY */}
        <section className="mx-auto max-w-7xl px-5 lg:px-8 py-24 md:py-32 grid gap-14 lg:grid-cols-12 items-center">
          <Reveal className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] overflow-hidden">
              <img src={aboutChairs} alt="Barbers at work in the shop" className="h-full w-full object-cover saturate-[0.85] contrast-110" loading="lazy" />
              <div className="absolute inset-0 ring-1 ring-inset ring-gold/30" />
            </div>
            <div className="absolute -bottom-8 -right-4 md:-right-10 w-40 md:w-52 aspect-square overflow-hidden border-4 border-background shadow-xl">
              <img src={aboutStorefront} alt="David's Barber Shop storefront" className="h-full w-full object-cover" loading="lazy" />
            </div>
          </Reveal>
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal><Eyebrow>Father &amp; son</Eyebrow></Reveal>
            <Reveal delay={80}>
              <h2 className="mt-5 font-display text-5xl md:text-6xl leading-[1] text-bone">
                {s ? <>{yearsSince(s.foundedYear)} years.<br /><span className="italic text-gold">One chair at a time.</span></> : <SkeletonLines n={2} />}
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-7 text-lg text-bone/75 leading-relaxed">
                The shop opened on East 84th Street in {s?.foundedYear ?? 1972}. Today it is still a father-and-son operation: two generations working side by side. Regulars have kept coming back for years, some of them travelling in from Queens and Long Island for their cut.
              </p>
            </Reveal>
            <Reveal delay={240} className="mt-10 grid grid-cols-3 gap-6 border-t border-gold/20 pt-8">
              {[
                [s ? String(s.foundedYear) : '—', 'Opened'],
                [s ? money(s.offerPriceCents) : '—', 'A haircut'],
                ['2', 'Generations'],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="font-display text-4xl text-gold">{n}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{l}</div>
                </div>
              ))}
            </Reveal>
            <Reveal delay={300}>
              <Link href="/our-story" className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:gap-3 transition-all" data-testid="link-our-story">
                Read our story <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
        </section>

        <PoleRule animate />

        {/* BARBERS */}
        <section className="bg-ink py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <Reveal>
                <Eyebrow>The chairs</Eyebrow>
                <h2 className="mt-5 font-display text-5xl md:text-6xl text-bone">Pick your barber.</h2>
              </Reveal>
              <Link href="/barbers" className="text-sm font-semibold text-gold inline-flex items-center gap-2 hover:gap-3 transition-all" data-testid="link-all-barbers">All barbers <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="mt-14">
              {barbers.isLoading ? (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <SkeletonBlock key={i} className="aspect-[4/5]" />)}</div>
              ) : barbers.isError ? (
                <ErrorState onRetry={() => barbers.refetch()} />
              ) : !barbers.data?.length ? (
                <EmptyState title="The roster is being updated" body="Call the shop and we will find you a chair." />
              ) : (
                <div className={cn('grid gap-x-8 gap-y-14 sm:grid-cols-2', barbers.data.length >= 3 && 'lg:grid-cols-3')}>
                  {barbers.data.slice(0, 6).map((b, i) => <BarberCard key={b.id} barber={b} settings={s} index={i} />)}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="relative overflow-hidden py-24 md:py-32">
          <img src={mediaUrl('tools.jpg')} alt="" className="absolute right-0 top-0 hidden h-full w-[42%] object-cover opacity-40 lg:block" loading="lazy" />
          <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-gradient-to-r from-background to-transparent lg:block" />
          <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
            <div className="max-w-2xl">
              <Reveal><Eyebrow>The menu</Eyebrow></Reveal>
              <Reveal delay={80}><h2 className="mt-5 font-display text-5xl md:text-6xl text-bone">Honest prices.<br /><span className="italic text-gold">Posted on the wall.</span></h2></Reveal>
              <div className="mt-12 space-y-12">
                {services.isLoading ? <SkeletonLines n={8} /> : services.isError ? <ErrorState onRetry={() => services.refetch()} /> : cuts.length === 0 ? (
                  <EmptyState title="Menu coming soon" body="Call for current prices." />
                ) : cuts.slice(0, 2).map(([cat, list], ci) => (
                  <Reveal key={cat} delay={ci * 100}>
                    <h3 className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">{cat}</h3>
                    <ul className="mt-2 divide-y divide-border/60">{list.slice(0, 5).map((x) => <ServiceRow key={x.id} s={x} />)}</ul>
                  </Reveal>
                ))}
              </div>
              <Reveal className="mt-10 flex flex-wrap gap-3">
                <BookButton settings={s} testId="button-services-book" />
                <Link href="/services" className={cn(ui.btnBase, ui.btnSizes.md, ui.btnVariants.outline)} data-testid="link-full-menu">Full menu</Link>
              </Reveal>
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        <section className="tile-floor border-y border-gold/15 py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal className="flex items-center gap-4">
              <Eyebrow>From the chair</Eyebrow>
              <span className="flex text-gold">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}</span>
            </Reveal>
            {testimonials.isLoading ? (
              <div className="mt-12 grid gap-6 md:grid-cols-2"><SkeletonBlock className="h-64" /><SkeletonBlock className="h-64" /></div>
            ) : testimonials.isError ? (
              <div className="mt-12"><ErrorState onRetry={() => testimonials.refetch()} /></div>
            ) : !featuredT ? (
              <div className="mt-12"><EmptyState title="Ask the guy in the next chair." body="Reviews are on their way to this page." /></div>
            ) : (
              <div className="mt-14 grid gap-6 lg:grid-cols-12">
                <Reveal className="lg:col-span-7"><TestimonialCard t={featuredT} featured /></Reveal>
                <div className="lg:col-span-5 grid gap-6">
                  {restT.slice(0, 2).map((t, i) => <Reveal key={t.id} delay={(i + 1) * 100}><TestimonialCard t={t} /></Reveal>)}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* VISIT */}
        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-5 lg:px-8 grid gap-14 lg:grid-cols-2">
            <div>
              <Reveal><Eyebrow>Come by</Eyebrow></Reveal>
              <Reveal delay={80}>
                <h2 className="mt-5 font-display text-5xl md:text-6xl text-bone">{s ? s.streetAddress : <SkeletonLines n={1} />}</h2>
                {s && <p className="mt-3 flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4 text-gold" />{s.city}, {s.region} {s.postalCode}</p>}
              </Reveal>
              {s && closedDaysLine(s) && (
                <Reveal delay={140}>
                  <p className="mt-8 inline-block border-l-2 border-oxblood bg-oxblood/15 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-bone" data-testid="text-closed-days">{closedDaysLine(s)}</p>
                </Reveal>
              )}
              <Reveal delay={200} className="mt-8 flex flex-wrap gap-3">
                <BookButton settings={s} testId="button-visit-book" />
                <CallLink settings={s} testId="link-visit-call" />
                <Link href="/visit" className={cn(ui.btnBase, ui.btnSizes.md, ui.btnVariants.ghost)} data-testid="link-directions">Directions <ArrowRight className="h-4 w-4" /></Link>
              </Reveal>
            </div>
            <Reveal delay={120} className="border border-gold/20 bg-card p-6 md:p-8">
              <h3 className="text-[11px] uppercase tracking-[0.32em] text-gold">Hours</h3>
              {s ? <HoursTable settings={s} /> : <SkeletonLines n={7} className="mt-4" />}
              {s && <p className="mt-5 text-xs text-muted-foreground">{fullAddress(s)}</p>}
            </Reveal>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative overflow-hidden border-t border-gold/20">
          <img src={mediaUrl('towel.jpg')} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/60" />
          <div className="relative mx-auto max-w-4xl px-5 py-28 text-center">
            <Reveal>
              <h2 className="font-display text-5xl md:text-7xl text-bone leading-[0.95]">Your chair is <span className="italic text-gold">open.</span></h2>
              <p className="mt-6 text-bone/75">{s ? `${money(s.offerPriceCents)} a cut. Book online or just call the shop.` : 'Book online or just call the shop.'}</p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
                <BookButton settings={s} size="lg" testId="button-final-book" />
                <CallLink settings={s} size="lg" testId="link-final-call" />
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
