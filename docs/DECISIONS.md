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

**Haircut is $30 walk-in, $35 booked; the menu is the owner's price list** (dated 2026-11-05).
Why: the owner's note: "Haircut $30 for Walk-in and $35 for appointment. Haircut and beard $45. Take out beard leave beard trim. Add crew cut $22. Add Royal Shave with hot towel $35", and "make it known that walk-ins are available at 30 or if you would like to book an appointment you could do it for 35". The owner's word now overrides Booksy. The headline price is the walk-in $30, always shown together with "Book an appointment $35" so nobody clicks Book expecting $30. A service's price is its booked price; an optional walk-in price is shown next to it. "Beard" is switched off, not deleted. Crew cut and Royal shave are not on Booksy, so they show "Walk-in" instead of a Book link, and their durations are blank. Booksy still lists Haircut & beard at $55 and still has "Beard"; the owner has to change those in Booksy. Prod gets the change through a guarded seed step that runs only while the menu still matches Booksy's.

**Barber photos are the owner's headshots** (dated 2026-11-05): Michael (beard, chain), Russel (wavy hair), Alex (glasses), mapping confirmed by the user. Served from `public/media/barbers/`; the seed fills a barber's photo only while it is empty, so a photo set in the admin wins. The site's other photos stay until the owner's replacements arrive.

**Earlier (2026-11-03 to 2026-11-05): haircut $35, menu copied from Booksy.**
Why: the brief set $30 as the ad offer, but Booksy listed $35. On 2026-11-03 the owner confirmed Booksy is correct, so the site's menu (Haircut $35, Beard $20, Haircut & beard $55, Line up $20, Beard trim $20, with Booksy's durations and service IDs) and the offer price follow Booksy. The old website's Shampoo & Cut, Crew Cut, Long Hair Cut and Royal Shave were dropped, the shave landing page was switched off, and `/l/30-dollar-cut` became `/l/35-dollar-cut`. Change prices on Booksy first, then in the admin.

**Comparison price stays off until approved.**
Why: research supports "$45 median of eight nearby UES shops" (`docs/research/competitors.md`), but a price comparison in ads must be approved by the owner and shown with its dated source. When set, the site shows the source note as a footnote.

**Only verbatim customer reviews; one excluded.**
Why: invented or edited reviews are deceptive. The "andy l." review was left out because it mentions a $35 price that contradicted the $30 offer at the time. Now that the haircut is $35 it could be added, word for word, if the owner wants it.

**No invented facts.** Copy says only what reviews or the owner support (1972, father-and-son, Second–Third Ave, clients from Queens/Long Island/East Harlem, 7+ years). Removed during review: "thirty years" regulars, "kids' first cuts", "same corner, same chairs", "Haircuts start at $30" (Crew Cut is $22).

**Barber photos only from the owner; monogram cards otherwise.**
Why: stock faces presented as staff would mislead customers.

**Celebrity clients are stored with a consent flag; unconsented names never leave the server.**
Why: the old site named Aaron Judge, Carlos Beltran, Jacoby Ellsbury and Sandy Alderson with no recorded consent. None are published. Filtering happens in the public API, so a front-end mistake cannot leak them.

**"From the wall" photos are hidden until the owner records written permission for each one** (dated 2026-11-03).
Why: New York Civil Rights Law §50–51 requires written consent to use a living person's name or likeness for advertising or trade, and the project rule is no celebrity names without recorded consent. The public API returns only entries with "permission on file", so a front-end mistake cannot leak an unapproved photo or name. The image files are gated too: the storage endpoint serves a wall photo to the public only while an entry using it has permission on file (signed-in staff can always see it), anything stored under `wall/` is gated even if no entry uses it, and wall photos are sent with `Cache-Control: no-store` so withdrawing permission takes effect immediately. The FOX 5 entry may say "As seen on FOX 5 Good Day New York" in text, never with the FOX logo; its photo is a broadcast still, so it is gated the same way. These photos are never used in ads. Years are shown only when the owner supplies them; undated entries keep the owner's manual order. The restored scans were only cropped, straightened and globally adjusted for glare and haze; faces and signatures were not retouched, and the original scans are kept. What would change it: nothing short of signed releases, entered entry by entry.

**Google listing photos are shown live with credit, never downloaded** (dated 2026-11-03).
Why: Google Maps Platform terms forbid storing or caching Places content (only the Place ID may be kept), and many listing photos belong to customers. The server calls Places API (New) with its own key (never sent to the browser), asks only for the `photos` field, shows at most six, and streams each image through a same-origin endpoint that accepts only photo names under the shop's own Place ID, with `Cache-Control: no-store`. Each photo shows its author's name linked to their Google profile, plus "Google Maps" attribution and a "See all on Google" link. Daily ceilings (400 detail lookups, 150 photo images, 5 Place ID lookups) cap the cost; past them, or when the key is missing or Google fails, the strip is hidden and the Gallery still works. What would change it: the owner licensing specific photos directly from their authors.

**Every map link opens the shop's real Google listing, not an address search** (dated 2026-11-03).
Why: an address search can land on a neighbour or a pin with no reviews. The listing is "David's Barber Shop, 233 E 84th St" (CID 3355011163649612090). The seed migrates the old search link to the listing link only if it was never edited.

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

**Share image is the hero still at an absolute URL; JSON-LD `image` is the real storefront** (dated 2026-11-03).
Why: scrapers ignore relative `og:image` paths, and the business image Google shows must be the actual shop. Barber profiles are not in `sitemap.xml` while the roster is unconfirmed; `/barbers` links to them.

## Content and imagery

**Only real shop photos are presented as the shop** (dated 2026-11-03). Styled `public/media/` images are background mood only, with `alt=""`.
Why: the gallery captioned a wood-panelled interior and a brownstone pole as the shop; the real shop has white walls and a red sign. That is an invented fact.

**Copy corrections to seeded rows are applied only while the row still holds the exact old text.**
Why: same rule as the Maps link: fix what we wrote, never overwrite what the owner edited.

## Verification approach

Verified by driving the real app in a browser and calling the real API (sign-in with a real Clerk test account, clicking buttons, reading the database rows they created), not by test scripts — per the owner's standing instruction. All test data was deleted afterwards.
