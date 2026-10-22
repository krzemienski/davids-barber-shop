# Reference: Upper East Watch Repair (pattern source for David's Barbershop)

Read from /@krzemienski/Upper-East-Watch-Repair on 2026-10-22 (read-only inspection).

## Stack
- pnpm workspaces monorepo, Node 24, TypeScript 5.9
- Frontend artifact: artifacts/watch-repair (React + Vite, Tailwind v4, Radix/shadcn UI, TanStack Query, prerender step for SEO meta)
- Shared design system package: artifacts/upper-east-horology (tokens.json -> scripts/build-tokens.mjs -> generated index.css; shadcn-style HSL CSS vars: background, foreground, primary, accent, card, muted, etc.; font vars --app-font-sans/serif/mono)
- API: artifacts/api-server, Express 5, routes: agent, auth, customers, guides, health, repairLeads
- DB: PostgreSQL + Drizzle ORM (lib/db/src/schema), Zod v4 + drizzle-zod
- API contract: OpenAPI spec -> Orval codegen (lib/api-spec, lib/api-client-react, lib/api-zod)
- Admin auth: Replit Auth (sessions + users tables; lib/replit-auth-web; components/admin/AdminGate.tsx, AdminShell.tsx)
- Analytics: components/SiteAnalytics.tsx + lib/google-analytics (GA4, document-level click observers for tel/maps/CTA, scroll depth, SPA route tracking)
- SEO: LocalBusinessJsonLd, ServiceJsonLd, ArticleJsonLd, PageMeta, PublicBreadcrumb, sitemap.xml, robots.txt, llms.txt, og/ images

## Parallax video hero (components/HeroMedia.tsx)
- Fixed full-viewport layer behind page content; content scrolls over it
- Several WebM (VP9) + MP4 (H.264) variations in public/media/, shuffled, 1s crossfade between clips (only active + next mounted)
- Desktop parallax: translate3d drift = sin(scrollY/850)*18px via rAF; disabled on mobile
- prefers-reduced-motion or paused prop -> static poster <img>; pauses on document hidden; onError falls back to next clip / poster
- Two gradient overlays (top-down + left-right) from background color for text legibility

## Hero video production (docs/media-production.md)
- Generated with Replit generateVideo, high-quality mode, 1920x1080, 8 s, 24 fps, no audio, person generation disabled
- Prompt pattern: single continuous slow drift shot, dark negative space left-center for headline, detail weighted right third, last second echoes the first for a seamless loop; detailed negative prompt (no people/text/logos/flash/cuts/shake)
- Delivery: trim 0.75 s and crossfade tail into head for a seamless loop; webm ~1.4 MB + mp4 ~1.5 MB + jpg poster ~224 KB per variation; master kept outside public/

## Other docs worth mirroring
docs/booking-setup.md, docs/handoff.md, docs/agent-checklist.md, docs/traffic-analysis.md, docs/future.md
