# Booksy integration: what to ask the owner, and how to embed it in this site

**Research date: 2026-10-27.** Follows `booksy-and-tracking.md` (2026-10-22), which covers ad attribution and the old duplicate listing. This file answers two questions: what the developer needs from the shop owner, and how Booksy should be built into this site's design.

Method: Booksy's official help articles; Booksy's own widget files, read directly (`code.js`, `widget.css`, the widget app bundle); and the live widget for business 1663005, driven by hand in a real browser. No booking was made.

## 1. Short answer

There is **no API key the owner can create**, and the embed does not need one.

| What | Needed for | Who has it |
| --- | --- | --- |
| Booksy **business ID** | Embedding the booking widget | Public. 1663005 is the active, bookable listing. The owner only confirms it is his. |
| **Staffer ID** for each barber | "Book with [barber]" buttons that open on that barber | Public once each barber is set up as staff in the owner's Booksy account. Michael is **1582201**. |
| **Service (variant) ID** for each service | "Book" on a service row that opens straight on that service's calendar | Public on the Booksy page. Example: Haircut & beard is **19748052**. |
| **Partner API credentials** | Reading confirmed appointments automatically (webhook / server API) | Only Booksy can grant these, through its partner program. Not self-serve. Optional. |

## 2. What to ask the owner (send this)

1. **Confirm the account.** "Is https://booksy.com/en-us/1663005_davids-barbershop_barber-shop_30067_new-york-city your Booksy page?" If he would rather send something, ask for the widget code: Booksy Biz → **Business Settings** (phone: **Profile → Settings**) → **Online Booking** → **Your Website** → **Copy to clipboard**, or the **email it** option in that screen. The code contains the business ID.
2. **Add the two other barbers as staff in the same account.** In Booksy Biz, add each as a staff member, give each the services they perform and their working hours, and make sure they are bookable online. Send their names as they should appear on the site. Their staffer IDs show up on the public page after that; nothing else is needed from them.
3. **Fix the haircut price.** Booksy shows Haircut at **$35**; the site advertises **$30**. One of them has to change before the site goes live.
4. **Optional: API access, only if automatic confirmed-booking data is wanted.** Email info.us@booksy.com or use in-app chat, using the draft request in `booksy-and-tracking.md` §1. Nothing below depends on it.

No password, login, or key should be shared. None of the steps above needs one.

## 3. What Booksy officially supports

- **Website widget.** Official steps: Business Settings → Online Booking → Your Website → copy the code. "The widget is compatible with JavaScript-enabled websites and CMS platforms that allow custom script insertion." "Booksy does not provide additional assistance with implementing the widget." ([support article](https://support.booksy.com/hc/en-us/articles/23480739244434-How-to-add-a-booking-widget-to-my-website-WordPress-Joomla-and-other-CMS-Platforms))
- **Choosing a barber.** Official: "Clients can choose their preferred staff member or select 'any staff member'" inside the widget. ([Booksy blog](https://biz.booksy.com/blog/a-new-booksy-widget-will-help-you-attract-clients))
- **Partner API.** It lives at docs.booksy.com, which returns **401 (Basic auth)**; checked again today. The base URL is `https://us.booksy.com/public-api/us/`. Third-party profiles ([API Evangelist](https://github.com/api-evangelist/booksy), apis.io) describe partner-issued RSA key pairs that sign a JWT, exchanged at `/token/` for short-lived bearer tokens. They also describe an appointment webhook with CREATED, MODIFIED and CANCELLED events. These are not official; treat them as what to expect if Booksy grants access.
- **Booksy's own profile page cannot be embedded.** It sends `X-Frame-Options: DENY` and `frame-ancestors 'none'`. Only the widget page can be shown inside this site.

## 4. How the widget works (from Booksy's own files)

The official snippet is one script tag:

```html
<script src="https://booksy.com/widget/code.js?id=1663005&country=us&lang=en"></script>
```

It redirects to `/widget-2021/code.js`. Supported query values: `id`, `businessId`, `country`, `lang`, `mode` (`dialog` default, or `inline`), `theme`, `appointmentUid`. The script:

- In `dialog` mode, inserts Booksy's own 200×54 px image button and a link to `booksy.com/{lang}-{country}/dl/show-business/{id}`. On click it adds a dark overlay and a white dialog holding an iframe.
- In `inline` mode, inserts the iframe in place, 770×660 by default.
- Loads `widget-2021/widget.css` into the host page (styles `.booksy-widget-*` only).
- Builds the iframe URL: `https://booksy.com/widget-2021/index.html?id=…&businessId=…&appointmentUid=…&lang=…&country=…&mode=…&theme=…&uniqueId=…`
- Listens for `postMessage` events from that iframe: `resize` (sets the iframe height), `close`, `goToUrl` (the host page navigates there), `sendPost`, and `ready`.

The widget page itself has no `X-Frame-Options` or CSP, so any site can frame it. This site sends no CSP either, so nothing blocks it.

### Parameters the widget reads (not documented; tested live)

The widget app reads more query values than `code.js` passes. These were tested by hand on business 1663005:

| Parameter | Effect, as observed |
| --- | --- |
| `stafferId=1582201` | Lists that staffer's services. With a non-existent ID (`999999`) the service list is empty, so the filter is real. |
| `variantId=19748052` (+ `stafferId=1582201`) | Opens directly on the date/time picker for "Haircut & beard, $55", Staff: Michael. |
| `variantId=1` (invalid) | Shows "Something went wrong: Requested service is no longer available" over the normal list. A wrong ID fails visibly instead of booking the wrong thing. |
| `defaultStafferId` | Read by the app; preselects a staffer while still allowing others. Not tested on its own. |
| `utm_source` / `utm_medium` / `utm_campaign` / `utm_content` / `utm_term` | The app reads these from its own URL and attaches them to its analytics when the traffic source qualifies. Whether they reach the appointment record is unverified. |
| `theme` | Only Booksy-approved custom themes load (the bundle allow-lists one, `pl-538489`). The widget's colors (white, teal) cannot be changed from outside. |

The UI was tested with only one staffer on the account. Filtering between two real barbers has to be checked again once the other two are added.

These parameters are undocumented. Booksy can change them without notice, so the site must keep working if they stop: a wrong ID shows Booksy's error with the full service list behind it, and the link fallback (below) still works.

### Messages the widget sends to the host page

All are sent with target origin `*`, so this site receives them. Each carries the `uniqueId` from the iframe URL.

- `ready`; `resize {width, height}`
- `close {appointmentCompleted: true|false}`: sent when the visitor closes the widget. `appointmentCompleted` becomes `true` after a booking is created. **This is the only in-browser "booking made" signal.** It fires only when the visitor closes the widget. Not verified end to end, because that needs a real appointment (with the owner's OK, booked and then cancelled).
- `goToUrl {url}`: the widget asks the host page to navigate (e.g. to the Booksy app or a payment step).
- `logged-in {accessToken}` / `logged-out`: **contains the customer's Booksy access token. Never log, store, or forward it.**
- `booking {action, appointmentUid}` is only sent in Booksy's marketplace context, not to website widgets.

## 5. Integration plan for this site's design

Current behavior: every gold **Book** button opens the Booksy profile in a new tab (`bookUrlFor` in `src/components/site.tsx`). Barber buttons show a note telling the visitor to pick the barber on Booksy.

Proposed:

1. **Keep the site's own gold Book buttons.** Do not load `code.js`: it injects Booksy's teal image button and its own overlay CSS. Build the widget iframe URL ourselves from the same parameters. The site keeps its look, and Booksy's code stays out of the site's own page.
2. **Booking sheet.** Clicking Book opens a site-styled dialog: ink overlay, gold rule, close button, focus trap, Esc to close. It holds the iframe (`mode=dialog`, so the widget shows its own close/back), sized by the `resize` messages. On phones it fills the screen, as Booksy's CSS does under 480 px. Booksy's white card sits inside the dark frame; its colors cannot be changed.
3. **Per-barber booking.** Add a "Booksy staffer ID" field for each barber in admin. A barber's Book button passes `stafferId`, and the "choose your barber on Booksy" note disappears for that barber.
4. **Per-service booking.** Add a "Booksy service ID" field for each service in admin. A service row's Book button passes `variantId`, plus `stafferId` when it is shown on a barber's page.
5. **Settings.** Replace (or derive from) the "Booksy business URL" setting with a **business ID** field. The business URL stays as the no-JavaScript and failure fallback.
6. **Fallback.** Every Book button stays a real link to the Booksy page (works with JavaScript off, middle-click, or if the iframe fails to load within a timeout). The click is intercepted only to open the sheet.
7. **Tracking.** Keep `book_click`. Add `booking_widget_ready`, plus `booking_completed` when `close.appointmentCompleted === true`, with barber and service but no customer data. Accept messages only from origin `https://booksy.com` with the matching `uniqueId`, and ignore `logged-in`/`logged-out`. Pass the visitor's stored UTMs into the iframe URL, as the buttons already do for the outbound link.
8. **Copy.** The privacy page says "When you tap Book, you leave this site for Booksy." Change it to say the booking form is provided by Booksy, inside this site, under Booksy's privacy policy.
9. **Admin bookings log.** `booking_completed` gives a count of bookings made on the site. It is still not a confirmed appointment with a value; the manual log stays the source for ad imports until Booksy grants API access.

What stays unverified until the owner acts: filtering between multiple barbers (needs the two staff added); `booking_completed` firing on a real booking (needs one real test booking, then cancelled, with the owner's permission).
