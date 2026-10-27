---
name: Booksy widget facts
description: Verified behavior of Booksy's website widget (undocumented params, postMessage events, framing) for the barbershop booking integration.
---
- No owner-generated API key exists; the partner API (docs.booksy.com, 401) is Booksy-granted only. The embed needs only public IDs (business 1663005, staffer, variant).
- The widget iframe `booksy.com/widget-2021/index.html` is frameable; the profile page is not (XFO DENY).
- Undocumented `stafferId` / `variantId` params work (hand-tested 2026-10-27); they can change without notice, so keep the plain Booksy link as a fallback.
- postMessage `close.appointmentCompleted` is the only browser-side "booked" signal. `logged-in` carries a customer access token: never log it.

**Why:** the official docs say none of this; it came from reading Booksy's widget bundle and live browser tests, which took several attempts.
**How to apply:** any Booksy booking, tracking or barber-preselect work. Full detail is in docs/research/booksy-integration.md.
