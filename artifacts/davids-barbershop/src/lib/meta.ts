import { useEffect } from 'react';
import type { SiteSettings } from '@workspace/api-client-react';
import { basePath, fullAddress } from './format';

export function usePageMeta(title: string, description: string, opts: { noindex?: boolean } = {}) {
  const { noindex = false } = opts;
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
    const og = [
      ['og:title', title],
      ['og:description', description],
    ];
    og.forEach(([p, c]) => {
      let el = document.querySelector(`meta[property="${p}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', p);
        document.head.appendChild(el);
      }
      el.setAttribute('content', c);
    });
  }, [title, description]);
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
      image: `${origin}${basePath}/media/interior.jpg`,
      logo: `${origin}${basePath}/logo.svg`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: s.streetAddress,
        addressLocality: s.city,
        addressRegion: s.region,
        postalCode: s.postalCode,
        addressCountry: 'US',
      },
      hasMap: s.googleMapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress(s))}`,
      sameAs: [s.instagramUrl].filter(Boolean),
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
