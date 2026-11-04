# Admin guide — David's Barber Shop website

Everything on the public site (barbers, prices, hours, banner, ad landing pages) is edited here. No code changes are needed for day-to-day updates.

## Signing in

1. Go to `/admin` on the site (or `/sign-in`).
2. Sign in with Google or with your email. Email sign-in sends a one-time code.
3. You only get in if an owner has added your email under **Staff access**. Anyone else who signs in sees "no access".

### Roles

| Role | Can do |
| --- | --- |
| **Owner** | Everything, including adding/removing staff accounts. |
| **Editor** | Everything except Staff access. |

Safety rules built in: you cannot remove your own access, and the last remaining owner cannot be removed. Keep at least two owners so one can always restore the other.

**First owners:** set the `ADMIN_BOOTSTRAP_EMAILS` environment variable to a comma-separated list (for example `david@…,son@…`) before the first start. Those emails become owners only if the staff list is empty. After that, manage people from **Staff access**.

## Daily / weekly tasks

### Log confirmed bookings (Bookings)

Booksy does not tell the website when someone actually books, so cost per booking is only real if bookings are logged here.

1. Open **Bookings → Log booking**.
2. Pick the barber, the time the booking was made, the value (defaults to the offer price in Site settings), and the source (Google Ads, Meta Ads, Organic, Walk-in, Other).
3. **gclid / fbclid / campaign:** fill these only when you can tie the booking to a specific ad click with confidence (for example the client told you the ad, and the click shows in *Live events* on the Performance page for that barber). Do **not** copy the most recent click just because it was close in time — that sends wrong data to Google. Leave it blank if unsure; the booking still counts in the report as unattributed.
4. Tick **Repeat client** for returning clients so repeat rate is visible per barber.

### Upload conversions to Google Ads (Bookings → Export)

**Export Google Ads offline conversions CSV** downloads every booking that has a gclid, in Google's legacy offline-conversion format (`Parameters:TimeZone=America/New_York` first line, then `Google Click ID, Conversion Name, Conversion Time, Conversion Value, Conversion Currency`). Conversion name is `booking_confirmed`.

Upload it in Google Ads → Goals → Conversions → Uploads (or through Data Manager — see `ADS_PLAYBOOK.md`, Data Manager needs the headers on the first line, so delete the `Parameters:` line there). Upload at least weekly; Google rejects clicks older than 90 days.

### Record ad spend (Campaigns)

Add one row per ad campaign: platform, optional barber and landing page, budget, **spend to date**, start/end dates. Update *spend to date* when you check the ad account. The report counts spend from campaigns that were running during the selected window, so for clean numbers keep one campaign row per month (end-date the old one, start a new one).

### Read the report (Performance)

- **Cost / booking** = spend ÷ logged bookings. Target is **$60**. Status per barber: *on target*, *over target*, *no bookings* (spend but nothing logged), *no spend*.
- **Book clicks / call clicks / landing views** come from the website itself (first-party, no cookies).
- **Landing page A/B** shows views and click rate for variant A vs B of each landing page.
- **Live events** refreshes every 30 seconds and shows each click with its page and ad tags.

## Content

### Barbers

- **Add barber:** name (slug is generated), title, years cutting, specialties (comma separated), bio, photo, gallery images, Instagram/TikTok/other link, display order, Active toggle.
- **Booksy link:** leave blank to use the shop's Booksy page. The public site then says "Opens the shop's Booksy page. Choose *Name* when you pick your time." Only paste a barber-specific Booksy link after testing that it opens with that barber selected.
- **Notable clients:** each name has a consent switch. Names with consent **off** are never shown publicly — the public API does not even send them. Only switch it on when written consent is on file.
- **Photos:** images only, up to 15 MB. Without a photo the site shows a monogram card, never a stock face.
- Reorder with the arrows; hide someone temporarily with the Active toggle instead of deleting.

### Services

Name, description, price, duration, category (groups on the Services page), order, active. Price changes show on the site immediately. Keep these in line with Booksy — a customer who sees one price here and another on Booksy will not book. The menu was copied from Booksy on 2026-11-03, and each service carries its Booksy service ID so its Book link opens Booksy on that service. If a price changes on Booksy, change it here too (and the offer price in Site settings for the haircut).

### From the wall

Framed photos from the shop wall, shown as a timeline on **Our Story** and as a three-photo teaser on the home page.

- **Each entry:** photo, caption, optional year, the people in it, an optional TV/press credit, and the **Permission on file** switch.
- **Permission on file is the only thing that makes an entry public.** Leave it off until you have written permission from everyone named or shown (New York Civil Rights Law §50–51), and from the broadcaster for a TV still. While it is off, the photo, caption and names are never sent to the public site, not even hidden in the page, and the photo file itself cannot be opened by anyone who is not signed in as staff.
- **Year:** leave blank unless you know it. Entries with no year keep the order you set with the arrows (or the Display order number). Years are only displayed, never used to re-sort.
- **TV or press credit:** shown as plain text, "As seen on FOX 5 Good Day New York". Never upload a channel logo.
- **People:** comma separated. Only names you supply; never guessed from a face.
- If no entry has permission, the timeline and the home teaser are hidden completely.
- The four framed photos (FOX 5, the signed #22 photo, Aaron Judge, Carlos Beltran) were cleaned up (cropped, straightened, glare reduced, no faces or signatures retouched) and added as hidden drafts. The original scans are kept unchanged in the project files.
- These photos are never used in ads.

### Landing pages (ads)

Each landing page lives at `/l/<slug>`.

- **Kind:** *offer* (shop-wide, video hero, Site settings offer price), *barber* (that barber's card and Book button) or *service* (leads with one service's posted price; Book opens Booksy on that service once the service has a Booksy service ID).
- **Variant A / B:** fill the B headline to run an A/B test. Each visitor is assigned A or B once and keeps it. Leave B empty to show A to everyone. Change one thing at a time: leave the B subheadline empty so B reuses A's.
- Seeded pages, all with a B headline: `/l/35-dollar-cut`, `/l/upper-east-side-barber` (offer), `/l/book-david`, `/l/book-sean`. The ad that points at each one is in `docs/ads/AD_CREATIVE.md`.
- `/l/hot-towel-shave` is switched off: Booksy has no shave service. The old `/l/30-dollar-cut` link now shows "This offer has closed up shop".
- To retire `/l/upper-east-side-barber`, switch it **off** rather than deleting it; a deleted one is recreated when the server restarts.
- A service or barber page that is switched off, or whose service/barber is switched off, shows "This offer has closed up shop" instead of a stale promise.
- Landing pages are hidden from search engines (`noindex`) on purpose; they exist for ads.

### Site settings

- **Offer price** drives the "$35 a cut" headline everywhere. Keep it equal to the Haircut price on Booksy.
- **Comparison price + source note:** shown as "vs. $X median at nearby UES shops" with the note as a footnote. Leave it empty until the owner approves the claim. Research supporting $45 is in `docs/research/competitors.md`.
- **Announcement banner:** a one-line strip at the top of every page (holiday hours, closures). Empty = hidden.
- **TV or press credit:** shown as text, "As seen on …", on the home page hero and every ad landing page. Leave it empty until the owner confirms the credit is accurate to state (e.g. `FOX 5 Good Day New York`). Never a channel logo.
- Shop name, founded year, phone (E.164, e.g. `+12128619179`), email, address, Booksy business URL, Instagram.
- **Google Maps listing link:** the shop's own Google listing (`https://maps.google.com/?cid=3355011163649612090`, "David's Barber Shop, 233 E 84th St"). Every Directions / Open in Google Maps link, the map on Visit, and the search-engine data use it. Use the listing's link, not an address search.
- **Google Place ID:** filled in automatically the first time the Gallery loads listing photos. It is cleared automatically if you change the listing link, and looked up again.
- **Hours:** each day open/close or closed. Saturday closed is displayed in red as "Closed Saturdays" everywhere.

### Google listing photos (Gallery)

The Gallery shows up to six photos live from the shop's Google listing, each credited to the person who posted it, with a "See all on Google" link. They are not downloaded or saved; Google's terms forbid that, and many are customers' own photos. To change which photos appear, manage them on the Google Business Profile. The strip needs the `GOOGLE_API_KEY` secret (Google Maps Platform, Places API (New) enabled); without it, or if Google is down, the strip simply does not appear.

### Staff access (owners only)

Add an email with a role. The person signs in with that email (Google or email code). Remove access with the trash icon.
