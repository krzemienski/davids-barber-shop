# Booksy booking links and paid-ad conversion tracking

**Research date: 2026-10-22.** Business: David’s Barber Shop, 233 E 84th St, New York, NY 10028. This is research, not an implementation or an authenticated account audit. Quotes below are from official sources unless explicitly marked third-party. “Could not verify” does not mean a feature is impossible.

## 1. Booksy capabilities, limitations, and partner access

### Can a website link or widget preselect a barber?

**Staff selection is supported; a supported arbitrary website URL/widget parameter for preselection could not be verified.** Do not invent a `staffer`, `stafferId`, or similar query-string contract.

- Booksy’s official [widget article](https://biz.booksy.com/blog/a-new-booksy-widget-will-help-you-attract-clients) says: “Clients can choose their preferred staff member or select ‘any staff member’ to see the availability of all staff members on a given day.” This establishes selection **inside** the widget, not a documented parameter to preselect someone before opening it.
- The US [website widget support instructions](https://support.booksy.com/hc/en-us/articles/23480739244434-How-to-add-a-booking-widget-to-my-website-WordPress-Joomla-and-other-CMS-Platforms) say: “Go to **Business Settings**,” select “**Online Booking**,” then “**Your Website**.” They explain: “Each business on Booksy has its own unique booking widget code … that should be copied and implemented on your website.” They do not document a staff-preselection setting, callback, or parameter.
- The public HTML of David’s active listing contains a staff record for **Michael**, and review/service data references staff ID **1582201**. No staff-specific `href` with `staffer`, `staff_id`, or `staffId` was found. An internal identifier is **not** proof that appending it to a URL will select that barber.
- Searches for Booksy staff-specific links, `?staffer=`, `stafferId=`, and staff URL documentation did not produce an official parameter specification. Neither listing exposed a usable staff-specific booking URL in the extracted public content. We did not complete an authenticated booking or access the business’s private widget generator.

**Instagram is an important qualified exception.** The official US [Instagram instructions](https://support.booksy.com/hc/en-us/articles/16486489939602-How-do-I-take-bookings-from-Instagram) explicitly say: “all Staffers can add a personal Book now button to their Instagram accounts (as long as their Instagram profile is set to **Professional**).” Owners/managers can add the business button. Instagram setup is Edit profile → Contact options → Add an action button → Book now → Booksy → sign in. This verifies a staff-personal integration exists, **not** a reusable staff URL or widget parameter for this website. Ask each staffer/Booksy to supply the actual generated link and test the destination before using it elsewhere.

**Boost is not a staff-link or tracking API.** Booksy’s [Boost help](https://support.booksy.com/hc/en-us/articles/16485524178066-How-do-I-prevent-being-charged-for-Boost) says: “Share your Booksy Profile Link … to help separate existing clients from new clients who find you through Boost.” It also tells owners to check that Instagram/Facebook Book Now buttons are routed to their Booksy Profile Link. Use the owner-generated profile link, verify it resolves to business **1663005**, and ask support how website/ad referrals are treated for Boost charges. Do not substitute a guessed Boost-specific query parameter.

**Fallback:** “Book on Booksy — choose Michael when booking.” Other barber names should only be offered after the owner confirms they are bookable. If staff preselection cannot be verified, every barber button should clearly disclose that it opens the shop’s booking page; do not imply that the barber has already been selected.

### Does Booksy preserve or pass through UTM parameters?

**End-to-end preservation, appointment-level attribution, and export of UTM/GCLID/FBCLID could not be verified.**

A direct HTTP check on 2026-10-22 appended `utm_source=research&utm_medium=verification&utm_campaign=parameter-check` to the active listing. It returned HTTP 200 without removing the query from the final HTTP URL. This only proves that the **initial landing URL accepts those parameters**. It does not prove persistence through client-side navigation, sign-in, app handoff, checkout, an appointment record, webhook, or staff export.

Searches of Booksy’s help/marketing materials for UTM preservation and the reviewed widget, Instagram, Facebook, and Boost instructions found no contractual pass-through documentation. Booksy using UTM parameters in its own marketing links is not evidence of appointment attribution support.

**Fallback:** retain attribution on the first-party website before navigation. Log `book_click`/`call_click`, timestamp, landing URL, consent status, and available UTM/GCLID/FBCLID against a first-party lead/session identifier. Passing UTMs outward may be useful, but must not be the only attribution store. Never put customer PII in booking URLs.

### GA4, Google Ads tags, and Meta pixel inside hosted Booksy

| Capability | Finding and evidence |
| --- | --- |
| Advertiser’s Google tag / Google Ads tag on hosted booking pages | **Not available as a normal self-installed tag.** Booksy’s own [February 24, 2026 Google Ads article](https://biz.booksy.com/blog/mastering-google-ads-for-booksy-profile-the-local-actions-strategy) says: “If you send traffic directly to your Booksy subdomain, you can’t install your own Google Tag to see who actually booked.” |
| GA4 booking-completion tracking | **Could not verify a supported GA4 measurement-ID integration, hosted completion event, or cross-domain linker setup.** The Google-tag limitation above means the website’s GA4 tag must not be assumed to observe Booksy confirmations. Searches for Booksy GA4/Google Analytics integration found no official setup documentation establishing it. |
| Meta pixel | **There is an official integrated Facebook path; a blanket ‘Booksy supports no pixels’ would be wrong.** Booksy’s [Facebook Book Now setup](https://support.booksy.com/hc/en-us/articles/16486693756178-How-do-I-add-the-Book-Now-button-to-Facebook) says: “Choose the appropriate Facebook Pixel or create a new one” and “this Pixel will be added to your Booksy profile for tracking availability and the like.” Setup begins in Booksy Settings → Online Booking → Facebook → Connect with Facebook, then connects Business Manager, Page, service catalog, ad account, and pixel. |
| Meta completed-booking event coverage | **Could not verify** which events the integration emits, whether confirmations carry booking IDs/value, whether website-origin bookings are covered, whether it uses CAPI, or whether it currently works for this account. “Tracking availability and the like” is not an explicit completed-booking guarantee. Owner must connect the correct dataset/pixel and verify actual events in Events Manager/Test Events before relying on them. Instagram’s personal Book Now integration alone does not prove this pixel setup is active. |
| Booksy widget completion callbacks | **Could not verify** a documented JavaScript completion callback/postMessage API. Do not equate a widget open/button click with a booking. Embedding a cross-origin flow does not give the parent website access to its confirmation page. |

Booksy’s Google Ads article proposes linking Google Business Profile/location assets and Reserve with Google for “Local Actions.” That is a **separate Google-owned acquisition path**, not proof that an arbitrary website → Booksy appointment is attributed or confirmed. The article itself discusses people clicking “Book”; do not relabel such an action as a staff-verified appointment without validating the actual Google conversion definition.

### Public/Partner API: what it is, access, and appointment webhooks

**Official entry points:** [docs.booksy.com](https://docs.booksy.com/) and the supplied US API base [`https://us.booksy.com/public-api/us/`](https://us.booksy.com/public-api/us/).

- An anonymous fetch of the docs returned no readable documentation. A direct HTTP header check returned **401** with `WWW-Authenticate: Basic` on 2026-10-22. This is gated documentation, not a usable anonymous/self-serve API key flow.
- A request to the US base root returned **404**. A base root need not be an endpoint; this neither disproves the API nor verifies any individual route.
- **Secondary evidence, not an official guarantee:** the independent [API Evangelist Booksy profile](https://github.com/api-evangelist/booksy) describes a partner-facing REST/JSON API for businesses and booking data, including services, resources, customers, and appointments. It lists the US base above, partner authentication, and an appointment webhook with `CREATED`, `MODIFIED`, and `CANCELLED` events. The profile explicitly says it is an “independent, third-party profile” and is not endorsed by Booksy.
- **Appointment webhook: reported to exist, but could not independently verify in accessible official docs.** Do not promise webhook access, payload fields, signatures, subscription setup, delivery guarantees, or attribution fields before Booksy supplies partner documentation and entitlement. No public official self-service partner application form or guaranteed access for an individual shop was verified.

**How to request access:** contact Booksy Biz US support from the owner account (in-app chat) or **info.us@booksy.com**, asking to be routed to the integrations/partner API team. The official [Instagram support article](https://support.booksy.com/hc/en-us/articles/16486489939602-How-do-I-take-bookings-from-Instagram) confirms: “You can contact our Support Team at info.us@booksy.com or via chat.” This is a verified support channel, **not** a verified automatic API approval process. Access may require a partner agreement/business authorization; eligibility, cost, and turnaround remain unverified.

#### Owner’s draft request

> **Subject: David’s Barber Shop NYC — authorized Public/Partner API and booking attribution request**
>
> Hello Booksy US Support / Integrations Team,
>
> I own David’s Barber Shop at 233 E 84th St, New York, NY 10028. Our current Booksy business page is https://booksy.com/en-us/1663005_davids-barbershop_barber-shop_30067_new-york-city (business ID 1663005). There is also an older listing, ID 179705; please confirm the correct profile and advise how to retire or redirect the old one.
>
> Our website sends Google Ads and Meta visitors to Booksy. We want to measure actual confirmed appointments, not just booking-link clicks, and have authorized our website developer to help subject to your access/privacy requirements.
>
> Please route this to the Public/Partner API team and tell us whether our business is eligible, the application/approval process, terms and pricing, required owner authorization, and how to receive access to docs.booksy.com, a sandbox, and US production credentials for https://us.booksy.com/public-api/us/.
>
> We need minimum-scope read access to our appointments, staff, services, status changes/cancellations, booking IDs, booking-created time, appointment time, and service amounts. Is an appointment CREATED/MODIFIED/CANCELLED webhook available? Please provide subscription instructions, payload examples, authentication/signature verification, retries, and cancellation handling. Do appointment records/webhooks retain original UTMs, GCLID, FBCLID, or a supported external reference we can supply? If not, is there an approved attribution/matching mechanism?
>
> Can you supply supported staff-specific booking URLs (including Michael), or a documented widget option to preselect a staff member? Please provide the generated profile/widget links from Business Settings → Online Booking → Your Website, and explain how they interact with Boost referral/commission attribution.
>
> Finally, does our account support GA4/Google Ads booking confirmations or the Facebook Book Now pixel integration? Which exact Meta events, IDs and values are sent, and do website-origin appointments qualify? Please provide current official documentation and verification steps.
>
> We will not scrape private endpoints or expose credentials in the browser. Please explain permitted customer-data use, consent, retention, and minimum permissions. Thank you.

## 2. Which of the two listings is active?

### Active/bookable public listing: business 1663005

[David’s barbershop](https://booksy.com/en-us/1663005_davids-barbershop_barber-shop_30067_new-york-city), **233 E 84th St, New York, 10028**.

The public page shows priced services with “Book” buttons, **5.0 / 1 review**, and a confirmed-client review dated **September 28, 2026**, with “Staffer: Michael.” The fetched page’s structured `employee` and staff records list **Michael** only. No other staff names were visible in those records; this is not a guarantee that no additional employees work at the shop.

| Public service name | Price shown | Duration shown |
| --- | ---: | ---: |
| Haircut | $35.00 | 25 min |
| Beard | $20.00 | 15 min |
| Haircut & beard | $55.00 | 45 min |
| Line up | $20.00 | 20 min |
| Beard trim | $20.00 | 15 min |

Prices are a public-page snapshot, not owner-approved permanent pricing. “Beard” and “Beard trim” are separate names on this page; do not silently merge them.

### Older/non-bookable-looking listing: business 179705

[David’s Barber Shop](https://booksy.com/en-us/179705_david-s-barber-shop_barber-shop_30067_new-york-city), **233 E 84Th St, New York, NY**.

The page says: “Let David’s Barber Shop know you want to book,” offers “Invite to booksy,” and shows “No Reviews Yet…”. Services listed: **Hair Cuts, Kid Cuts, Hot Shave, Shampoo & Cut, Beard Trim**. **No prices, durations, or staff names were visible** in fetched content.

**Conclusion:** use **1663005** for booking CTAs, subject to the owner’s confirmation. The old listing appears to be an unclaimed/invitation-style duplicate, not the current bookable profile. We cannot prove account ownership, administrative status, or future availability from public pages. Ask Booksy to consolidate/retire it; do not claim it has been removed.

## 3. Google Ads offline CSV and Meta offline events in 2026

### Google Ads: current recommended import route

Use **Google Ads Data Manager** for new CSV/Sheets connections, and adopt **enhanced conversions for leads** where the consented first-party identification setup permits it. Do not design new automation around the old Google Ads API offline-upload route.

Official [upgrade guidance](https://support.google.com/google-ads/answer/14274408?hl=en) says: “Starting June 15, 2026, offline conversions import and enhanced conversions for leads uploads will be migrated to the Data Manager API and blocked in the Google Ads API.” It also says enhanced conversions for web/leads became a unified setting starting April 2026. This API transition does **not** mean CSV import is discontinued.

The [legacy CSV instructions](https://support.google.com/google-ads/answer/7014069?hl=en) now direct users to Data Manager and state: “Offline conversion import is a legacy feature.” Retain compatibility with the shop’s existing GCLID CSV if necessary, but select/download the actual template from the account and map it in Data Manager.

#### Fields and timestamp format

For the shop’s **GCLID-based legacy CSV**:

| Column | Requirement |
| --- | --- |
| `Google Click ID` | Required: the actual GCLID of the ad click associated with that booking. Preserve exact value/case; do not hash it. UTMs and FBCLID are not substitutes. |
| `Conversion Name` | Required: exact spelling/capitalization of the pre-created import conversion action, e.g. `booking_confirmed`. |
| `Conversion Time` | Required: actual confirmation event time with the correct timezone, after the ad interaction. Not upload time or the future haircut time. |
| `Conversion Value` | Optional in the basic schema; populate with a consistent booking value when importing value conversions. Numeric amount, no currency symbol. |
| `Conversion Currency` | Optional in the basic schema; supply `USD` with monetary values. |
| `Order ID` | Optional, strongly recommended: stable unique booking identifier for deduplication/adjustments. |
| Consent columns | Supply accurate consent values where supported/requested by the selected template. Do not manufacture “Granted.” Enhanced-conversion templates have additional user-data requirements. |

**Data Manager is not identical to the legacy file parser.** Its official [preparation guide](https://support.google.com/google-ads-data-manager/answer/14184381?hl=en) says: “the first line of the file must contain the headers.” It maps source columns to GCLID, conversion date/time, value, currency, transaction ID, etc.; the conversion action may be chosen in setup rather than required in each row. For GCLID-only offline imports, its schema lists GCLID as required. Download/use the account’s selected template rather than assuming arbitrary headers or a legacy parameters row will work everywhere.

Safe Data Manager timestamp example: `2026-10-22T14:30:00-04:00`. The guide explicitly supports ISO 8601 timestamps with offsets and says rows missing a timezone are not imported unless a fallback timezone is set. Use **America/New_York** as the fallback and handle daylight saving correctly; New York is not always UTC−05:00.

For the **legacy** parser, the official CSV page supports `yyyy-MM-dd HH:mm:ss+z`, e.g. `2026-10-22 14:30:00-0400`, or `2026-10-22 14:30:00 America/New_York`. Its file-level syntax is `Parameters:TimeZone=America/New_York`. Do **not** add that as the first row of a Data Manager file that requires headers first. These are format illustrations, not fabricated booking records.

#### GCLID, windows, enhanced conversions, and import checks

- Enable Google Ads auto-tagging and retain real GCLIDs first-party. The [import guidelines](https://support.google.com/google-ads/answer/15081888?hl=en) say: “Offline conversions that were uploaded more than 90 days after the associated last click won’t be imported.” **90 days is an upload limit measured from the click**, not a promised attribution window; also respect the conversion action’s configured click-through window.
- The same official page says enhanced-conversion lead uploads more than **63 days** after the associated last click are not imported. Upload promptly/daily; do not use 90 days for every import type.
- Enhanced conversions for leads supplements click identifiers with consented user-provided data such as email/phone. The [2026 upgrade instructions](https://support.google.com/google-ads/answer/14274408?hl=en) say GCLID is “Required if you are not implementing a tag to collect user-provided data.” With an appropriately configured user-provided-data tag, matching can work without a captured GCLID; continue including GCLID when available. UTMs alone still cannot establish a Google Ads conversion.
- The [Data Manager schema](https://support.google.com/google-ads-data-manager/answer/14184381?hl=en) requires mapping at least email or phone for enhanced conversions for leads. Accept customer-data terms, normalize/hash as required for the selected connector, set accurate consent, and verify diagnostics. Data Manager supports automatic SHA-256 normalization/hashing; the legacy instructions require pre-hashing scheduled enhanced-lead uploads, while a manual unhashed-file option can hash for the advertiser. Follow the selected integration’s rules, not a blanket “always upload plaintext” rule.
- **This website currently logs clicks, not a first-party identified lead form.** Booksy-held email/phone is not automatically a valid first-party website tag setup. Enhanced conversions is a potential upgrade, not a guaranteed fix requiring no additional collection/consent.
- Create the conversion action before importing; validate mappings and preview errors, then check accepted/rejected rows and diagnostics. The guidelines explain deduplication uses identifier + conversion name + event time. Re-upload with stable identifiers/timestamps, not newly generated confirmation times. Include a stable booking/order ID wherever supported.

### Attribution gap: manually logging a booking does not automatically identify its click

A first-party `book_click` with GCLID is an anonymous intent signal. The resulting Booksy booking may contain customer details but **no first-party session/lead ID**. Having both datasets does not establish which booking belongs to which click.

Only export a booking with a GCLID if there is a defensible link, such as a consented identified first-party lead record later reconciled to the customer, an approved Booksy external reference/webhook, or another owner-verified lead trail. Do not assign the most recent click, match merely by proximity in time, or invent a GCLID for organic/Meta bookings. Retain unmatched bookings internally and report them as unattributed.

### Importing `booking_confirmed` as a value conversion

Create an offline/import conversion action named exactly `booking_confirmed`, normally under a converted-lead category for a confirmed but unpaid appointment. Use different values per conversion and import the actual agreed service amount (or a documented expected-value model), currency **USD**, real confirmation time, and stable booking ID.

Keep **booked appointment value** distinct from **collected revenue**. A $35 haircut booking is not proof of $35 received. Record completed/paid appointments separately if revenue reporting is needed. Handle cancellations and price corrections through supported adjustments/retractions where available; a booking ID is especially valuable for this. Never double-count staff edits/reschedules as new appointments.

### Meta: legacy Offline Conversions API versus current offline events

**Offline events still exist in 2026. The old Offline Conversions API is not the current API.**

Meta’s official [changes notice](https://www.facebook.com/business/help/1835755323554976) says: “Offline Conversions API will be discontinued in May 2025 as the Conversions API now fully supports offline events.” The [manual-upload article](https://www.facebook.com/business/help/155437961572700) recommends uploading events to **datasets** and converting old integrations into **Conversions API** integrations.

**Simplest low-volume path: manual CSV upload to a dataset in Events Manager.** Meta’s current [instructions](https://www.facebook.com/business/help/155437961572700) explicitly support it:

1. Create/select the business’s dataset, assign it to the ad account, and grant the uploader appropriate permissions.
2. Events Manager → Data sources → select dataset → **Upload events** → **Select CSV file**.
3. Map columns, review errors/warnings and estimated match rate, then start the upload.
4. Supply a supported event name, precise actual event time, customer matching details obtained/used lawfully, stable booking/order ID, and value/currency where relevant. Use the uploader’s examples/template rather than reusing the Google Ads CSV unchanged.

The official article says: “Once you upload offline event data, you can’t delete or update it.” Review carefully before uploading, especially tentative bookings and incorrect values. Availability/permissions in the owner’s actual Events Manager were **not** verified; if Upload events is absent, check dataset permissions with Meta support or use a supported CAPI/partner integration.

**Later automation:** Meta’s [offline-events developer guide, updated January 5, 2026](https://developers.facebook.com/documentation/ads-commerce/conversions-api/offline-events) says: “The Conversions API is Meta’s recommended integration method for sending offline and physical store events.” It uses `/{DATASET_ID}/events` and requires event name/time and customer matching data. Keep tokens server-side; normalize/hash applicable customer fields and use stable event/order IDs.

The guide recommends “in real time or on a daily basis.” It documents a normal CAPI event-time limit of **7 days**, with up to **62 days for offline/physical-store events** using `physical_store`. **Use the truthful action source**: an online Booksy confirmation is not a physical-store event simply because someone enters it manually. Apply the relevant website/phone/physical-store requirements, and do not exploit the longer store window for web bookings.

For a confirmed appointment use Meta’s **Schedule** event where supported by the selected upload/integration (verify mappings), or a supported custom `booking_confirmed` conversion. Do not label an unpaid appointment **Purchase** merely to obtain value reporting. Reserve Purchase for actual purchases/payments and supply value/currency. If the manual uploader’s supported names do not include Schedule, use its current documented mapping or CAPI/custom conversion rather than guessing.

FBCLID is useful context, but not a standalone offline CSV customer match guarantee. Use lawful customer matching information and, for an applicable website CAPI flow, correctly captured browser/click identifiers according to Meta’s current parameter rules. Never invent identifiers.

### Recommended primary optimization while booking volume is low

**Recommendation, not a platform-mandated volume threshold:**

- **Google Ads:** make first-party `book_click` the initial primary action for relevant campaigns. It is a useful higher-intent proxy, **not a booked appointment**. Start `booking_confirmed` as secondary/observation with values; keep `call_click` secondary unless call-driven appointments are sufficiently important and validated.
- Google’s [primary/secondary documentation](https://support.google.com/google-ads/answer/11461796?hl=en) says primary actions are “used for bidding” when their standard goal is selected, while secondary actions are “for observation only.” It also warns that secondary actions in a **custom goal** are used for bidding. Check campaign goals, not just the primary/secondary label.
- **Meta:** optimize initially toward a measured website `book_click` custom conversion/event if that event and campaign objective are eligible and volume is adequate. A first-party database log alone does not send an optimization signal to Meta or Google; configure the actual platform tag/CAPI/conversion import with consent. Do not optimize to Schedule on an outbound click.
- Monitor the click-to-confirmation rate, booking quality, cancellations, and accepted/matched imports. When confirmed-booking measurement is reliable and volume supports stable delivery, switch optimization to `booking_confirmed`/Schedule and make `book_click` secondary. Avoid optimizing equally to both funnel stages, which rewards the same customer twice. Do not begin value/ROAS bidding based on sparse or speculative booking values.

## 4. Fallbacks and decisions recommended

1. **Canonical booking destination:** use listing **1663005**. Have the owner verify its generated Profile Link; ask Booksy to resolve duplicate **179705**.
2. **No guessed staff deep links:** use the business page with “Choose your barber on Booksy.” Michael is the only publicly verified staff name. Adopt per-staffer links only after receiving/testing official generated URLs on desktop/mobile and checking app handoff.
3. **Widget optional, not an attribution cure:** obtain the real code from Business Settings → Online Booking → Your Website. If it fails or cannot preselect staff, keep an ordinary accessible link to the same active profile.
4. **Own the measurable boundary:** retain consented first-party attribution and instrument actual outbound `book_click`/`call_click`. Do not call them confirmed bookings or assume UTMs survive Booksy.
5. **Bridge identity before promising ad attribution:** staff log confirmed bookings and real values; import only those legitimately associated with click/customer identifiers. Keep unattributed bookings in internal totals. No API/UTM feature means manual reconciliation, not invented matches.
6. **Google launch:** `book_click` primary; `booking_confirmed` secondary with USD values. Use Data Manager/current account templates; daily uploads and diagnostics. Evaluate enhanced conversions for leads only with an eligible identified first-party lead and consent setup.
7. **Meta launch:** test the official Facebook Book Now pixel integration rather than assuming it is unsupported or complete. For low-volume verified bookings use dataset CSV uploads if available; move to CAPI when automation is justified. A website-origin online confirmation must not be mislabeled physical-store or Purchase.
8. **Request partner access now, do not block launch on it:** send the draft above. Until official API/webhook permissions, payloads and attribution fields are confirmed, keep the manual process and clearly label all unverified capabilities.

### What remains unverified / what was tried

Public fetches of both listings; inspection of active-listing HTML/structured staff data; searches for staffer URL parameters, UTM persistence, GA4, pixels, widget customization and partner access; official widget/Instagram/Facebook/Boost support articles; Booksy’s 2026 Google Ads article; anonymous docs/API HTTP checks; and current official Google/Meta import documentation were reviewed.

No owner account, private widget configuration, partner credentials, appointment webhook payload, checkout completion, test-event dashboard, Ads account, or Events Manager dataset was accessed. Therefore staff-link preselection, full booking-flow parameter retention, current account-specific Meta completion events, API eligibility, and official appointment-webhook semantics remain explicit verification tasks for the owner/Booksy—not production promises.
