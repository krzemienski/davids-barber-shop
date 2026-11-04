# Ad creative kit — David's Barber Shop

Ready-to-load copy, extensions and images for Google Search and Meta, each mapped to the page it sends people to. Owner review copy: open `docs/ads/preview.html` in a browser. Strategy, measurement and the weekly routine are in `docs/ADS_PLAYBOOK.md`.

Every character count below was checked against the platform limit (Google: headline ≤30, description ≤90, sitelink text ≤25, sitelink line ≤35, callout ≤25, snippet value ≤25, price header/description ≤25. Meta: primary text ≤125 before "See more", headline ≤40, description ≤30). A dash or en dash counts as one character.

## Status — nothing here runs until these are cleared

| Item | Status | Clears when |
| --- | --- | --- |
| Every $35 ad (Google shop-wide group, Meta $35 set) | Price cleared 2026-11-03: the owner confirmed Booksy's $35, and the site, landing pages and this copy now say $35 | — (the photo hold below still applies) |
| UES barber group and Meta heritage set | Price cleared: their landing page shows $35, the same as Booksy | — (the photo hold below still applies) |
| Hot towel shave group | **Retired:** Booksy has no shave service, and the site's menu now matches Booksy. `/l/hot-towel-shave` is switched off | Only if the shop adds a shave on Booksy: add it in Admin → Services with its Booksy service ID, switch the page back on and rewrite this group |
| Barber group: Michael | **Cleared 2026-11-03:** the owner confirmed the roster is Michael, Russel and Alex. Michael has a site profile and Book opens Booksy on him | — |
| Barber groups: Russel, Alex | Not built yet: Booksy lists Russel (staff ID 1869365) and Alex (staff ID 1869419), but no services are assigned to them, so neither can be booked online (checked in the Booksy widget 2026-11-03) | The owner assigns them services in Booksy Biz; then copy the Michael group |
| Barber groups: Sean, David | **Retired:** they no longer work at the shop; their profiles and `/l/book-sean`, `/l/book-david` are switched off | — |
| Price asset | Ready: every item matches Booksy (checked 2026-11-03) | — |
| Opening hours in ads ("Mon–Fri 8:30am–7pm", "Open Sundays 9am–6pm", ad schedule, call schedule) | **Cleared 2026-11-03:** approved hours are the Google listing's (Mon–Fri 8:30am–7pm, Sat closed, Sun 9am–6pm, read through Google Places). Site settings already match, and every hours line here was re-checked against them | — Booksy's own hours (Mon and Fri from 9:00, Tue–Thu from 9:30, Fri until 4:30) are shorter; the owner should update them in Booksy so online booking offers the same times |
| "As seen on FOX 5 Good Day New York" | Off | Owner confirms it is accurate to state; then fill *TV or press credit* in Site settings (text only, no logo) and add the reserve headline |
| Comparison claims (e.g. "vs. $45 median", "without the UES price") | Off; none in this kit | Owner approves the claim and the source note is filled in |
| "Walk-Ins Welcome" callout | Hold | Owner confirms (the shop window sign says it) |
| Photos showing a client or barber | Hold | Owner confirms the people pictured agreed to appear in ads |

Ready now, once the account exists: sitelinks, callouts (except Walk-Ins), the hours headlines and descriptions, structured snippet, price asset, location asset, call asset (scheduled Mon–Fri 8:30am–7pm and Sun 9am–6pm), logos.

## Rules this kit follows

- Only facts from Site settings, the services list and the site's own pages: since 1972, father-and-son, 233 E 84th St between Second and Third Avenue, posted prices, opening hours (closed Saturdays, open Sundays 9am–6pm).
- No player or celebrity names or images on any platform. No Google listing photos uploaded by other people. No star ratings or review counts. No comparison claims.
- Images are the shop's own photos only (`attached_assets/brand/about1–3.jpg`). The styled site media (towel, interior, pole, tools) are not the shop and are not used.
- Every ad lands on a page whose headline matches the pinned headline 1 and whose A/B test changes one thing (the headline).

## Tracking and final URLs

- **Google:** auto-tagging on (adds gclid). Final URL is the landing page; put the UTMs in each ad group's **Final URL suffix**:
  `utm_source=google&utm_medium=cpc&utm_campaign=search-ues&utm_content=rsa-<ad group>&utm_term={keyword}`
- **Meta:** URL parameters on each ad: `utm_source=meta&utm_medium=paid_social&utm_campaign=<ad set>&utm_content=<creative>`. Meta adds fbclid.
- The site keeps the first-touch UTMs, stores them on `landing_view` / `book_click` / `call_click`, and appends them to the Booksy link and the in-page Booksy widget.

## Message map

| Ad group / ad set | Promise | Proof point | Landing page | Landing A headline | Landing B headline (one-variable test) |
| --- | --- | --- | --- | --- | --- |
| Google · Shop-wide $35 cut | A classic cut for $35 at a real Upper East Side shop | Since 1972 · father-and-son · prices posted on the site | `/l/35-dollar-cut` | Manhattan quality. $35 a cut. | A real Upper East Side barber. Since 1972. |
| Google · Barber / Upper East Side searches | The neighbourhood barber on East 84th Street | Since 1972 · father-and-son · between Second and Third Avenue | `/l/upper-east-side-barber` (new) | Your Upper East Side barber. Since 1972. | The barber on East 84th Street. Since 1972. |
| Google · Barber: Michael | Book with Michael | Choose Michael on Booksy · since 1972 shop · hours | `/l/book-michael` | Book with Michael. | Your next cut, with Michael. |
| Meta · Neighbourhood · $35 cut | Manhattan quality. $35 a cut. | Since 1972 · father-and-son | `/l/35-dollar-cut` | Manhattan quality. $35 a cut. | A real Upper East Side barber. Since 1972. |
| Meta · Neighbourhood · heritage (no price in the ad) | Your Upper East Side barber | Since 1972 · father-and-son | `/l/upper-east-side-barber` | Your Upper East Side barber. Since 1972. | The barber on East 84th Street. Since 1972. |

Every landing page also shows: "Father & son · Since 1972 · East 84th St" (eyebrow), the address with "Closed Saturdays", the posted prices, three verbatim reviews and the opening hours. The home page carries the same points. Once the owner confirms the TV credit, both show "As seen on …" as text.

New pages added for this kit (Admin → Landing pages; also created automatically on a fresh database):

- `/l/upper-east-side-barber` — offer page for barber / UES searches and the Meta heritage set.
- `/l/hot-towel-shave` — a **Service** page kind that leads with one service's posted price. Switched off on 2026-11-03 with the Royal Shave, which is not on Booksy.
- B headlines added to `/l/book-sean` and `/l/book-david`; the offer page's B now changes only the headline and no longer makes a comparison claim.
- The offer page moved from `/l/30-dollar-cut` to `/l/35-dollar-cut` when the price changed; the old link shows "This offer has closed up shop".

## Google Search

Campaign `search-ues`: ~1 mile around 233 E 84th St; ad schedule Mon–Fri 8:30am–7pm and Sun 9am–6pm (no Saturdays). Shared negatives: `jobs`, `school`, `license`, `salon`, `women`, `kids`, `supplies`, `chair for sale`.

### 1. Shop-wide $35 cut

**Status:** Price matches Booksy (Haircut $35). Hours lines match the approved Google listing hours.

- **Keywords:** `[mens haircut upper east side]`, `"haircut upper east side"`, `"mens haircut ues"`, `"haircut 10028"`, `"affordable haircut upper east side"`, `"35 dollar haircut nyc"`
- **Final URL:** `https://davidsbarbershop84.com/l/35-dollar-cut`
- **Final URL suffix:** `utm_source=google&utm_medium=cpc&utm_campaign=search-ues&utm_content=rsa-35-cut&utm_term={keyword}`
- **Landing page:** A "Manhattan quality. $35 a cut." / B "A real Upper East Side barber. Since 1972."; subheadline "Cutting hair on East 84th Street since 1972. Book online or call the shop."; button "Book your cut".
- **Display path:** `davidsbarbershop84.com/haircuts/upper-east-side`

Responsive search ad — 15 headlines, 4 descriptions:

| # | Headline | Chars | Note |
| ---: | --- | ---: | --- |
| 1 | Manhattan Quality, $35 a Cut | 28 | Pin 1 · matches landing A |
| 2 | A Real Upper East Side Barber | 29 | Pin 1 · matches landing B |
| 3 | $35 Haircuts on East 84th St | 28 |  |
| 4 | David's Barber Shop | 19 |  |
| 5 | Upper East Side Since 1972 | 26 |  |
| 6 | Father-and-Son Barbershop | 25 |  |
| 7 | Book Online or Call the Shop | 28 |  |
| 8 | Open Sundays 9am–6pm | 20 |  |
| 9 | Between 2nd and 3rd Avenue | 26 |  |
| 10 | Classic Cuts and Fades | 22 |  |
| 11 | Cutting Hair Since 1972 | 23 |  |
| 12 | Pick Your Time on Booksy | 24 |  |
| 13 | 233 E 84th St, New York | 23 |  |
| 14 | Prices Posted Up Front | 22 |  |
| 15 | Mon–Fri 8:30am–7pm | 18 |  |

| # | Description | Chars |
| ---: | --- | ---: |
| 1 | A classic cut is $35 at David's, a father-and-son barbershop on East 84th St since 1972. | 88 |
| 2 | Book online on Booksy or call the shop. Open Sundays 9am–6pm, closed Saturdays. | 79 |
| 3 | Haircuts, line ups and beard trims, with every price posted on our site. | 72 |
| 4 | Between Second and Third Avenue on the Upper East Side. Cutting hair since 1972. | 80 |

### 2. Barber / Upper East Side searches

**Status:** Price matches Booksy (the landing page shows $35). Hours lines match the approved Google listing hours.

- **Keywords:** `[barber upper east side]`, `"barbershop upper east side"`, `"barber ues"`, `"barber 10028"`, `"barber yorkville"`, `"barbershop near me"`, `"fade upper east side"`
- **Final URL:** `https://davidsbarbershop84.com/l/upper-east-side-barber`
- **Final URL suffix:** `utm_source=google&utm_medium=cpc&utm_campaign=search-ues&utm_content=rsa-ues-barber&utm_term={keyword}`
- **Landing page:** A "Your Upper East Side barber. Since 1972." / B "The barber on East 84th Street. Since 1972."; subheadline "A father-and-son shop between Second and Third Avenue. Book online or call the shop."; button "Book your cut".
- **Display path:** `davidsbarbershop84.com/barber/upper-east-side`

Responsive search ad — 15 headlines, 4 descriptions:

| # | Headline | Chars | Note |
| ---: | --- | ---: | --- |
| 1 | Your Upper East Side Barber | 27 | Pin 1 · matches landing A |
| 2 | The Barber on East 84th St | 26 | Pin 1 · matches landing B |
| 3 | David's Barber Shop | 19 |  |
| 4 | Cutting Hair Since 1972 | 23 |  |
| 5 | Father-and-Son Barbershop | 25 |  |
| 6 | Between 2nd and 3rd Avenue | 26 |  |
| 7 | Classic Cuts and Fades | 22 |  |
| 8 | Book Online or Call the Shop | 28 |  |
| 9 | Open Sundays 9am–6pm | 20 |  |
| 10 | Pick Your Time on Booksy | 24 |  |
| 11 | A Real Neighborhood Barber | 26 |  |
| 12 | Serving the UES and Yorkville | 29 |  |
| 13 | Mon–Fri 8:30am–7pm | 18 |  |
| 14 | 233 E 84th St, New York | 23 |  |
| 15 | Line Ups and Beard Trims | 24 |  |

| # | Description | Chars |
| ---: | --- | ---: |
| 1 | A father-and-son barbershop on East 84th Street, cutting hair since 1972. | 73 |
| 2 | Classic cuts, fades, line ups and beard trims. Book online or call the shop. | 76 |
| 3 | Open Monday to Friday 8:30am–7pm and Sunday 9am–6pm. Closed Saturdays. | 70 |
| 4 | Between Second and Third Avenue. Regulars travel in from Queens and Long Island. | 80 |

### 3. Hot towel shave — retired

Booksy has no shave service, and on 2026-11-03 the owner confirmed Booksy's menu is the shop's menu, so this group is not run and `/l/hot-towel-shave` is switched off. The old copy is in this file's git history if a shave is ever added to Booksy.

### 4. Barber: Michael

**Status:** Ready to load once the ad account exists. Michael is on the site (`/barbers/michael`), and Book opens Booksy on him (staff ID 1582201, checked in the widget 2026-11-03). Price and hours match. No photo, bio or specialties yet, so the copy states only shop facts.

- **Keywords:** `"michael barber upper east side"`, `"michael davids barber shop"`, `"barber michael nyc"`
- **Final URL:** `https://davidsbarbershop84.com/l/book-michael`
- **Final URL suffix:** `utm_source=google&utm_medium=cpc&utm_campaign=search-ues&utm_content=rsa-barber-michael&utm_term={keyword}`
- **Landing page:** A "Book with Michael." / B "Your next cut, with Michael."; subheadline "Pick a time on Booksy, or call the shop and we will fit you in."; button "Book with Michael".
- **Display path:** `davidsbarbershop84.com/barbers/michael`

Responsive search ad — 12 headlines, 4 descriptions:

| # | Headline | Chars | Note |
| ---: | --- | ---: | --- |
| 1 | Book With Michael | 17 | Pin 1 · matches landing A |
| 2 | Your Next Cut, With Michael | 27 | Pin 1 · matches landing B |
| 3 | Michael at David's Barber Shop | 30 |  |
| 4 | East 84th St, Since 1972 | 24 |  |
| 5 | Book Online or Call the Shop | 28 |  |
| 6 | Choose Michael on Booksy | 24 |  |
| 7 | Father-and-Son Barbershop | 25 |  |
| 8 | Open Sundays 9am–6pm | 20 |  |
| 9 | Between 2nd and 3rd Avenue | 26 |  |
| 10 | David's Barber Shop | 19 |  |
| 11 | Mon–Fri 8:30am–7pm | 18 |  |
| 12 | Haircuts $35 on East 84th | 25 |  |

| # | Description | Chars |
| ---: | --- | ---: |
| 1 | Book a cut with Michael at David's Barber Shop on East 84th Street, open since 1972. | 84 |
| 2 | Pick a time with Michael on Booksy, or call the shop and we will fit you in. | 76 |
| 3 | A father-and-son barbershop on the Upper East Side, cutting hair since 1972. | 76 |
| 4 | Open Monday to Friday 8:30am–7pm and Sunday 9am–6pm. Closed Saturdays. | 70 |

### 5. Barbers: Russel and Alex

**Status:** Not built yet: Booksy lists Russel (staff ID 1869365) and Alex (staff ID 1869419), but no services are assigned to them, so neither can be booked online (checked in the Booksy widget 2026-11-03). The owner confirmed on 2026-11-03 that Michael, Russel and Alex are the shop's barbers; David and Sean no longer work there, and their groups and landing pages are retired.

Clears when the owner assigns services to Russel and Alex in Booksy Biz and the widget lists their services. Then copy the Michael group with the name swapped (all lines fit: "Russel at David's Barber Shop" is 29 characters, "Alex at David's Barber Shop" 27, "Your Next Cut, With Russel" 26), final URLs `/l/book-russel` and `/l/book-alex`, and `utm_content=rsa-barber-russel` / `rsa-barber-alex`.

**Reserve headline (do not upload yet):**

- "As Seen on FOX 5" (16) — Hold: use only once the owner confirms it is accurate, and set the TV or press credit in Site settings at the same time.

## Google extensions (assets), account level

### Sitelinks

| Text | Chars | Final URL | Line 1 | Chars | Line 2 | Chars |
| --- | ---: | --- | --- | ---: | --- | ---: |
| Services & Prices | 17 | `https://davidsbarbershop84.com/services` | Cuts, line ups, beard trims | 27 | Every price posted up front | 27 |
| Our Story | 9 | `https://davidsbarbershop84.com/our-story` | Father and son since 1972 | 25 | Two generations on East 84th St | 31 |
| Barbers | 7 | `https://davidsbarbershop84.com/barbers` | Meet the people in the chairs | 29 | Book online or call the shop | 28 |
| Visit | 5 | `https://davidsbarbershop84.com/visit` | 233 E 84th St, 2nd–3rd Ave | 26 | Open Sundays, closed Saturdays | 30 |

Sitelinks use the same Final URL suffix as the ad group, so their clicks keep the UTMs.

### Callouts

| Callout | Chars | Note |
| --- | ---: | --- |
| Since 1972 | 10 |  |
| Father-and-Son Shop | 19 |  |
| Open Sundays 9am–6pm | 20 |  |
| Closed Saturdays | 16 | Always worded as closed; the ad schedule also skips Saturdays |
| Book Online or Call | 19 |  |
| Prices Posted Online | 20 |  |
| Between 2nd & 3rd Ave | 21 |  |
| Walk-Ins Welcome | 16 | Hold until the owner confirms (the window sign says it) |

### Structured snippet

Header **Services**: Haircut (7), Haircut & Beard (15), Line Up (7), Beard (5), Beard Trim (10). These are the services on Booksy.

### Price asset — matches Booksy (checked 2026-11-03)

Type *Services*, qualifier none, unit none, final URL `https://davidsbarbershop84.com/services`. Prices are exactly the ones in Admin → Services; re-copy them if those change.

| Header | Chars | Price | Description | Chars | Booksy |
| --- | ---: | ---: | --- | ---: | --- |
| Haircut | 7 | $35 | A classic cut | 13 | $35 |
| Haircut & Beard | 15 | $55 | Haircut and beard | 17 | $55 |
| Line Up | 7 | $20 | A 20-minute line up | 19 | $20 |
| Beard | 5 | $20 | Beard work, 15 minutes | 22 | $20 |
| Beard Trim | 10 | $20 | A 15-minute beard trim | 22 | $20 |

### Call asset

Phone `+1 212-861-9179` (the Site settings number), call reporting on, schedule = opening hours (no Saturdays).

### Location asset

Link the Google Business Profile for David's Barber Shop, 233 E 84th St (listing `https://maps.google.com/?cid=3355011163649612090`, the same listing the site's Directions links use). The owner must grant the Ads account access to the profile; the address then comes from the listing, not from typed text.

### Image and logo assets

Upload from `docs/ads/images/google/` (clean photos, no text or overlays, which Google's image-asset rules require):

| File | Ratio | Size | Use |
| --- | --- | --- | --- |
| `landscape-storefront-1200x628.jpg` | 1.91:1 | 1200×628 | Storefront with sign and barber pole |
| `landscape-shopfloor-1200x628.jpg` | 1.91:1 | 1200×628 | Shop floor, cut in progress |
| `square-shopfloor-1200x1200.jpg` | 1:1 | 1200×1200 | Shop floor |
| `square-chair-1200x1200.jpg` | 1:1 | 1200×1200 | Barber at the chair |
| `portrait-shopfloor-960x1200.jpg` | 4:5 | 960×1200 | Shop floor |
| `portrait-chair-960x1200.jpg` | 4:5 | 960×1200 | Barber at the chair |
| `logo-square-1200x1200.png` | 1:1 logo | 1200×1200 | Business logo |
| `logo-landscape-1200x300.png` | 4:1 logo | 1200×300 | Landscape logo |

Business name asset: **David's Barber Shop**.

## Meta (Facebook and Instagram)

Objective Traffic (or Leads with a website destination); ~1–2 miles around the shop; Advantage+ placements off so Feed and Stories each get their own crop. Images are in `docs/ads/images/meta/` (pole rule and gold mark; no words on the photo).

### Ad set `meta-ues-35-cut` — Neighbourhood · $35 cut

**Status:** Price matches Booksy (Haircut $35). Photo consent still on hold.  
**Landing page:** `/l/35-dollar-cut` · **CTA button:** Book Now

| Field | Copy | Chars |
| --- | --- | ---: |
| Primary text | A classic cut is $35 at David's Barber Shop, a father-and-son shop on East 84th Street since 1972. | 98 |
| Primary text | Father and son, cutting hair on East 84th Street since 1972. Haircuts $35. Book online or call the shop. | 104 |
| Headline | Manhattan quality. $35 a cut. | 29 |
| Headline | $35 haircuts on East 84th St | 28 |
| Description | 233 E 84th St · Closed Sat | 26 |

| Ad (utm_content) | Placement | Image | Final URL |
| --- | --- | --- | --- |
| `feed-1x1-shopfloor` | Feed 1:1 | `meta/feed-1x1-shopfloor-1080x1080.jpg` | `https://davidsbarbershop84.com/l/35-dollar-cut?utm_source=meta&utm_medium=paid_social&utm_campaign=meta-ues-35-cut&utm_content=feed-1x1-shopfloor` |
| `feed-4x5-chair` | Feed 4:5 | `meta/feed-4x5-chair-1080x1350.jpg` | `https://davidsbarbershop84.com/l/35-dollar-cut?utm_source=meta&utm_medium=paid_social&utm_campaign=meta-ues-35-cut&utm_content=feed-4x5-chair` |
| `stories-shopfloor` | Stories / Reels 9:16 | `meta/stories-9x16-shopfloor-1080x1920.jpg` | `https://davidsbarbershop84.com/l/35-dollar-cut?utm_source=meta&utm_medium=paid_social&utm_campaign=meta-ues-35-cut&utm_content=stories-shopfloor` |

### Ad set `meta-ues-heritage` — Neighbourhood · heritage (no price in the ad)

**Status:** Price matches Booksy (the landing page shows $35). "Open Sundays" matches the approved hours; photo consent still on hold.  
**Landing page:** `/l/upper-east-side-barber` · **CTA button:** Book Now

| Field | Copy | Chars |
| --- | --- | ---: |
| Primary text | Your Upper East Side barber since 1972. A father-and-son shop between Second and Third Avenue. | 94 |
| Primary text | Classic cuts, fades and line ups on East 84th Street. Book online or call the shop. Open Sundays. | 97 |
| Headline | Your Upper East Side barber | 27 |
| Headline | The barber on East 84th Street | 30 |
| Description | Since 1972 · Book online | 24 |

| Ad (utm_content) | Placement | Image | Final URL |
| --- | --- | --- | --- |
| `feed-1x1-chair` | Feed 1:1 | `meta/feed-1x1-chair-1080x1080.jpg` | `https://davidsbarbershop84.com/l/upper-east-side-barber?utm_source=meta&utm_medium=paid_social&utm_campaign=meta-ues-heritage&utm_content=feed-1x1-chair` |
| `feed-4x5-shopfloor` | Feed 4:5 | `meta/feed-4x5-shopfloor-1080x1350.jpg` | `https://davidsbarbershop84.com/l/upper-east-side-barber?utm_source=meta&utm_medium=paid_social&utm_campaign=meta-ues-heritage&utm_content=feed-4x5-shopfloor` |
| `stories-chair` | Stories / Reels 9:16 | `meta/stories-9x16-chair-1080x1920.jpg` | `https://davidsbarbershop84.com/l/upper-east-side-barber?utm_source=meta&utm_medium=paid_social&utm_campaign=meta-ues-heritage&utm_content=stories-chair` |

## Final URLs checked in a browser

Checked 2026-11-04 on the development site, each URL in a fresh browser with its UTMs (an example keyword filled in for Google). Every page showed the matching headline (A or B, depending on the visitor's split) and the Book button's Booksy link carried the same utm_source / utm_medium / utm_campaign / utm_content / utm_term. The landing_view events were stored with those UTMs. The hot towel shave URL was in this check too; that page is now switched off. On 2026-11-03 the offer page moved to `/l/35-dollar-cut` and was re-checked with the Meta URL below.

| Ad | URL tested (path + query) |
| --- | --- |
| Google · Shop-wide $35 cut | `/l/35-dollar-cut?utm_source=google&utm_medium=cpc&utm_campaign=search-ues&utm_content=rsa-35-cut&utm_term=mens+haircut+upper+east+side` |
| Google · Barber / Upper East Side searches | `/l/upper-east-side-barber?utm_source=google&utm_medium=cpc&utm_campaign=search-ues&utm_content=rsa-ues-barber&utm_term=barber+upper+east+side` |
| Google · Barber: Michael | `/l/book-michael?utm_source=google&utm_medium=cpc&utm_campaign=search-ues&utm_content=rsa-barber-michael&utm_term=michael+barber+upper+east+side` |
| Meta · Neighbourhood · $35 cut | `/l/35-dollar-cut?utm_source=meta&utm_medium=paid_social&utm_campaign=meta-ues-35-cut&utm_content=feed-1x1-shopfloor` |
| Meta · Neighbourhood · heritage (no price in the ad) | `/l/upper-east-side-barber?utm_source=meta&utm_medium=paid_social&utm_campaign=meta-ues-heritage&utm_content=feed-1x1-chair` |

## Images

See `docs/ads/images/README.md` for sources, crops and the colour grade, and for what to swap in when the owner supplies full-size originals.
