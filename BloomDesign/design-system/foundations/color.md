# Color

The Our Pregnancy palette is **modern airy pastel takes on Indian elements** — the calm version of saffron, mehndi, lotus, and sandalwood.

## The palette

### Primary — Sage

The workhorse accent. CTAs, links, focus rings, success states, progress bars, active nav.

| Token | Hex | When |
|---|---|---|
| `--color-sage` | `#8AB6A3` | Default — buttons, links, active states, focus |
| `--color-sage-light` | `#B5D5C7` | Hover state, secondary fills, scrollbar thumb |
| `--color-sage-pale` | `#E9F5E9` *(Tulsi Mint)* | Success bg, calm card bg, info pills |

**Where it shows up live:** "Start Tracking — It's Free" button, sidebar nav active row, Calm Mode chip, scrollbar.

### Emotional — Lotus Pink

Reserved for emotional, personal, partner-facing surfaces. Never for utility actions.

| Token | Hex | When |
|---|---|---|
| `--color-blush` | `#F9C7D2` *(official Lotus Pink)* | Journal entries, "first" milestones, partner-sharing UI |
| `--color-blush-light` | `#FCE1E8` | Hover, soft fills |
| `--color-blush-pale` | `#FEF5F7` | Background tint for emotional cards |

**Where it shows up live:** First Trimester pill, "The Hidden Beginning" card, baby-name memories.

### Warmth — Soft Saffron

Energy, auspiciousness, celebration. Milestones, nutrition tips, festival content.

| Token | Hex | When |
|---|---|---|
| `--color-gold` | `#F4A261` *(official Soft Saffron)* | Milestones, "OPTIONAL" pills, festival callouts, food tips |
| `--color-gold-pale` | `#FCF1E8` | Soft saffron card backgrounds |

**Where it shows up live:** "OPTIONAL" badge, week-9 nutrition tip card, milestone celebrations.

### Background — Sandalwood Neutral

The single canvas color for marketing surfaces.

| Token | Hex | When |
|---|---|---|
| `--color-cream` | `#FDFBF7` | Page background, EVERYWHERE |
| `--color-white` | `#FFFFFF` | Card surfaces only, never page-level |

**Critical:** Never use pure `#FFFFFF` as page background. Sandalwood is gentler on tired pregnancy eyes and is what ships.

### Text — Deep Charcoal

| Token | Hex | When |
|---|---|---|
| `--color-charcoal` | `#2C3E50` | Body text, headings, dark UI elements |
| `--color-medium` | `#6B7A87` | Secondary text, captions, supporting copy |
| `--color-light` | `#9BA7B0` | Disabled, placeholder, very tertiary |
| `--color-border` | `#E8E6E1` | Borders, dividers, card outlines |

**Critical:** Never use pure `#000000`. Deep Charcoal on Sandalwood passes **WCAG AAA** for body text.

### Feedback colors

| Token | Hex | When |
|---|---|---|
| `--color-critical` | `#D97777` | Destructive only — delete confirmations, low-kick alert |
| `--color-critical-bg` | `#FDF5F5` | Critical state card background |
| `--color-optional` | `#F4A261` *(=gold)* | Optional/recommended pills |
| `--color-optional-bg` | `#FCF1E8` | Optional state card background |

Note: We deliberately use **softened red `#D97777`** instead of stark `#FF0000` — Critical states should feel "hey, this needs your attention," not "ALARM."

---

## Color rules

### 1. One workhorse, three accents

The system has *one* primary action color (Sage) and *three* meaning-tagged accents (Lotus Pink for emotional, Soft Saffron for warmth, Critical for destructive). Never compete two accents on the same surface.

### 2. Action color mapping

| Action type | Color | Examples |
|---|---|---|
| **Primary** (utility) | Sage `#8AB6A3` | Start tracking, Save, Continue, Log a kick |
| **Emotional** | Lotus Pink `#F9C7D2` | Journal entry, Memory saved, Partner invited |
| **Warmth / milestone** | Soft Saffron `#F4A261` | Trimester milestone, Festival tip, Recipe |
| **Success** | Sage pale `#E9F5E9` | Completed task, Hydration goal hit |
| **Critical** (destructive) | Critical `#D97777` | Delete, Low-kick alert, Preeclampsia threshold |

### 3. Backgrounds — always Sandalwood at page level

Marketing surfaces, app pages, social posts, decks, emails — all sit on Sandalwood `#FDFBF7`. Cards on top can be pure white, or one of the pale variants. Never invert (don't put Sandalwood card on white page).

### 4. Mehndi / Rangoli line patterns

When you need texture, use the Mehndi pattern (`assets/patterns/mehndi-watermark.svg`) at **8% opacity** as a watermark. Never above 12%.

### 5. Gradients

Sparingly. Allowed: Sage → Sage-light vertical gradients on hero CTAs. Never rainbow gradients, never multi-color blends.

### 6. Dark Mode mapping

The system flips for dark mode — see `tokens/tokens.css` for the full overrides. Key shifts:
- Page: Sandalwood → `#1B2936` (dusk charcoal)
- Sage: `#8AB6A3` → `#96C1AE` (lighter for visibility on dark)
- Text: Charcoal → `#EAE6DB` (warm bone)

### 7. Calm Mode mapping

A spa-like ultra-soft variant for anxiety / 3am sessions:
- Sage stays the same hex but feels softer due to surrounding palette shifts
- Blush → `#F4D0D9` (very soft)
- Gold → `#F2BA8F` (very soft)
- Text → `#5C6C7A` (softer charcoal)
- Background → `#FBFBF9` (nearly-white but warm)

---

## Contrast and a11y

| Pair | Ratio | WCAG |
|---|---|---|
| Deep Charcoal `#2C3E50` on Sandalwood `#FDFBF7` | 11.2 : 1 | AAA |
| Deep Charcoal on White | 12.6 : 1 | AAA |
| Sage `#8AB6A3` on White (button text reversed) | 2.7 : 1 | **Fails for body text** — use as background with white text only |
| White on Sage `#8AB6A3` | 2.7 : 1 | AA Large only — body buttons OK at 16px+ bold |
| Medium `#6B7A87` on Sandalwood | 5.1 : 1 | AA |

**Rule of thumb:**
- Body text always Charcoal on Sandalwood / White.
- Sage is a *background* for white text on buttons (min 16px bold), never a *text* color on white.
- Never put pure Lotus Pink on Sandalwood as text — it fails contrast badly.

See `foundations/accessibility.md` for the full a11y rules (in `applications/web.md`).
