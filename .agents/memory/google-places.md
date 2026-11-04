---
name: Google Places listing photos
description: Durable facts and diagnostics for the shop's Google listing link and the live listing photos (Places API (New)).
---

- The shop's real listing is CID 3355011163649612090 ("David's Barber Shop, 233 E 84th St"). The keyless embed `maps.google.com/maps?cid=<cid>&output=embed` shows the listing card; an address `q=` search does not reliably do so.
- Places API (New) answers a misconfigured key with a bare 403 "The caller does not have permission" (no hint). Usual causes: Places API (New) not enabled (separate from legacy "Places API"), key API restrictions excluding it, HTTP-referrer application restrictions (server calls need None/IP), or no billing account.
- Full weekly hours can't be read without a working key: signed-out Google Maps shows only today's row, Google Search returns a captcha to this container, and the Google Maps connector only searches docs. The keyless embed card does show name, address and rating.
- Signed-out Google Maps opens this listing in "limited view": only one photo appears (the owner's Nov 2020 FOX 5 still), so the full photo set cannot be collected from the public page without signing in.
- 2026-11-04: the user supplied a working key as the `GOOGLE_API_KEY` secret; the server reads that one. The older `GOOGLE_MAPS_API_KEY` belongs to a project with no Maps APIs turned on and stays rejected. If a key "fixed in Console" keeps returning 403, the change went into a different Google Cloud project than the key's.
- The server's daily request ceilings live in memory and reset on API server restart.

**Why:** Google's terms forbid caching Places content (Place ID only), and the owner wants the cost kept low.
**How to apply:** if the Gallery strip is missing, look for "Google text search failed with 403" in the API server log before changing code.
