# Presentations / pitch decks

Format: **Marp** (Markdown-driven slides) or **Google Slides** for collaborative editing. Decks always export to **PDF** (16:9, 1920×1080) for sharing.

## Slide composition

- **Aspect:** 16:9. Never 4:3 (feels dated for an Indian Gen Z/millennial audience).
- **Background:** Sandalwood `#FDFBF7` (page) with optional Mehndi watermark at 6% opacity in one corner.
- **Margins:** 72px all sides. Never use the whole canvas — generous whitespace.
- **One idea per slide.** If you need two, make it two slides.
- **No bullet point overload.** Maximum 5 bullets per slide; prefer 3.

## Slide library — when to use what

| Slide type | When | Key elements |
|---|---|---|
| **Title** | Slide 1 only | Stacked lockup centered, tagline below, optional rangoli corner ornament |
| **Section divider** | Between major sections | Playfair h1 centered, Sage-pale background, small lotus mark top-left |
| **Single statement** | Mission / vision / "the problem" | Playfair h1 max 80% width, no subtitle, optional small footer mark |
| **Three-column feature** | Feature comparison / product overview | Three cards (16px radius), icon + title + 1-line body |
| **Stat-led** | Market size, traction, claims | One huge Playfair number (110pt), label below in Nunito |
| **Quote / testimonial** | Customer voice | Italic Playfair quote, small avatar + name + location |
| **Roadmap / timeline** | Plan or future | Horizontal track with rounded nodes (16px), spaced 250px |
| **Closing / CTA** | Final slide | Tagline, "Try at ourpregnancy.in", hello@ourpregnancy.in |

## Typography in decks

| Element | Font | Size | Weight |
|---|---|---|---|
| Slide title (h1) | Playfair Display | 60–72pt | 500 (regular) |
| Section divider | Playfair Display | 80pt | 500 italic |
| Subtitle | Nunito | 28pt | 400 |
| Body | Nunito | 22pt | 400 |
| Caption / footer | Nunito | 14pt | 400 |
| Big stat number | Playfair Display | 110pt | 500 |

## Color usage in decks

- **Page background:** Sandalwood always. Never white slides.
- **Section dividers:** Sage-pale `#E9F5E9` background for visual rhythm.
- **Accent for key words / pull quotes:** Sage `#8AB6A3` text, sparingly.
- **Highlight callout boxes:** Sage-pale or Blush-pale background, 16px radius.
- **Critical / data warning slides:** Soft Saffron `#F4A261` accent — never red.

## Charts and data

- **Single accent color** per chart, in the brand palette. Don't rainbow.
- **Line charts:** 2px stroke, Sage main + Charcoal axes.
- **Bar charts:** Sage or Soft Saffron, never gradient fills.
- **Pie / donut:** Avoid. If unavoidable, use Sage / Blush / Gold / Charcoal in that exact order.
- **Labels:** Nunito 16pt, Charcoal, sentence case.
- **Axis text:** Nunito 14pt, Medium.

## Imagery in decks

- Use real photography in 16:9 crops, 24px radius.
- Photo + text layouts: photo takes 60% of width, text 40% with 48px gutter.
- Never use stock images of "people in scrubs" or "diverse team around laptop."
- If no photo fits, use a single Sage-line illustration (no shaded illustrations).

## Speaker notes

Always populate speaker notes — not just for the presenter, but because PDFs of decks often live forever and someone re-reading the deck 6 months later benefits from context.

## Footer / chrome

- **Page number:** bottom-right corner, 14pt Nunito Light, color Light `#9BA7B0`.
- **Logo:** bottom-left corner, small mark only (no wordmark), 24px tall.
- **Company name + URL:** never in slide chrome — only on the final slide.

## Marp theme

A Marp theme CSS is included in `assets/templates/presentations/our-pregnancy.marp.css`. To use:

```markdown
---
marp: true
theme: our-pregnancy
size: 16:9
paginate: true
---

# Slide title here
```

Run `marp deck.md -o deck.pdf` to export.
