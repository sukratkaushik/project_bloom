# Typography

## The type system

Two families. One serif for emotional / editorial heft, one sans for utility / reading. A third (Lexend) takes over in Calm Mode for dyslexia-friendly accessibility.

| Role | Family | Weights | Why |
|---|---|---|---|
| **Headings** | Playfair Display | 400, 500, 600, 700 + italic 400/500 | Editorial elegance, trustworthiness, slight heritage warmth |
| **Body & UI** | Nunito (primary) → Inter (fallback) | 400, 500, 600, 700 | Rounded, soft, friendly, highly legible for health content |
| **Calm Mode** | Lexend | 300, 400, 500 | Designed for reading proficiency; ultra-clear letterforms |

All three load from Google Fonts in `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Nunito:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Lexend:wght@300;400;500&display=swap" rel="stylesheet">
```

## Type scale

We use a modest, comfortable scale — never showy. Sizes given in pixels (16px base).

| Token | Size | Line-height | Use |
|---|---|---|---|
| `text-overline` | 12px / 0.75rem | 1.4 | Eyebrows like `DAILY KNOWLEDGE DROP` (≤3 words, uppercase OK here) |
| `text-caption` | 13px | 1.45 | Small print, helper text, captions |
| `text-body` | 15px (web app) / 16px (marketing) | 1.6 | Default body |
| `text-large` | 18px | 1.55 | Lead paragraphs, lifted UI text |
| `text-h6` | 18px (Playfair, 500) | 1.4 | Small section headings |
| `text-h5` | 20px (Playfair, 500) | 1.35 | Card titles |
| `text-h4` | 24px (Playfair, 500) | 1.3 | Subsection headings, feature titles |
| `text-h3` | 32px (Playfair, 500) | 1.25 | Page-level headings on web app |
| `text-h2` | 40px (Playfair, 500) | 1.2 | Section headings, marketing |
| `text-h1` | 56px (Playfair, 500) | 1.1 | Hero / page title, marketing |
| `text-display` | 72px (Playfair, 500, italic available) | 1.05 | Landing-page hero only |

**Mobile scaling:** Reduce h1/display by ~30% on viewports under 640px.

## Setting rules

### 1. Sentence case — always

Headings are sentence case. Title Case is **never** correct. ALL CAPS is only allowed in ≤3-word overlines acting as labels.

✅ *Your daily health tips*
✅ *DAILY KNOWLEDGE DROP* (overline label, 3 words, OK)
❌ *Your Daily Health Tips* (Title Case)
❌ *YOUR DAILY HEALTH TIPS* (more than 3 words, uppercase)

### 2. Line-height is generous

Body: **1.6**. Headings: **1.1–1.4** depending on size. Calm Mode: **1.85** for body.

The brand reads "calm," and tight line-height contradicts that.

### 3. Letter-spacing

- **Headings:** default (no tracking).
- **Overlines (uppercase 12px):** `letter-spacing: 0.08em` for readability.
- **Body:** default. Calm Mode adds `letter-spacing: 0.03em` for slow readers.

### 4. Italics are emotional

Italic Playfair is reserved for **dates, taglines, quotes, and emotional captions** — not for emphasis inside body. For emphasis, bold the body sans.

✅ *14 Mar 2026 — 6 Jun 2026* (date caption, italic)
✅ *"Your modern companion for a mindful pregnancy."* (tagline, italic)
❌ *Click here* in body italic — bold instead.

### 5. Numerals

Use **tabular-nums** for any aligned numeric UI (kick counts, weight log, BP table, currency). Use proportional figures for paragraph copy that contains a number.

```css
.numeric-table { font-variant-numeric: tabular-nums; }
```

### 6. Indian rupee and dates

- **Currency:** `₹5,000` (rupee symbol, comma separators). Never `Rs.` or `INR 5000`.
- **Dates:** `14 Mar 2026` (DD MMM YYYY), never `03/14/2026`. Day-first matches the shipped app and India convention.
- **Time:** 12-hour with am/pm, lowercase — `8:00 am`, `3:30 pm`. Reserve 24-hour for technical contexts.

## Pairing examples

### Hero block
```
Playfair Display 56–72px, 500, sentence case
Nunito 18px, 400, 1.55 line-height
Sage CTA button — Nunito 16px, 600
```

### Card
```
Overline:  Nunito 12px, 700, uppercase, 0.08em tracking
Title:     Playfair 20px, 500
Body:      Nunito 15px, 400, 1.6
Action:    Nunito 14px, 600
```

### Article
```
H1:   Playfair 40px, 500
H2:   Playfair 24px, 500
Lead: Nunito 18px, 400, 1.55
Body: Nunito 16px, 400, 1.65
Caption: Nunito italic 13px, 400 (or Playfair italic for pull quotes)
```

## Calm Mode swap

When `body.calm-mode` is active:
- All Playfair → Lexend 500 (still feels like a "soft" heading)
- All Nunito → Lexend 400
- Line-height bumps to 1.85
- Letter-spacing adds 0.03em
- Page motion slows 2.5×

Lexend's clinical look would normally feel off-brand, but in Calm Mode the goal is **maximum readability for an anxious or tired user** — the brand temporarily steps aside.

## Font fallbacks

Always declare the system fallback chain:

```css
--font-serif: 'Playfair Display', 'Iowan Old Style', Georgia, serif;
--font-sans: 'Nunito', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-calm: 'Lexend', 'Atkinson Hyperlegible', system-ui, sans-serif;
```
