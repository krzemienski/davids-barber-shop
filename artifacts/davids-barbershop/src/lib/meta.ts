import { useEffect } from 'react';
import type { SiteSettings } from '@workspace/api-client-react';
import { assetUrl, basePath, mapsListingUrl, mediaUrl } from './format';

const DEFAULT_SHARE_IMAGE = 'hero-poster.jpg';

const absolute = (path: string) => new URL(path, window.location.origin).toString();

/** Title, description, robots and share tags for the current page. `image` is a media/ file name or an uploaded asset URL. */
export function usePageMeta(title: string, description: string, opts: { noindex?: boolean; image?: string | null } = {}) {
  const { noindex = false } = opts;
  const image = opts.image ? assetUrl(opts.image) ?? opts.image : mediaUrl(DEFAULT_SHARE_IMAGE);
  useEffect(() => {
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', noindex ? 'noindex, follow' : 'index, follow');
  }, [noindex]);
  useEffect(() => {
    document.title = title;
    let m = document.querySelector('meta[name="description"]');
    if (!m) {
      m = document.createElement('meta');
      m.setAttribute('name', 'description');
      document.head.appendChild(m);
    }
    m.setAttribute('content', description);
    const tags: [string, string, string][] = [
      ['property', 'og:title', title],
      ['property', 'og:description', description],
      ['property', 'og:url', window.location.href.split(/[?#]/)[0]!],
      ['property', 'og:image', absolute(image)],
      ['name', 'twitter:title', title],
      ['name', 'twitter:description', description],
      ['name', 'twitter:image', absolute(image)],
    ];
    tags.forEach(([attr, key, content]) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    });
  }, [title, description, image]);
}

const DAY_MAP: Record<string, string> = {
  Monday: 'Mo', Tuesday: 'Tu', Wednesday: 'We', Thursday: 'Th', Friday: 'Fr', Saturday: 'Sa', Sunday: 'Su',
};

export function useLocalBusinessJsonLd(s: SiteSettings | undefined) {
  useEffect(() => {
    if (!s) return;
    const origin = window.location.origin;
    const data = {
      '@context': 'https://schema.org',
      '@type': ['BarberShop', 'HairSalon'],
      name: s.shopName,
      foundingDate: String(s.foundedYear),
      telephone: s.phone,
      email: s.email,
      url: `${origin}${basePath}/`,
      image: absolute(mediaUrl('storefront.jpg')),
      logo: `${origin}${basePath}/logo.svg`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: s.streetAddress,
        addressLocality: s.city,
        addressRegion: s.region,
        postalCode: s.postalCode,
        addressCountry: 'US',
      },
      hasMap: mapsListingUrl(s),
      sameAs: [s.booksyBusinessUrl, s.instagramUrl].filter(Boolean),
      priceRange: '$',
      openingHours: s.hours
        .filter((h) => !h.closed && h.open && h.close)
        .map((h) => `${DAY_MAP[h.day] ?? h.day.slice(0, 2)} ${h.open}-${h.close}`),
    };
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = 'ld-localbusiness';
    el.text = JSON.stringify(data);
    document.getElementById('ld-localbusiness')?.remove();
    document.head.appendChild(el);
    return () => el.remove();
  }, [s]);
}
