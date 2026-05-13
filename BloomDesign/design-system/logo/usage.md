# Logo usage

## Files in this folder

| File | What it is | When to use |
|---|---|---|
| `mark-shipped.png` | **Canonical** full-color logo (1024×1024, RGBA) — the painted lotus that ships on ourpregnancy.in | **Primary use everywhere.** Default for marketing, decks, social, app stores, headers. |
| `mark.svg` / `mark.png` / `mark.jpg` | Simplified flat-vector representation of the mark | Where SVG is required (icons inside other SVGs, embedded in emails as inline SVG, tiny favicons). Recognise the structure (pink crown, saffron body, mint leaves), but it is **not** a pixel-perfect recreation of the shipped logo — use `mark-shipped.png` when fidelity matters. |
| `mark-inverse.svg` / `.png` / `.jpg` | Monochrome Deep Charcoal variant | Print, fax, single-color embossing, dark-mode wordmark companion. |
| `wordmark.svg` / `.png` / `.jpg` | "Our Pregnancy" italic Playfair Display, Deep Charcoal | When the mark is shown separately (e.g., header lockups) or for text-only contexts. |
| `lockup-horizontal.svg` / `.png` / `.jpg` | Mark + wordmark side-by-side | **Primary marketing header lockup.** Use for site nav, deck title slides, email headers, LinkedIn cover. |
| `lockup-stacked.svg` / `.png` / `.jpg` | Mark + wordmark + tagline, centered | OG image (1200×630 crop), Instagram profile, app splash, deck covers. |
| `favicon.svg` / `.png` / `.jpg` | Lotus on rounded Sandalwood tile | Replace `public/favicon.svg` (currently a placeholder heart) — pending sign-off. |
| `favicon-shipped.svg` | The current shipped favicon (placeholder green heart) | Reference only — not on-brand long-term. |

## The do-nots

- **Do not** stretch, squash, skew, or rotate the logo.
- **Do not** recolor the logo outside the official palette (Lotus Pink, Soft Saffron, Tulsi Mint, Deep Charcoal).
- **Do not** add drop shadows, glows, or outlines to the lotus mark itself. (A subtle hover glow on the marketing site is the only exception — see `foundations/motion.md`.)
- **Do not** place the colored logo on busy photographic backgrounds. Use `mark-inverse.svg` (monochrome) for photo overlays.
- **Do not** put the colored logo on pure white (`#FFFFFF`) full-bleed. Always sit it on Sandalwood `#FDFBF7` or a soft tint.

## Clear space

Maintain padding around the logo equal to the width of the letter **"O"** in *Our*. The exact rule: minimum clear space = 1× the height of the lowercase wordmark letters on the lockup, or 12% of the bounding box width on the standalone mark.

## Minimum sizes

| Surface | Minimum size |
|---|---|
| Favicon | 16 × 16 px (use `mark.svg` — strips detail at this size) |
| App icon (iOS / Android) | 1024 × 1024 source (use `mark-shipped.png`) |
| Header lockup | 32 px tall on web (mark only); 40 px (lockup) |
| Print logo | 0.5 in / 12 mm tall (mark only) |
| Deck title | 80 pt tall (stacked lockup) |

## Backgrounds

| Background | Logo to use |
|---|---|
| Sandalwood `#FDFBF7` | `mark-shipped.png` (full color) |
| White `#FFFFFF` | `mark-shipped.png` works, but prefer Sandalwood — see "do nots" above |
| Sage `#8AB6A3` (button bg) | `mark-inverse.svg` in white (`fill="#FFFFFF"`) — single color |
| Charcoal `#2C3E50` (dark mode bg) | `mark.svg` works (the colors stay legible); for monochrome moments, use `mark-inverse.svg` recolored to `#EAE6DB` |
| Photograph | Always `mark-inverse.svg` recolored white at 95% opacity |

## Open question (please review)

The SVG vector recreation of the lotus (`mark.svg`) is a **simplification** of the painted/gradient PNG. The shipped PNG has soft watercolor blending across the petals that doesn't translate cleanly to flat SVG. Two paths to resolve:

1. **Keep both:** PNG everywhere except where SVG is structurally required (small favicons, inline SVG). The SVG reads as "the same logo" but is visibly flatter. This is the current state.
2. **Commission a clean SVG redraw:** A designer rebuilds the lotus as a faithful vector with subtle gradient stops, matching the painted PNG. Recommended for long-term consistency; until then, option 1 is fine.

Until that decision is made, **always use `mark-shipped.png` for any rendered output where the logo is at 64px or larger.**
