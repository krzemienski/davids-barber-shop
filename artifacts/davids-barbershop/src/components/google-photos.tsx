import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useGetGooglePhotos, getGetGooglePhotosQueryKey } from '@workspace/api-client-react';
import { Eyebrow, Reveal } from '@/components/site';
import { assetUrl } from '@/lib/format';
import { trackEvent } from '@/lib/analytics';

/**
 * "From our Google listing": photos shown live from Google with the credits
 * Google requires (author name + link, and "Google Maps" attribution). Nothing
 * is downloaded or stored. The whole section is hidden when Google is
 * unavailable, so the Gallery never shows an empty frame.
 */
export function GoogleListingStrip() {
  // Google content must not be cached, so always ask fresh.
  const q = useGetGooglePhotos({ query: { queryKey: getGetGooglePhotosQueryKey(), staleTime: 0, gcTime: 0, retry: false } });
  const [failed, setFailed] = useState<Set<number>>(() => new Set());
  const data = q.data;
  if (!data?.available || !data.photos.length) return null;
  const visible = data.photos.map((p, i) => ({ p, i })).filter(({ i }) => !failed.has(i));
  if (!visible.length) return null;

  return (
    <section className="border-t border-gold/15 py-20" data-testid="section-google-photos">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>From our Google listing</Eyebrow>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground">Photos posted to the shop&rsquo;s Google listing, many of them by customers. Each is credited to the person who took it.</p>
          </div>
          {data.listingUrl && (
            <a href={data.listingUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('directions_click', { placement: 'gallery_google_photos' })}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:gap-3 transition-all" data-testid="link-google-see-all">
              See all on Google <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>
        <ul className="mt-10 -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
          {visible.map(({ p, i }) => {
            const a = p.authorAttributions[0];
            return (
              <Reveal as="li" key={p.src} delay={(i % 3) * 80} className="w-[78vw] max-w-sm shrink-0 snap-start lg:w-auto lg:max-w-none">
                <figure data-testid={`google-photo-${i}`}>
                  <div className="aspect-[4/3] overflow-hidden border border-gold/15 bg-card">
                    <img src={assetUrl(p.src)} alt={a ? `Photo of the shop by ${a.displayName}` : 'Photo from the shop\u2019s Google listing'} loading="lazy"
                      onError={() => setFailed((prev) => new Set(prev).add(i))} className="h-full w-full object-cover" />
                  </div>
                  <figcaption className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    {a?.photoUri && <img src={a.photoUri} alt="" className="h-5 w-5 rounded-full" referrerPolicy="no-referrer" loading="lazy" />}
                    {a ? (
                      a.uri
                        ? <a href={a.uri} target="_blank" rel="noopener noreferrer" className="text-bone/85 hover:text-gold underline-offset-2 hover:underline" data-testid={`link-google-author-${i}`}>{a.displayName}</a>
                        : <span className="text-bone/85">{a.displayName}</span>
                    ) : <span>Unknown author</span>}
                  </figcaption>
                </figure>
              </Reveal>
            );
          })}
        </ul>
        <p className="mt-4 text-[11px] text-bone/60" style={{ fontFamily: 'Roboto, Arial, sans-serif', letterSpacing: 0 }} data-testid="text-google-attribution">Google Maps</p>
      </div>
    </section>
  );
}
