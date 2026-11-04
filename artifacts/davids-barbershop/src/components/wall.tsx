import { useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Tv } from 'lucide-react';
import { useListWallEntries } from '@workspace/api-client-react';
import type { PublicWallEntry } from '@workspace/api-client-react';
import { Eyebrow, Reveal, PoleRule } from '@/components/site';
import { assetUrl } from '@/lib/format';
import { cn } from '@/lib/utils';

export const WALL_ANCHOR = 'from-the-wall';

/* A photo hung on the shop wall: dark moulding, gold fillet, a little shadow. */
function Frame({ entry, className, tilt = 0 }: { entry: PublicWallEntry; className?: string; tilt?: number }) {
  const src = assetUrl(entry.photoUrl);
  if (!src) return null;
  const alt = entry.people.length ? `${entry.caption} (${entry.people.join(', ')})` : entry.caption;
  return (
    <figure
      className={cn('relative bg-[hsl(28_22%_9%)] p-2.5 sm:p-3 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.85)] ring-1 ring-black/60 motion-safe:transition-transform motion-safe:duration-500', className)}
      style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}
    >
      <div className="border border-gold/45 p-1.5 sm:p-2 bg-ink">
        <img src={src} alt={alt} className="block w-full h-auto" loading="lazy" />
      </div>
    </figure>
  );
}

function PressLine({ outlet, className }: { outlet: string; className?: string }) {
  return (
    <p className={cn('inline-flex items-center gap-2 border border-gold/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold', className)} data-testid="text-press">
      <Tv className="h-3.5 w-3.5" aria-hidden /> As seen on {outlet}
    </p>
  );
}

/** Our Story timeline. Renders nothing at all until there is at least one approved entry with a photo. */
export function WallTimeline() {
  const q = useListWallEntries();
  const entries = (q.data ?? []).filter((e) => e.photoUrl);

  useEffect(() => {
    if (entries.length && window.location.hash === `#${WALL_ANCHOR}`) {
      document.getElementById(WALL_ANCHOR)?.scrollIntoView({ block: 'start' });
    }
  }, [entries.length]);

  if (!entries.length) return null;

  return (
    <>
      <PoleRule />
      <section id={WALL_ANCHOR} className="tile-floor scroll-mt-20 border-b border-gold/15 py-24 md:py-32" data-testid="section-wall">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <Reveal className="max-w-2xl">
            <Eyebrow>From the wall</Eyebrow>
            <h2 className="mt-5 font-display text-5xl md:text-6xl leading-[1] text-bone">
              The shop, <span className="italic text-gold">in frames.</span>
            </h2>
            <p className="mt-6 text-lg text-bone/75 leading-relaxed">Photos that hang on the shop wall, and the stories behind them.</p>
          </Reveal>

          <ol className="relative mt-16 md:mt-20">
            <span aria-hidden className="absolute left-[7px] top-0 bottom-0 w-px bg-gradient-to-b from-gold/60 via-gold/30 to-transparent md:left-1/2" />
            {entries.map((e, i) => {
              const right = i % 2 === 1;
              return (
                <Reveal as="li" key={e.id} className="relative pb-20 last:pb-0 pl-10 md:pl-0 md:grid md:grid-cols-2 md:gap-16" >
                  <span aria-hidden className="absolute left-[3px] top-6 h-2.5 w-2.5 rotate-45 bg-gold md:left-1/2 md:-ml-[5px]" />
                  <div className={cn('md:pt-2', right ? 'md:order-2' : 'md:text-right')} data-testid={`wall-entry-${e.id}`}>
                    {e.year != null
                      ? <span className="font-display text-5xl md:text-6xl italic text-gold" data-testid={`text-wall-year-${e.id}`}>{e.year}</span>
                      : <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold/80">No. {String(i + 1).padStart(2, '0')}</span>}
                    <p className="mt-4 font-display text-2xl md:text-3xl leading-snug text-bone" data-testid={`text-wall-caption-${e.id}`}>{e.caption}</p>
                    {e.people.length > 0 && (
                      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground" data-testid={`text-wall-people-${e.id}`}>
                        {e.people.join(' · ')}
                      </p>
                    )}
                    {e.pressOutlet && <PressLine outlet={e.pressOutlet} className="mt-5" />}
                  </div>
                  <div className={cn('mt-8 md:mt-0', right ? 'md:order-1' : '')}>
                    <Frame entry={e} className="max-w-xl" tilt={right ? 0.6 : -0.6} />
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </section>
    </>
  );
}

/** Home page teaser. Hidden unless at least one approved entry exists. */
export function WallTeaser() {
  const q = useListWallEntries();
  const entries = (q.data ?? []).filter((e) => e.photoUrl).slice(0, 3);
  if (!entries.length) return null;
  const press = entries.find((e) => e.pressOutlet)?.pressOutlet ?? (q.data ?? []).find((e) => e.pressOutlet)?.pressOutlet;
  const tilts = [-1.4, 0.8, -0.5];
  return (
    <section className="border-t border-gold/15 bg-ink py-24 md:py-28" data-testid="section-wall-teaser">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 grid gap-14 lg:grid-cols-12 items-center">
        <div className="lg:col-span-4">
          <Reveal><Eyebrow>From the wall</Eyebrow></Reveal>
          <Reveal delay={80}>
            <h2 className="mt-5 font-display text-5xl md:text-6xl leading-[1] text-bone">Hung in <span className="italic text-gold">the shop.</span></h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-6 text-bone/75 leading-relaxed">A few of the framed photos from the shop wall. The full set, with the stories behind them, is on Our Story.</p>
            {press && <PressLine outlet={press} className="mt-6" />}
          </Reveal>
          <Reveal delay={200}>
            <Link href={`/our-story#${WALL_ANCHOR}`} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:gap-3 transition-all" data-testid="link-wall-teaser">
              See the wall <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
        <div className={cn('lg:col-span-8 grid gap-6 sm:gap-8 items-start', entries.length === 1 ? 'sm:grid-cols-1 max-w-xl' : entries.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3')}>
          {entries.map((e, i) => (
            <Reveal key={e.id} delay={i * 100} className={cn(i === 1 && 'sm:mt-10')}>
              <Link href={`/our-story#${WALL_ANCHOR}`} aria-label={`From the wall: ${e.caption}`} data-testid={`link-wall-teaser-${e.id}`}>
                <Frame entry={e} tilt={tilts[i] ?? 0} />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
