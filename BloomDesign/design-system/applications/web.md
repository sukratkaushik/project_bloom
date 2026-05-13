# Web — marketing site and app surfaces

Covers `ourpregnancy.in` marketing pages and the in-app dashboard.

## Layout

| Surface | Max width | Gutter (mobile) | Gutter (desktop) |
|---|---|---|---|
| Marketing hero | 1200px | 24px | 48px |
| Marketing body | 880px | 24px | 32px |
| Article / docs | 720px | 24px | 24px |
| Dashboard main | 880px | 24px | 32px |
| Sidebar nav | 280px fixed | — | — |

Use a 12-column grid only where genuinely needed (asymmetric marketing layouts). For content-led pages, stack a single column and use spacing for hierarchy.

## Backgrounds

- Page: Sandalwood `#FDFBF7` always — never pure white.
- Cards on top: white `#FFFFFF` or `--color-sage-pale` for grouped sections.
- Full-bleed sections (CTA, testimonials): sometimes `--color-sage-pale` (warm seafoam) or `--color-blush-pale`.
- Avoid: striped backgrounds, multi-color hero gradients, video backgrounds.

## Components used per surface

### Landing page
- Hero (`components/hero.tsx`)
- Feature grid → 3 columns desktop, 1 mobile, using `feature-card.tsx`
- "How it works" steps — number + Playfair h3 + 1-line body
- Testimonial 3-up using `testimonial.tsx`
- CTA section using `cta-section.tsx`
- Footer — Charcoal text on Sandalwood, single row of legal links

### Dashboard
- Top bar with logo + LMP/T1/T2/Due date + 0% done bar + mode toggles
- Left sidebar (`nav.tsx`) — Overview / Daily Health / Smart Tools / Planning / Medical / Labor sections
- Main content — alternating `Card`, `feature-card`, and form components
- Right floating: Feedback button (sage pill, bottom-right)

### Article / knowledge page
- Hero — 12px overline + Playfair h1 + 18px Nunito lead
- Body — 16px Nunito, 1.65 line-height, 720px max width
- Pull quote — Playfair italic, sage-light left border
- Disclaimer card at footer — `tone="sage"` with the standard disclaimer text

## SEO / metadata

| Field | Value |
|---|---|
| `<title>` | Our Pregnancy — Your Free Pregnancy Companion |
| `<meta description>` | A privacy-first, beautifully designed pregnancy companion. Track vitals, symptoms, hydration, count kicks, time contractions, and prepare for birth with confidence. All your data, entirely free. |
| Keywords | pregnancy tracker, pregnancy app, baby tracker, kick counter, contraction timer, Indian pregnancy app, our pregnancy, ourpregnancy.in, maternity tracker, baby growth tracker, trimester guide |
| `<meta theme-color>` | `#FDFBF7` (Sandalwood — currently shipping `#F2F4EB`, change pending) |
| Favicon | Replace with `design-system/logo/favicon.svg` once approved |
| OG image | 1200×630 — Sandalwood bg, stacked lockup, Playfair tagline |
| Twitter card | summary_large_image, same OG image |

## Accessibility (must-pass)

1. **Color contrast** — Body text Charcoal on Sandalwood: 11.2:1 (AAA). Never put light gray text on white.
2. **Tap targets** — Minimum 44×44px. Pill buttons at default size meet this.
3. **Focus rings** — Sage ring with white offset. Visible on every interactive element.
4. **Keyboard nav** — Skip-to-content link, logical tab order, no keyboard traps.
5. **Reduced motion** — Honour `prefers-reduced-motion: reduce`.
6. **Screen reader labels** — All icons paired with text or `aria-label`. Decorative SVGs `aria-hidden`.
7. **Forms** — `<label>` always present (even if visually hidden), `aria-describedby` for helper / error text.
8. **Alt text** — All photographs get a descriptive alt; decorative line-art is `alt=""`.
9. **Calm Mode** — A user-selectable mode. Persist preference in localStorage.

## Dark Mode and Calm Mode

Both modes are first-class. Test every new component in all three modes before shipping. The shipped product already provides `body.dark` and `body.calm-mode` selectors — wire those into your custom CSS using the variables in `tokens/tokens.css`.

## Page-level animation

- Page enter: `fadeIn` 700ms on the main content wrapper.
- Card grids: stagger children by 80ms.
- Hero blob backgrounds (landing only): use the `blob` keyframe at 8s infinite.

## Forms

- Field label: 13px Nunito 600 above the input.
- Input: white bg, 12px border-radius, sage focus ring (no harsh blue).
- Helper text: 13px Nunito 400, medium-charcoal color.
- Error: Critical color `#D97777`, never red `#FF0000`.
- Submit button: pill, sage, full-width on mobile, max-width 240px on desktop.

## Performance budgets

- Largest Contentful Paint: < 2.5s on a Moto G4 / 3G.
- Total page weight: < 250KB initial route.
- Self-host system fonts if Google Fonts becomes a perf issue — fall back to `system-ui` cleanly.
