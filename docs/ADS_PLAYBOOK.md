# Ads playbook — turning ad clicks into Booksy bookings

Goal: paid traffic → landing page → Booksy booking at **≤ $60 cost per confirmed booking**. Evidence and sources behind every recommendation here are in `docs/research/booksy-and-tracking.md` and `docs/research/competitors.md`.

**Ready-to-load creative** (every ad group, keyword list, counted headline and description, extension, image and final URL, with its landing page and on-hold status) is in `docs/ads/AD_CREATIVE.md`. The owner reviews it in `docs/ads/preview.html`; images are in `docs/ads/images/`.

## Before spending a dollar (launch blockers)

1. **The advertised price must be bookable.** Cleared 2026-11-03: the owner confirmed Booksy's menu, so the site, landing pages and ad copy say Haircut $35, the same as Booksy listing 1663005. If the price changes, change Booksy, Admin → Services, the Site settings offer price and the ad copy together.
2. **Roster must match Booksy.** The site lists David and Sean; Booksy's public listing currently shows **Michael, Russel and Alex**. Barber ads only make sense for barbers a client can actually select on Booksy.
3. **Comparison claim:** only turn on "vs. $45 median at nearby UES shops" after the owner approves it; keep the source note filled in (it shows as a footnote). Re-check prices every 6 months.
4. **Owners added** under Staff access (at least two).
5. **Pixel/tag IDs and a consent banner** — see "Platform tags" below; not needed to launch with Google's offline import, needed before adding Meta Pixel or a Google tag.
6. **Opening hours.** Booksy shows Mon and Fri from 9:00, Tue–Thu from 9:30 and Fri until 4:30; the site says 8:30–7 on weekdays. Ad lines that state hours, the ad schedule and the call schedule wait until the owner confirms the hours.
7. **Price asset:** every price item must match Booksy. It does as of 2026-11-03 (Haircut $35, Haircut & beard $55, Line up $20, Beard $20, Beard trim $20).
8. **Photo consent:** the owner confirms that the barber and clients in the ad photos agreed to appear, and supplies full-size originals.
9. **"As seen on FOX 5 Good Day New York":** off until the owner confirms it is accurate. Then fill *TV or press credit* in Site settings (it shows as text on the home and landing pages) and add the reserve headline.

## What the site measures

| Event | When | Stored with |
| --- | --- | --- |
| `landing_view` | Visitor opens `/l/<slug>` | landing slug, A/B variant, barber |
| `book_click` | Any Book button (header, hero, mobile bar, barber card, landing page) | barber (when on a barber page/landing), variant |
| `call_click` | Any Call / phone link | barber (when on a barber page/landing), variant |
| `booking_confirmed` | Logged by staff in Admin → Bookings | barber, value, source, gclid/fbclid if known |

Every event also carries the visitor's **first-touch** `utm_source / utm_medium / utm_campaign / utm_content / utm_term / gclid / fbclid`, saved in the browser on the first visit and kept even if they come back later without tags. The same UTMs are appended to the outgoing Booksy link. Events also go to `window.dataLayer` (`book_click`, `call_click` with `barber`) so a Google Tag Manager container can pick them up later without code changes.

**Limits (verified in research):** Booksy does not let advertisers install their own Google tag, has no documented way to pass a click ID into a booking, and no verified way to preselect a barber by URL. A `book_click` is intent, not a booking.

## Campaign structure

### Google Ads (start here)

- **Search** campaign `search-ues`, geo: ~1 mile around 233 E 84th St (UES + Yorkville), ad schedule matching opening hours (no Saturday).
- One responsive search ad per ad group, each landing on its own page (headline 1 pinned to the line that matches the landing headline):

  | Ad group | Landing page | Status |
  | --- | --- | --- |
  | Shop-wide $35 cut | `/l/35-dollar-cut` | price matches Booksy; hours lines and photo consent on hold |
  | Barber / UES searches | `/l/upper-east-side-barber` | price matches Booksy; hours lines on hold |
  | Hot towel shave | — | retired: Booksy has no shave, page switched off |
  | Barber: Sean, Barber: David | `/l/book-sean`, `/l/book-david` | blocked until the barber is on Booksy |

  New barbers get an ad group only after they have a site profile and can be chosen on Booksy.
- Keywords and negatives per ad group: see `docs/ads/AD_CREATIVE.md`.
- Turn on **auto-tagging** (adds gclid). Put readable UTMs in each ad group's **Final URL suffix**: `utm_source=google&utm_medium=cpc&utm_campaign=search-ues&utm_content=rsa-<ad group>&utm_term={keyword}`. These show up as-is on landing views and Book clicks.
- Assets: sitelinks (Services & prices, Our Story, Barbers, Visit), callouts (including "Closed Saturdays", never shown as open), structured snippet of services, call asset with the shop number (call reporting on), location asset (link the Google Business Profile), image and logo assets from `docs/ads/images/google/`. The price asset waits until every price matches Booksy.
- **Conversions:** create an *Import → Other data sources → Track conversions from clicks* action named exactly `booking_confirmed`, category "Converted lead", value = use value from file. Keep it **secondary** at first; use clicks/calls for bidding until there are roughly 15+ imported bookings a month, then make `booking_confirmed` primary.
- Bidding: start with Maximize Clicks with a CPC cap (~$3), move to Maximize Conversions once `booking_confirmed` has volume, then Target CPA $60.

### Meta (Facebook / Instagram)

- Objective: Traffic (or Leads with a website destination); radius ~1–2 miles; men 21–55 as a starting audience.
- Two ad sets: `meta-ues-35-cut` (price-led) → `/l/35-dollar-cut`, and `meta-ues-heritage` (no price in the ad) → `/l/upper-east-side-barber`. Each has Feed 1:1, Feed 4:5 and Stories 9:16 creative from `docs/ads/images/meta/`; copy is in `docs/ads/AD_CREATIVE.md`.
- Creative uses the shop's own photos only, with the pole rule and gold mark and no words on the image. Not the styled site media (towel, interior, tools), not Google listing photos posted by others, and no player or celebrity names or images on any platform.
- Tag every ad URL: `?utm_source=meta&utm_medium=paid_social&utm_campaign=<name>&utm_content=<ad>`. Meta adds `fbclid` itself.
- Booksy's own **Facebook "Book Now" integration** can attach a Meta pixel to the Booksy profile (Booksy Settings → Online Booking → Facebook). Test it in Events Manager → Test Events before relying on it; which events it sends is not documented.
- Meta's old Offline Conversions API ended in May 2025. To report bookings, upload a CSV to a **dataset** in Events Manager (Data sources → dataset → Upload events) or use Conversions API later. Uploads cannot be edited or deleted, so check the file first.

## Weekly routine (≈15 minutes)

1. In Booksy, list the week's new online bookings. Log each in **Admin → Bookings** with barber, time, value, source. Add a gclid only when the link to a specific click is certain (see ADMIN_GUIDE).
2. **Export Google Ads offline conversions CSV** and upload it (Google Ads → Goals → Conversions → Uploads). Check the upload's accepted/rejected rows.
3. Update **spend to date** on each campaign in Admin → Campaigns.
4. Open **Performance** (30d). Per barber: cost/booking vs $60, book clicks, call clicks, repeat bookings. For each landing page, compare A vs B click rate.
5. Decide (and get the owner's sign-off before any budget change):
   - Over $60 for two weeks in a row → cut that ad group or barber's budget, or test a new headline as variant B.
   - Under $60 with bookings available → raise budget in steps of ~20%.
   - A/B: declare a winner only after ~100 views per variant and a clear click-rate gap; copy the winner into A and write a new B.

## A/B testing on landing pages

- Each `/l/<slug>` can carry a B headline/subheadline (Admin → Landing pages). Visitors are split 50/50 and keep their variant.
- Page kinds: **Offer** (leads with the Site settings offer price), **Barber** (one barber), **Service** (leads with one service's posted price and opens Booksy on that service).
- Test one thing at a time: change the headline and leave the B subheadline blank so B reuses A's. Seeded tests:
  - `/l/35-dollar-cut`: "Manhattan quality. $35 a cut." vs "A real Upper East Side barber. Since 1972."
  - `/l/upper-east-side-barber`: "Your Upper East Side barber. Since 1972." vs "The barber on East 84th Street. Since 1972."
  - `/l/book-<barber>`: "Book with X." vs "Your next cut, with X."
- The ad's pinned headline 1 options match A and B, so whichever variant a visitor gets, the words they clicked are on the page.
- Landing pages and the home page carry the ads' proof points: father-and-son, since 1972, East 84th St, posted prices, Closed Saturdays, verbatim reviews, and the TV credit once confirmed.

## Platform tags and consent (deferred)

The site currently loads **no third-party ad pixels or analytics** — only its own first-party events. That is why there is no cookie banner yet. Before adding a Google tag, GTM container or Meta Pixel:

1. Get the IDs from the owner's ad accounts.
2. Add a consent banner that blocks those tags until the visitor accepts, and wire Google Consent Mode.
3. Update the Privacy page to name the tags.

## Things never to do

- Don't promise a price that Booksy doesn't honour.
- Don't make comparison claims ("vs. $45", "without the UES price") until the owner approves them and the source note is filled in.
- Don't use star ratings or review counts in ads, or photos other people uploaded to the Google listing.
- Don't name celebrity clients in ads or on the site without recorded consent (Admin → Barbers → Notable clients → consent switch).
- Don't use ethnic or religious descriptors for the shop, barbers or audiences.
- Don't attach a gclid to a booking by guessing; unmatched bookings still count in the totals.
- Don't change ad budgets without the owner's go-ahead.
