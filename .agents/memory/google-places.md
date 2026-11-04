---
name: Google Places listing photos
description: Durable facts and diagnostics for the shop's Google listing link and the live listing photos (Places API (New)).
---

- The shop's real listing is CID 3355011163649612090 ("David's Barber Shop, 233 E 84th St"). The keyless embed `maps.google.com/maps?cid=<cid>&output=embed` shows the listing card; an address `q=` search does not reliably do so.
- Places API (New) answers a misconfigured key with a bare 403 "The caller does not have permission" (no hint). Usual causes: Places API (New) not enabled (separate from legacy "Places API"), key API restrictions excluding it, HTTP-referrer application restrictions (server calls need None/IP), or no billing account.
- The server's daily request ceilings live in memory and reset on API server restart.

**Why:** Google's terms forbid caching Places content (Place ID only), and the owner wants the cost kept low.
**How to apply:** if the Gallery strip is missing, look for "Google text search failed with 403" in the API server log before changing code.
