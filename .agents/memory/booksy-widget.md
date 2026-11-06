---
name: Booksy widget facts
description: Verified behavior of Booksy's website widget (undocumented params, postMessage events, framing) for the barbershop booking integration.
---
- No owner-generated API key exists; the partner API (docs.booksy.com, 401) is Booksy-granted only. The embed needs only public IDs (business 1663005, confirmed by the owner's Booksy embed snippet on 2026-11-03; staffer; variant).
- The widget iframe `booksy.com/widget-2021/index.html` is frameable; the profile page is not (XFO DENY).
- Undocumented `stafferId` / `variantId` params work (hand-tested 2026-10-27); they can change without notice, so keep the plain Booksy link as a fallback.
- With services assigned, `stafferId` carries through: the service list is that barber's, and the time picker shows "Staff: <name>" (re-verified for Michael 2026-11-06).
- A real staffer with no services assigned in Booksy also gives an empty list under `stafferId` (seen for Russel and Alex until the owner assigned services on 2026-11-06), the same as an invalid ID does. Staff IDs and names are in the public listing HTML's embedded data.
- User requirement (2026-11-06): picking a barber on the site must open Booksy already on that barber. Works for all three since 2026-11-06. If a barber's list is ever empty, check by reading each service's staffer list in the public page's `__NUXT_DATA__` JSON.
- postMessage `close.appointmentCompleted` is the only browser-side "booked" signal. `logged-in` carries a customer access token: never log it.

**Why:** the official docs say none of this; it came from reading Booksy's widget bundle and live browser tests, which took several attempts.
**How to apply:** any Booksy booking, tracking or barber-preselect work. Full detail is in docs/research/booksy-integration.md.
