# David's Barber Shop

Website for David's Barber Shop (233 E 84th St, Upper East Side, since 1972) built to turn paid ads into Booksy bookings, with an owner admin for content, bookings, campaigns and cost-per-booking reporting.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — API server
- `pnpm --filter @workspace/davids-barbershop run dev` — website + admin (React/Vite)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Env: `DATABASE_URL`, Clerk keys, object storage vars, `ADMIN_BOOTSTRAP_EMAILS` (comma-separated first owners; used only when the staff table is empty)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9; Express 5 API; PostgreSQL + Drizzle; Zod; Orval codegen
- Web: React + Vite + Tailwind + wouter; Clerk auth; Replit object storage for photos

## Where things live

- API contract: `lib/api-spec` (OpenAPI) → generated client in `lib/api-client-react`
- DB schema: `lib/db/src/schema`; seed data (empty-table only): `artifacts/api-server/src/lib/seed.ts`
- Admin API + performance report: `artifacts/api-server/src/routes/admin.ts`
- Tracking (first-touch UTMs, events, A/B): `artifacts/davids-barbershop/src/lib/tracking.ts`
- Brand tokens: `artifacts/davids-barbershop/src/index.css`
- Docs: `docs/PROGRESS.md`, `docs/DECISIONS.md`, `docs/ADMIN_GUIDE.md`, `docs/ADS_PLAYBOOK.md`, `docs/brand/BRAND_GUIDE.md`, research in `docs/research/`; ad creative kit (copy, images, owner preview) in `docs/ads/`

## Architecture decisions

- Booksy is the booking system; bookings are logged manually in admin (`booking_confirmed`) because Booksy offers no webhook or click-ID pass-through.
- Book buttons open Booksy's widget in an on-site panel when Settings has a Booksy business ID (staff/service IDs optional per barber/service); `booking_completed` comes from the widget's close message and is a lower bound. Details: `docs/research/booksy-integration.md` §5.
- Admin access = Clerk sign-in + DB allowlist with owner/editor roles. `ADMIN_BOOTSTRAP_EMAILS` (shared env var) seeds the first owner only while the staff table is empty.
- Replit Analytics custom events go through `trackEvent` in `src/lib/analytics.ts`; every `useTracker` event is mirrored there with `placement` (derived from the button's testId). Don't call `window.umami` directly.
- Money in cents. Unconsented notable clients and "From the wall" entries without permission on file are filtered out in the public API.
- Google listing photos (Gallery) are fetched live server-side with `GOOGLE_MAPS_API_KEY` and streamed through `/api/google/photos/media`; never stored or cached (only the Place ID is kept in site settings).
- See `docs/DECISIONS.md` for the full list and reasons.

## Product

- Public: Home (video hero, wall teaser), Barbers + profiles, Services, Our Story (+ From-the-wall timeline), Gallery (+ live Google listing photos), Visit (map of the real Google listing), Privacy, ad landing pages `/l/<slug>` with A/B variants, mobile Call/Book bar.
- Admin `/admin`: Performance (cost per booking vs $60), Bookings + Google Ads offline CSV, Campaigns, Landing pages, Barbers, Services, From the wall, Site settings, Staff access.

## User preferences

- Verify by driving the real app in a browser and calling the real API; do not write test scripts or harnesses.
- No invented facts, reviews, barber photos or celebrity names; quotes stay verbatim.
- Ask before DNS cutover, brand sign-off, publishing celebrity names, live test bookings, or ad budget changes.

## Gotchas

- `$30` offer conflicts with Booksy ($35) and the old site ($25) — owner must align Booksy before ads.
- Old site `#anchors` are redirected client-side (fragments never reach the server).
- No third-party pixels are loaded yet; add a consent banner together with any tag/pixel.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
