---
name: Hero loop export
description: How the hero-loop animation becomes the site's hero.mp4 without a script or the preview-pane export.
---
The home page background (davids-barbershop media hero.mp4 + hero-poster.jpg) is a capture of the hero-loop video artifact, not a separate source.

**Why:** the user's profile forbids verification/render scripts, and the agent has no export callback; `agent-browser record start <file.mp4> <url>` (a browser tool, 30 fps, 1920x1080) captures the film opened directly on its local port (no preview controls).

**How to apply** after any change to the film:
- Record ~2 loops, then find cut points with ffmpeg scene detection (`select='gt(scene,0.08)'`). The capture loop period drifts (~16.15–16.2 s for a 16 s film), so measure it; don't assume.
- Cut from just BEFORE the towel→chair blend in loop 2 to the same point in loop 3 territory, so the last and first frames are both the un-dimmed towel. Cutting after the blend starts skips part of it and shows a jump.
- Encode muted H.264 1600x900, CRF 25, +faststart (~2 MB). Poster = a frame ~1.2 s in (chair shot), not frame 0 (towel).
