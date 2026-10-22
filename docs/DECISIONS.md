# Decisions

Dated 2026-10-22 unless noted. Each entry: the decision, why, and what would change it.

## Booking and tracking

**Booksy stays the booking system; the site sends people to listing 1663005.**
Why: it is the shop's live, bookable listing (the older listing 179705 has no prices or staff and only invites the business to join). What would change it: the owner confirms a different profile link or Booksy retires one.

**No barber preselection by URL; barber buttons say "Opens the shop's Booksy page. Choose X…".**
Why: Booksy documents no URL parameter for choosing a staffer, and guessing one could silently fail. Each barber has an optional own Booksy link field; it is used only once a tested link exists.

**Attribution is captured first-party, first touch, in the browser (localStorage) and attached to every event.**
Why: Booksy will not carry gclid/fbclid through to a booking, and advertisers cannot add their own tag on Booksy pages. Keeping the first ad touch lets a returning visitor still be credited to the ad that found them. UTMs are also appended to the Booksy link in case Booksy reports on them.

**`booking_confirmed` is logged by staff in the admin, not inferred from clicks.**
Why: there is no Booksy webhook available to us. A click is intent, not a booking. Staff add a gclid only when the link to a click is certain; guessing would feed Google wrong data.

**Google Ads offline import uses the legacy CSV format with `Parameters:TimeZone=America/New_York`.**
Why: it is the simplest format for a weekly manual upload and is still accepted. For Data Manager, remove that first line (it needs headers first). Meta's legacy Offline Conversions API ended May 2025; Meta bookings go through dataset CSV upload.

**No cookie banner yet.**
Why: the site loads no third-party pixels or analytics; first-party events use an anonymous random ID and no cookies. The banner is required, and will be added, at the same time as any Google tag, GTM container or Meta Pixel (needs IDs from the owner).

**A/B variant is assigned 50/50 per visitor per landing page and stored in the browser.**
Why: a visitor should see the same headline every visit, and it needs no server state.

## Content and claims

**Haircut and headline price are $30.**
Why: the brief sets $30 as the ad offer. Conflict flagged: the old site says $25, Booksy says $35. The owner must make $30 bookable on Booksy before ads run.

**Comparison price stays off until approved.**
Why: research supports "$45 median of eight nearby UES shops" (`docs/research/competitors.md`), but a price comparison in ads must be approved by the owner and shown with its dated source. When set, the site shows the source note as a footnote.

**Only verbatim customer reviews; one excluded.**
Why: invented or edited reviews are deceptive. The "andy l." review was left out because it mentions a $35 price that contradicts the $30 offer.

**No invented facts.** Copy says only what reviews or the owner support (1972, father-and-son, Second–Third Ave, clients from Queens/Long Island/East Harlem, 7+ years). Removed during review: "thirty years" regulars, "kids' first cuts", "same corner, same chairs", "Haircuts start at $30" (Crew Cut is $22).

**No barber photos until real ones exist; monogram cards instead.**
Why: stock faces presented as staff would mislead customers.

**Celebrity clients are stored with a consent flag; unconsented names never leave the server.**
Why: the old site named Aaron Judge, Carlos Beltran, Jacoby Ellsbury and Sandy Alderson with no recorded consent. None are published. Filtering happens in the public API, so a front-end mistake cannot leak them.

## Admin and access

**Clerk sign-in + a staff allowlist in the database (owner / editor).**
Why: sign-in alone would let anyone with a Google account in. Owners manage the list; the last owner and your own account cannot be removed. First owners come from `ADMIN_BOOTSTRAP_EMAILS`, used only when the list is empty.

**Money is stored in cents; spend is "spend to date" per campaign.**
Why: avoids rounding errors and matches how owners read their ad dashboards. Trade-off: the report counts the full spend of any campaign running during the window, so keep one campaign row per month for clean monthly numbers.

**Seed data is inserted only into empty tables.**
Why: restarts and redeploys must never overwrite the owner's edits.

## SEO and old URLs

**Old site anchors are redirected in the browser:** `/#About-Us` → `/our-story`, `/#Our-Services` and `/#Price-List` → `/services`. `/#Testimonials` stays on the home page (reviews are there).
Why: the old site was one page; fragments never reach the server, so a server-side 301 cannot see them.

**Ad landing pages (`/l/*`), sign-in and admin are `noindex` and disallowed in robots.txt.** `BarberShop`/`HairSalon` JSON-LD is on the home and visit pages. `sitemap.xml` lists the public pages under `https://davidsbarbershop84.com` (the intended domain after DNS cutover).

## Verification approach

Verified by driving the real app in a browser and calling the real API (sign-in with a real Clerk test account, clicking buttons, reading the database rows they created), not by test scripts — per the owner's standing instruction. All test data was deleted afterwards.
