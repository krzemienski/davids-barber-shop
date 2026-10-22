# Progress

_Last updated 2026-10-22._

## Built

### Public site
- **Home:** video hero (muted loop, pause button, still image for reduced-motion visitors), "$30 a cut", Book + Call, barbers, services preview, verbatim reviews, hours with **Closed Saturdays**.
- **Barbers** index and **profiles** (`/barbers/<slug>`): bio, specialties, gallery, socials, reviews that mention them, "Book with X" with an honest note when the button opens the shop's Booksy page.
- **Services & prices**, **Our Story**, **Gallery**, **Visit** (map, hours, phone, email, Closed Saturdays), **Privacy**.
- **Ad landing pages** `/l/<slug>`: offer (`30-dollar-cut`, with A/B variant) and per-barber (`book-david`, `book-sean`).
- **Mobile bottom bar** with Call and Book on every public page; click-to-call phone number in the desktop header.
- Announcement banner (from settings), 404 page, error boundary.
- SEO: page titles/descriptions, Open Graph tags, `BarberShop`/`HairSalon` JSON-LD, `robots.txt`, `sitemap.xml`, `noindex` on landing pages and sign-in, redirects from the old site's `#anchors`.

### Tracking
- First-touch UTM/gclid/fbclid capture; `landing_view`, `book_click`, `call_click` events with barber, landing page and A/B variant; UTMs appended to the Booksy link; events mirrored to `window.dataLayer`.

### Admin (`/admin`)
- Clerk sign-in + owner/editor allowlist; first owners from `ADMIN_BOOTSTRAP_EMAILS`.
- Performance (cost per booking vs $60, per barber, per landing variant, live events), Bookings (log + Google Ads offline CSV export), Campaigns, Landing pages, Barbers (photos, gallery, notable clients with consent switch), Services, Site settings (prices, comparison claim, banner, contact, hours), Staff access.

### Docs
- `docs/ADMIN_GUIDE.md`, `docs/ADS_PLAYBOOK.md`, `docs/DECISIONS.md`, `docs/brand/BRAND_GUIDE.md` (draft), `docs/research/booksy-and-tracking.md`, `docs/research/competitors.md`.

## Verified (2026-10-22, real app in a browser + real API)

| Check | Result |
| --- | --- |
| Landing `/l/book-sean?utm_…&gclid=…` → Book | Booksy URL carried the UTMs; `book_click` row stored barber, variant A, utm and gclid |
| Barber profile `/barbers/david?utm_source=facebook&fbclid=…` → mobile Call | `call_click` row with barber David, utm_source facebook, fbclid. (Found and fixed: the mobile bar did not pass the barber.) |
| Barber profile → Book | Booksy listing opened in a new tab; `book_click` with barber David |
| Pages at desktop and 402 px mobile | Home, Barbers, profile, Services, Our Story, Gallery, Visit, Privacy, admin sign-in render correctly. (Fixed: phone wrapping on mobile buttons, literal backticks on Privacy, "Haircuts start at $30" wording, faint "Closed Saturdays" in the hero.) |
| Admin sign-in with a real Clerk test account | Not on allowlist → no access (403); on allowlist → Performance dashboard with live counts |
| Admin: add barber with an unconsented notable client | Appeared at `/barbers/marco-test`; client name absent from page and public API |
| Admin: edit price (Crew Cut $22 → $23) | Public Services page showed $23 |
| Admin: add service, delete barber (with confirm) | Service listed; barber page then 404 |
| Admin: log booking with gclid | Row stored; appears in table; export button counts it |
| Report maths | $120 spend / 2 bookings = $60 → `on_target` |
| Old anchors | `/#Price-List` → `/services`, `/#About-Us` → `/our-story` |
| API guards | Slug conflict 409, bad input 400, uploads image-only ≤15 MB, last owner/self can't be removed |
| `pnpm run typecheck` | Passes |

All test data (events, bookings, test barber/service, test staff account) was removed after verification.

**Not verified:** the Google Ads / Meta upload itself (no ad account access), the Booksy booking completion (would create a real appointment — needs owner OK), production deploy and DNS.

## Open items — need the owner

1. **Make $30 bookable on Booksy** (Booksy shows $35; old site $25). Blocks ads.
2. **Roster:** site shows David and Sean; Booksy lists only Michael. Confirm who is bookable, send photos and any per-barber Booksy links.
3. **Owner emails** (at least two) for `ADMIN_BOOTSTRAP_EMAILS`.
4. **Approve or reject** the "$45 median at nearby UES shops" comparison.
5. **Brand sign-off**, branding photo, vinyl measurements; 1972 vs the "84" in the domain.
6. **Celebrity consents** — none published until written consent is recorded.
7. **Booksy Biz and ad account access, pixel IDs** → then add consent banner + tags.
8. **Explicit go-ahead needed for:** DNS cutover, publishing celebrity names, a live test booking, any ad budget change.
9. Send the Booksy partner-API request drafted in `docs/research/booksy-and-tracking.md`.
