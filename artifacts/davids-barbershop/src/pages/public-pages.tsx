import type { ReactNode } from 'react';
import { Link, useParams } from 'wouter';
import { ArrowLeft, ArrowRight, Instagram, Link2, MapPin, Phone, Mail } from 'lucide-react';
import { SiTiktok } from 'react-icons/si';
import { useGetBarber, getGetBarberQueryKey, useListBarbers, useListServices, useListTestimonials } from '@workspace/api-client-react';
import aboutCut from '@assets/brand/about1.jpg';
import aboutStorefront from '@assets/brand/about2.jpg';
import aboutChairs from '@assets/brand/about3.jpg';
import {
  PublicLayout, PageHero, useSettings, BookButton, BooksyBarberNote, CallLink, Eyebrow, Reveal, PoleRule, BarberCard, BarberPortrait,
  ServiceRow, groupServices, TestimonialCard, HoursTable, SkeletonBlock, SkeletonLines, ErrorState, EmptyState, closedDaysLine, ui,
} from '@/components/site';
import { usePageMeta, useLocalBusinessJsonLd } from '@/lib/meta';
import { assetUrl, errorStatus, formatPhone, fullAddress, mediaUrl, money, yearsSince } from '@/lib/format';
import { cn } from '@/lib/utils';

/* ================= /barbers ================= */
export function BarbersPage() {
  const { data: s } = useSettings();
  const barbers = useListBarbers();
  usePageMeta("Our Barbers | David's Barber Shop, Upper East Side", 'Meet the barbers at David\u2019s Barber Shop on East 84th Street and book directly with the one you want.');
  return (
    <PublicLayout>
      <PageHero eyebrow="The chairs" title={<>Pick your <span className="italic text-gold">barber.</span></>} intro="Every barber here books directly. Find the one who fits how you wear it, then lock in a time." image={mediaUrl('interior.jpg')} />
      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-20">
        {barbers.isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <SkeletonBlock key={i} className="aspect-[4/5]" />)}</div>
        ) : barbers.isError ? <ErrorState onRetry={() => barbers.refetch()} /> : !barbers.data?.length ? (
          <EmptyState title="The roster is being updated" body="Call the shop and we will find you a chair." />
        ) : (
          <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {barbers.data.map((b, i) => <BarberCard key={b.id} barber={b} settings={s} index={i % 3} />)}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

/* ================= /barbers/:slug ================= */
export function BarberProfilePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? '';
  const { data: s } = useSettings();
  const q = useGetBarber(slug, { query: { enabled: !!slug, queryKey: getGetBarberQueryKey(slug), retry: false } });
  const testimonials = useListTestimonials();
  const b = q.data;
  usePageMeta(
    b ? `${b.name}, ${b.title} | David's Barber Shop` : "Barber | David's Barber Shop",
    b ? `Book with ${b.name} at David\u2019s Barber Shop on the Upper East Side. ${b.bio.slice(0, 120)}` : 'Barber profile at David\u2019s Barber Shop.',
  );

  if (q.isError && errorStatus(q.error) === 404) return <NotFoundPage message="That barber is not on the roster." />;

  const myReviews = b ? (testimonials.data ?? []).filter((t) => t.barberName && t.barberName.toLowerCase().includes(b.name.split(' ')[0]!.toLowerCase())) : [];
  const socials = b ? [
    b.instagramUrl && { href: b.instagramUrl, label: 'Instagram', icon: <Instagram className="h-4 w-4" /> },
    b.tiktokUrl && { href: b.tiktokUrl, label: 'TikTok', icon: <SiTiktok className="h-3.5 w-3.5" /> },
    b.otherSocialUrl && { href: b.otherSocialUrl, label: 'More', icon: <Link2 className="h-4 w-4" /> },
  ].filter(Boolean) as { href: string; label: string; icon: ReactNode }[] : [];

  return (
    <PublicLayout barber={b}>
      {q.isLoading ? (
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16 grid gap-12 lg:grid-cols-2">
          <SkeletonBlock className="aspect-[4/5]" />
          <div className="space-y-6 pt-10"><SkeletonBlock className="h-14 w-2/3" /><SkeletonLines n={6} /></div>
        </div>
      ) : q.isError || !b ? (
        <div className="mx-auto max-w-3xl px-5 py-24"><ErrorState onRetry={() => q.refetch()} /></div>
      ) : (
        <>
          <section className="mx-auto max-w-7xl px-5 lg:px-8 pt-8 pb-20">
            <Link href="/barbers" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-gold" data-testid="link-back-barbers"><ArrowLeft className="h-3.5 w-3.5" /> All barbers</Link>
            <div className="mt-8 grid gap-12 lg:grid-cols-12 items-start">
              <div className="lg:col-span-5 rise">
                <div className="relative aspect-[4/5] overflow-hidden border border-gold/20">
                  <BarberPortrait barber={b} />
                  <div className="absolute inset-x-0 bottom-0 pole-rule" />
                </div>
              </div>
              <div className="lg:col-span-7 lg:pt-6">
                <div className="rise" style={{ animationDelay: '80ms' }}><Eyebrow>{b.title}</Eyebrow></div>
                <h1 className="rise mt-5 font-display text-6xl md:text-8xl leading-[0.9] text-bone" style={{ animationDelay: '140ms' }} data-testid="text-barber-name">{b.name}</h1>
                {b.yearsCutting != null && (
                  <p className="rise mt-5 font-mono text-sm text-gold" style={{ animationDelay: '200ms' }}>{b.yearsCutting} years cutting hair</p>
                )}
                <div className="rise mt-8 flex flex-col sm:flex-row gap-3" style={{ animationDelay: '260ms' }}>
                  <BookButton settings={s} barber={b} size="lg" label={`Book with ${b.name}`} testId="button-book-barber" />
                  <CallLink settings={s} size="lg" barber={b} testId="link-barber-call" />
                </div>
                <BooksyBarberNote settings={s} barber={b} className="mt-3" />
                <p className="rise mt-10 whitespace-pre-line text-lg leading-relaxed text-bone/80 max-w-2xl" style={{ animationDelay: '320ms' }} data-testid="text-barber-bio">{b.bio}</p>
                {b.specialties.length > 0 && (
                  <div className="mt-10">
                    <h2 className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Specialties</h2>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {b.specialties.map((sp) => <li key={sp} className="border border-gold/35 px-3.5 py-1.5 text-sm text-bone">{sp}</li>)}
                    </ul>
                  </div>
                )}
                {b.notableClients.length > 0 && (
                  <div className="mt-10">
                    <h2 className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">In this chair</h2>
                    <ul className="mt-4 space-y-2">
                      {b.notableClients.filter((c) => c.consent).map((c) => (
                        <li key={c.name} className="flex items-baseline gap-3"><span className="font-display text-xl text-bone">{c.name}</span>{c.note && <span className="text-sm text-muted-foreground">{c.note}</span>}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {socials.length > 0 && (
                  <div className="mt-10 flex flex-wrap gap-4">
                    {socials.map((so) => (
                      <a key={so.label} href={so.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-bone hover:text-gold" data-testid={`link-social-${so.label.toLowerCase()}`}>{so.icon}{so.label}</a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
          {b.galleryImages.length > 0 && (
            <section className="bg-ink border-t border-gold/15 py-20">
              <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Eyebrow>{b.name.split(' ')[0]}&rsquo;s work</Eyebrow>
                <div className="mt-10 columns-2 md:columns-3 gap-4 [&>*]:mb-4">
                  {b.galleryImages.map((g, i) => (
                    <Reveal key={g + i} delay={(i % 3) * 80}>
                      <img src={assetUrl(g)} alt={`Haircut by ${b.name}`} className="w-full border border-gold/10" loading="lazy" />
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          )}
          {myReviews.length > 0 && (
            <section className="mx-auto max-w-7xl px-5 lg:px-8 py-20 grid gap-6 md:grid-cols-2">
              {myReviews.slice(0, 4).map((t) => <TestimonialCard key={t.id} t={t} />)}
            </section>
          )}
          <section className="border-t border-gold/15 py-20 text-center px-5">
            <h2 className="font-display text-4xl md:text-5xl text-bone">Sit with <span className="italic text-gold">{b.name.split(' ')[0]}.</span></h2>
            <div className="mt-8 flex justify-center"><BookButton settings={s} barber={b} size="lg" label={`Book with ${b.name}`} testId="button-book-barber-bottom" /></div>
          </section>
        </>
      )}
    </PublicLayout>
  );
}

/* ================= /services ================= */
export function ServicesPage() {
  const { data: s } = useSettings();
  const services = useListServices();
  usePageMeta("Services & Prices | David's Barber Shop", 'Haircuts, fades, shaves and beard work at David\u2019s Barber Shop on the Upper East Side. Every price posted.');
  const groups = services.data ? groupServices(services.data) : [];
  return (
    <PublicLayout>
      <PageHero eyebrow="The menu" title={<>Services <span className="italic text-gold">&amp; prices.</span></>}
        intro={s ? <>A classic haircut is <span className="text-gold font-semibold">{money(s.offerPriceCents)}</span>.{s.comparisonPriceCents != null && <> vs. {money(s.comparisonPriceCents)} median at nearby UES shops.</>}</> : undefined}
        image={mediaUrl('clippers.jpg')} />
      <section className="mx-auto max-w-4xl px-5 lg:px-8 py-20">
        {services.isLoading ? <SkeletonLines n={12} /> : services.isError ? <ErrorState onRetry={() => services.refetch()} /> : !groups.length ? (
          <EmptyState title="Menu coming soon" body="Call the shop for current prices." />
        ) : (
          <div className="space-y-20">
            {groups.map(([cat, list], gi) => (
              <Reveal key={cat}>
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-xs text-gold">0{gi + 1}</span>
                  <h2 className="font-display text-4xl text-bone">{cat}</h2>
                </div>
                <ul className="mt-6 divide-y divide-border/60 border-t border-gold/20">{list.map((x) => <ServiceRow key={x.id} s={x} />)}</ul>
              </Reveal>
            ))}
          </div>
        )}
        {s?.comparisonSourceNote && s.comparisonPriceCents != null && (
          <p id="price-note" className="mt-16 text-xs text-muted-foreground">Comparison price source: {s.comparisonSourceNote}</p>
        )}
        <div className="mt-14 flex flex-wrap gap-3"><BookButton settings={s} size="lg" testId="button-services-page-book" /><CallLink settings={s} size="lg" testId="link-services-call" /></div>
      </section>
    </PublicLayout>
  );
}

/* ================= /our-story ================= */
export function OurStoryPage() {
  const { data: s } = useSettings();
  const year = s?.foundedYear ?? 1972;
  usePageMeta("Our Story | David's Barber Shop since 1972", `A father-and-son barbershop on East 84th Street, cutting hair on the Upper East Side since ${year}.`);
  const chapters = [
    { k: String(year), t: 'The chair goes in.', b: `The shop opens on East 84th Street, between Second and Third Avenue.` },
    { k: 'Decades', t: 'Regulars become family.', b: 'The same faces come back every few weeks. Clients write about coming back for seven years and more, and about travelling in from Queens and Long Island to keep their barber.' },
    { k: 'Father & son', t: 'Two generations, one standard.', b: 'Father and son work the floor side by side, with the same standard for every client in the chair.' },
    { k: 'Today', t: 'Manhattan quality, neighborhood price.', b: s ? `A real Upper East Side cut for ${money(s.offerPriceCents)}. Book online or call the shop.` : 'A real Upper East Side cut at a neighborhood price.' },
  ];
  return (
    <PublicLayout>
      <PageHero eyebrow={`Since ${year}`} title={<>{s ? yearsSince(year) : '50+'} years on <span className="italic text-gold">East 84th.</span></>} intro="A father-and-son barbershop on the Upper East Side, with hot towels, straight razors and a lot of regulars." image={aboutStorefront} />
      <section className="mx-auto max-w-6xl px-5 lg:px-8 py-24">
        <ol className="relative border-l border-gold/30 ml-3 md:ml-0 md:border-l-0">
          {chapters.map((c, i) => (
            <Reveal as="li" key={c.k} className="relative pl-8 md:pl-0 pb-16 md:grid md:grid-cols-12 md:gap-10">
              <span className="absolute -left-[5px] top-3 h-2.5 w-2.5 rotate-45 bg-gold md:hidden" />
              <div className="md:col-span-4 md:text-right md:border-r md:border-gold/30 md:pr-10">
                <span className="font-display text-5xl md:text-6xl italic text-gold">{c.k}</span>
              </div>
              <div className="md:col-span-8 mt-3 md:mt-2">
                <h2 className="font-display text-3xl text-bone">{c.t}</h2>
                <p className="mt-3 text-lg text-bone/75 leading-relaxed max-w-xl">{c.b}</p>
                {i === 1 && <img src={aboutChairs} alt="Clients in the chairs" className="mt-8 w-full max-w-md border border-gold/20" loading="lazy" />}
                {i === 2 && <img src={aboutCut} alt="A barber at work" className="mt-8 w-full max-w-xs border border-gold/20" loading="lazy" />}
              </div>
            </Reveal>
          ))}
        </ol>
      </section>
      <PoleRule />
      <section className="bg-ink py-24 text-center px-5">
        <h2 className="font-display text-4xl md:text-6xl text-bone">Become a <span className="italic text-gold">regular.</span></h2>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3"><BookButton settings={s} size="lg" testId="button-story-book" /><CallLink settings={s} size="lg" testId="link-story-call" /></div>
      </section>
    </PublicLayout>
  );
}

/* ================= /gallery ================= */
export function GalleryPage() {
  const { data: s } = useSettings();
  const barbers = useListBarbers();
  usePageMeta("Gallery | David's Barber Shop", 'The shop, the tools and the work at David\u2019s Barber Shop on the Upper East Side.');
  const shop = [
    { src: mediaUrl('interior.jpg'), alt: 'Chairs and mirrors' },
    { src: aboutStorefront, alt: 'Storefront on East 84th Street' },
    { src: mediaUrl('tools.jpg'), alt: 'Straight razor and brush' },
    { src: aboutChairs, alt: 'A busy afternoon in the shop' },
    { src: mediaUrl('towel.jpg'), alt: 'Hot towel' },
    { src: mediaUrl('clippers.jpg'), alt: 'Clippers and shears' },
    { src: aboutCut, alt: 'A cut in progress' },
    { src: mediaUrl('pole.jpg'), alt: 'Barber pole at dusk' },
  ];
  const work = (barbers.data ?? []).flatMap((b) => b.galleryImages.map((g) => ({ src: assetUrl(g)!, alt: `Cut by ${b.name}`, by: b.name, slug: b.slug })));
  return (
    <PublicLayout>
      <PageHero eyebrow="Gallery" title={<>The shop <span className="italic text-gold">&amp; the work.</span></>} />
      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-20">
        <Eyebrow>The space</Eyebrow>
        <div className="mt-10 columns-1 sm:columns-2 lg:columns-3 gap-5 [&>*]:mb-5">
          {shop.map((g, i) => (
            <Reveal key={g.alt} delay={(i % 3) * 90} className="group relative overflow-hidden">
              <img src={g.src} alt={g.alt} className="w-full transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" />
              <span className="absolute bottom-3 left-3 bg-ink/80 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-bone/80 opacity-0 group-hover:opacity-100 transition-opacity">{g.alt}</span>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="bg-ink border-t border-gold/15 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Eyebrow>From the chairs</Eyebrow>
          {barbers.isLoading ? <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">{[0, 1, 2, 3].map((i) => <SkeletonBlock key={i} className="aspect-square" />)}</div>
            : barbers.isError ? <div className="mt-10"><ErrorState onRetry={() => barbers.refetch()} /></div>
            : work.length === 0 ? <div className="mt-10"><EmptyState title="Fresh cuts coming soon" body="Our barbers are adding their work." /></div>
            : (
              <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                {work.map((w, i) => (
                  <Reveal key={w.src + i} delay={(i % 4) * 70}>
                    <Link href={`/barbers/${w.slug}`} className="group relative block aspect-square overflow-hidden" data-testid={`link-gallery-${i}`}>
                      <img src={w.src} alt={w.alt} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink to-transparent p-3 text-xs text-bone">{w.by}</span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            )}
          <div className="mt-14"><BookButton settings={s} size="lg" testId="button-gallery-book" /></div>
        </div>
      </section>
    </PublicLayout>
  );
}

/* ================= /visit ================= */
export function VisitPage() {
  const { data: s, isLoading, isError, refetch } = useSettings();
  usePageMeta("Visit | Hours & Directions | David's Barber Shop", s ? `${fullAddress(s)}. ${closedDaysLine(s) ?? ''} Call ${formatPhone(s.phone)}.` : 'Hours, directions and phone for David\u2019s Barber Shop.');
  useLocalBusinessJsonLd(s);
  return (
    <PublicLayout>
      <PageHero eyebrow="Visit" title={<>Find the <span className="italic text-gold">chair.</span></>} image={mediaUrl('pole.jpg')} />
      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-20">
        {isLoading ? <div className="grid gap-10 lg:grid-cols-2"><SkeletonBlock className="h-96" /><SkeletonLines n={10} /></div>
          : isError || !s ? <ErrorState onRetry={() => refetch()} />
          : (
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-7 order-2 lg:order-1">
                <div className="relative aspect-[4/3] overflow-hidden border border-gold/20">
                  <iframe
                    title="Map to David's Barber Shop"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(fullAddress(s))}&z=16&output=embed`}
                    className="absolute inset-0 h-full w-full [filter:grayscale(0.9)_invert(0.92)_sepia(0.25)_contrast(0.9)]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <a href={s.googleMapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress(s))}`} target="_blank" rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm text-gold hover:underline" data-testid="link-google-maps">Open in Google Maps <ArrowRight className="h-4 w-4" /></a>
              </div>
              <div className="lg:col-span-5 order-1 lg:order-2 space-y-8">
                <div>
                  <h2 className="font-display text-4xl text-bone">{s.streetAddress}</h2>
                  <p className="mt-2 flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4 text-gold" />{s.city}, {s.region} {s.postalCode}</p>
                </div>
                {closedDaysLine(s) && (
                  <p className="border-l-2 border-oxblood bg-oxblood/15 px-4 py-3 text-base font-semibold uppercase tracking-[0.18em] text-bone" data-testid="text-visit-closed">{closedDaysLine(s)}</p>
                )}
                <div className="border border-gold/20 bg-card p-6"><HoursTable settings={s} /></div>
                <div className="space-y-3">
                  <CallLink settings={s} variant="bare" testId="link-visit-phone" className="flex items-center gap-3 font-mono text-2xl text-bone hover:text-gold"><Phone className="h-5 w-5 text-gold" />{formatPhone(s.phone)}</CallLink>
                  <a href={`mailto:${s.email}`} className="flex items-center gap-3 text-muted-foreground hover:text-gold" data-testid="link-visit-email"><Mail className="h-4 w-4 text-gold" />{s.email}</a>
                </div>
                <div className="flex flex-wrap gap-3"><BookButton settings={s} size="lg" testId="button-visit-page-book" /><CallLink settings={s} size="lg" testId="link-visit-page-call" /></div>
              </div>
            </div>
          )}
      </section>
    </PublicLayout>
  );
}

/* ================= /privacy ================= */
export function PrivacyPage() {
  const { data: s } = useSettings();
  usePageMeta("Privacy Policy | David's Barber Shop", 'How David\u2019s Barber Shop handles first-party click tracking, ad click IDs and online booking.');
  const email = s?.email;
  return (
    <PublicLayout>
      <PageHero eyebrow="Privacy" title="Privacy policy" intro="Plain language, no surprises." />
      <section className="mx-auto max-w-3xl px-5 lg:px-8 py-16 prose prose-invert prose-code:before:content-none prose-code:after:content-none prose-headings:font-display prose-headings:text-bone prose-headings:font-normal prose-p:text-bone/75 prose-li:text-bone/75 prose-a:text-gold prose-strong:text-bone">
        <h2>What we collect</h2>
        <p>This site does not ask for your name, email or payment details. When you tap a <strong>Call</strong> or <strong>Book</strong> button, or open one of our ad landing pages, we record a first-party event: the type of click, the page path, which barber or landing page it relates to, and an anonymous random visitor ID stored in your browser&rsquo;s local storage.</p>
        <h2>Ad click IDs and campaign tags</h2>
        <p>If you arrive from an ad, the link may include campaign tags (<code>utm_source</code>, <code>utm_medium</code>, <code>utm_campaign</code>, <code>utm_content</code>, <code>utm_term</code>) and an advertising click ID such as Google&rsquo;s <code>gclid</code> or Meta&rsquo;s <code>fbclid</code>. We save the first set we see in your browser&rsquo;s local storage and attach it to the events above. We use this only to understand which ads lead to bookings and, for Google Ads, to report confirmed bookings back as offline conversions using the click ID.</p>
        <h2>Booking through Booksy</h2>
        <p>Appointments are booked through <strong>Booksy</strong>, which processes your booking under its own privacy policy. When you tap Book, you leave this site for Booksy. We may record that a booking was confirmed, along with its value, barber and any click ID, so we can measure our advertising.</p>
        <h2>Analytics tags</h2>
        <p>Call and Book clicks are also pushed to a browser <code>dataLayer</code> so a tag manager can count them. No personal information is included.</p>
        <h2>Your choices</h2>
        <ul>
          <li>Clear your browser&rsquo;s site data to remove the visitor ID and stored campaign tags.</li>
          <li>Use your browser&rsquo;s private mode to prevent them from being stored at all.</li>
          <li>Ask us to delete booking records associated with you.</li>
        </ul>
        <h2>Contact</h2>
        <p>Questions or requests: {email ? <a href={`mailto:${email}`} data-testid="link-privacy-email">{email}</a> : 'the email listed in the footer'}{s && <>, or call <CallLink settings={s} variant="bare" testId="link-privacy-call">{formatPhone(s.phone)}</CallLink></>}.</p>
        {s && <p className="text-sm">Last updated {new Date(s.updatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.</p>}
      </section>
    </PublicLayout>
  );
}

/* ================= 404 ================= */
export function NotFoundPage({ message }: { message?: string }) {
  const { data: s } = useSettings();
  usePageMeta("Not found | David's Barber Shop", 'This page could not be found.');
  return (
    <PublicLayout>
      <section className="relative overflow-hidden tile-floor min-h-[70dvh] flex items-center">
        <div className="mx-auto max-w-4xl px-5 py-24 text-center">
          <p className="font-mono text-sm text-gold tracking-[0.4em]">404</p>
          <h1 className="mt-6 font-display text-6xl md:text-8xl text-bone leading-[0.9]">Missed a <span className="italic text-gold">spot.</span></h1>
          <p className="mt-6 text-bone/70">{message ?? 'That page is not here. The chairs still are.'}</p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/" className={cn(ui.btnBase, ui.btnSizes.lg, ui.btnVariants.outline)} data-testid="link-404-home"><ArrowLeft className="h-4 w-4" /> Back to the shop</Link>
            <BookButton settings={s} size="lg" testId="button-404-book" />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
