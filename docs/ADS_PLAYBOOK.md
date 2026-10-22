# Ads playbook — turning ad clicks into Booksy bookings

Goal: paid traffic → landing page → Booksy booking at **≤ $60 cost per confirmed booking**. Evidence and sources behind every recommendation here are in `docs/research/booksy-and-tracking.md` and `docs/research/competitors.md`.

## Before spending a dollar (launch blockers)

1. **The $30 price must be bookable.** The old site says Hair Cut $25; the live Booksy listing (1663005) says Haircut $35. Ads promising $30 that land on a $35 booking page will burn money and invite complaints. Owner: set Haircut to $30 on Booksy (or change the offer price in Site settings to match Booksy).
2. **Roster must match Booksy.** The site lists David and Sean; Booksy's public listing currently shows only **Michael**. Barber ads only make sense for barbers a client can actually select on Booksy.
3. **Comparison claim:** only turn on "vs. $45 median at nearby UES shops" after the owner approves it; keep the source note filled in (it shows as a footnote). Re-check prices every 6 months.
4. **Owners added** under Staff access (at least two).
5. **Pixel/tag IDs and a consent banner** — see "Platform tags" below; not needed to launch with Google's offline import, needed before adding Meta Pixel or a Google tag.

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

- **Search**, geo: ~1 mile around 233 E 84th St (UES + Yorkville), ad schedule matching opening hours (no Saturday).
- Keywords: `barber upper east side`, `barbershop near me`, `mens haircut UES`, `barber 10028`, `fade upper east side`, `hot towel shave nyc` (phrase/exact). Negatives: `jobs`, `school`, `license`, `salon women`, `kids` (if not offered).
- Final URL: `/l/30-dollar-cut` for shop-wide ads; `/l/book-<barber>` for barber-name or "book with X" ads.
- Turn on **auto-tagging** (adds gclid). Add a tracking template only for UTMs: `{lpurl}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={creative}&utm_term={keyword}`.
- Assets: call asset with the shop number (enable call reporting), location asset (link Google Business Profile), price asset ($30 haircut).
- **Conversions:** create an *Import → Other data sources → Track conversions from clicks* action named exactly `booking_confirmed`, category "Converted lead", value = use value from file. Keep it **secondary** at first; use clicks/calls for bidding until there are roughly 15+ imported bookings a month, then make `booking_confirmed` primary.
- Bidding: start with Maximize Clicks with a CPC cap (~$3), move to Maximize Conversions once `booking_confirmed` has volume, then Target CPA $60.

### Meta (Facebook / Instagram)

- Objective: Traffic (or Leads with a website destination) to `/l/30-dollar-cut`; radius ~1–2 miles; men 21–55 as a starting audience.
- Creative: shop interior, chair, hot towel, the "$30 a cut" line, and real barbers once photos exist. No celebrity names or images without written consent.
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
- Test one thing at a time: price-led ("Manhattan quality. $30 a cut.") vs heritage-led ("A real Upper East Side barber, without the Upper East Side price.") is seeded on `/l/30-dollar-cut`.

## Platform tags and consent (deferred)

The site currently loads **no third-party ad pixels or analytics** — only its own first-party events. That is why there is no cookie banner yet. Before adding a Google tag, GTM container or Meta Pixel:

1. Get the IDs from the owner's ad accounts.
2. Add a consent banner that blocks those tags until the visitor accepts, and wire Google Consent Mode.
3. Update the Privacy page to name the tags.

## Things never to do

- Don't promise a price that Booksy doesn't honour.
- Don't name celebrity clients in ads or on the site without recorded consent (Admin → Barbers → Notable clients → consent switch).
- Don't use ethnic or religious descriptors for the shop, barbers or audiences.
- Don't attach a gclid to a booking by guessing; unmatched bookings still count in the totals.
- Don't change ad budgets without the owner's go-ahead.
