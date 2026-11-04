# Ad images

Exported for Google Ads and Meta from the shop's own photos. Copy and ad mapping are in `docs/ads/AD_CREATIVE.md`; the owner preview is `docs/ads/preview.html`.

## Sources (only the shop's own photos)

| Source | What it shows | Used for |
| --- | --- | --- |
| `attached_assets/brand/about1.jpg` | A barber at the chair | `*-chair-*` |
| `attached_assets/brand/about2.jpg` (same photo as `public/media/storefront.jpg`) | The storefront, sign and pole | `landscape-storefront-*` |
| `attached_assets/brand/about3.jpg` | The shop floor, a cut in progress | `*-shopfloor-*` |
| `attached_assets/brand/logo.png`, `public/logo.svg` | Logo | logo files (redrawn as SVG in `src/`) |

Not used: the styled site media (`towel`, `interior`, `pole`, `tools`, `clippers`) because they are not photos of this shop, `gallery1–6` because they are 120×100 thumbnails that look like stock, and any Google listing photo uploaded by other people. Crops leave out the wall posters and framed pictures, so no player or celebrity image appears.

## Before running

- **People in the photos.** about1 and about3 show a barber and clients. The owner must confirm they agreed to appear in ads before these run.
- **Resolution.** The sources are about 350 px wide, so every export is upscaled and soft at full size. Ask the owner for the original files (or a short shoot of the chairs, the pole and the storefront) and re-export with the same crops.

## Files

`google/` — clean photos, no text or overlays (Google image assets must not carry overlaid logos or text):

| File | Ratio | Crop from source (W×H+X+Y) |
| --- | --- | --- |
| `landscape-storefront-1200x628.jpg` | 1.91:1 | about2 `349x183+0+0` |
| `landscape-shopfloor-1200x628.jpg` | 1.91:1 | about3 `294x154+55+118` |
| `square-shopfloor-1200x1200.jpg` | 1:1 | about3 `290x290+59+70` |
| `square-chair-1200x1200.jpg` | 1:1 | about1 `274x274+69+170` |
| `portrait-shopfloor-960x1200.jpg` | 4:5 | about3 `290x362+59+3` |
| `portrait-chair-960x1200.jpg` | 4:5 | about1 `274x343+69+130` |
| `logo-square-1200x1200.png` | 1:1 logo | `src/logo-square.svg` |
| `logo-landscape-1200x300.png` | 4:1 logo | `src/logo-landscape.svg` |

`meta/` — same crops with the brand devices and no words on the photo:

- `feed-1x1-*-1080x1080.jpg`, `feed-4x5-*-1080x1350.jpg`: photo, the barber-pole rule along the bottom edge (`src/pole-rule.svg`) and the small gold "D" mark bottom-right (`src/mark.svg`).
- `stories-9x16-*-1080x1920.jpg`: ink tile-floor frame (`src/stories-frame.svg`), the logo in the top safe zone, pole rules above and below a 1080×1040 photo window. The top 250 px and bottom 340 px are left clear for Instagram's own interface.

## Look (brand guide)

Ink `#0D0B0A`, gold `#C8A464`, bone `#ECE6DA`, oxblood `#912731` (the red stripe in the pole rule), per `docs/brand/BRAND_GUIDE.md`; Playfair Display for the wordmark, Poppins for the small caps line. The photo grade is warm and slightly desaturated, with a soft dark vignette.

Grade used on every photo, in order (ImageMagick):

1. crop as in the table, then resize to the export size with the Lanczos filter;
2. `-unsharp 0x1.2+0.7+0.02`;
3. warm colour matrix `-color-matrix "1.08 0 0 0 1.0 0 0 0 0.86"`;
4. `-modulate 100,86` (less saturation);
5. `-sigmoidal-contrast 2.5x45%`;
6. radial vignette from transparent to `rgba(13,11,10,0.5)` composited with Multiply.

JPEG quality 88; logos are PNG with transparency.
