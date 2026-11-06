---
name: Google tag / GA4 setup
description: How the site's Google tag (GTM-PGFZHWGJ → GA4 G-K1CZTWPT3V) behaves and how to verify it by hand.
---
- GTM-PGFZHWGJ serves a Google tag bundle that already configures G-K1CZTWPT3V and sends page_view on load and on SPA history changes (enhanced measurement). Never add `gtag('config', 'G-K1CZTWPT3V')`.
- `debug_mode` via `set` or `config` did not add `_dbg=1` to hits (tested 2026-11-06), so DebugView can't be relied on; dev checks use `?analytics=on` and read `g/collect` hits.
- Verify with agent-browser `network requests`, filtered on `tid=G-K1CZTWPT3V`: the Booksy iframe sends many GA hits of its own. Events are batched; wait ~10 s or navigate before reading.
- No opt-in banner (decided 2026-11-06 for a US local audience; see docs/DECISIONS.md). EU/UK/CH get consent denied by default, and the Privacy page has an opt-out.

**Why:** the double-count and the noisy Booksy hits cost several attempts to sort out.
**How to apply:** any analytics, Google Ads conversion or consent work on this site.
