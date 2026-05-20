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

### Landing page (live structure as of May 2026)

The landing page is now a 9-section scroll story. In order, top to bottom:

1. **Top nav bar** — Logo, "Log In", "Sign Up", dark-mode toggle (right).
2. **Hero** — Cloud Sync chip + Playfair H1 ("Your pregnancy companion — *secure & synced*") + subhead with bold "Core features free. AI tools coming soon." + Sage primary CTA "Start Tracking" + secondary outline "Sign Up with Email" + tertiary "See how it works ↓" link. Right half: ambient Sage-pale blur with lotus mark animated.
3. **Trust bar** — White strip with 4 Sage-icon chips: *Made for Indian mothers 🇮🇳 · Your data is private & secure · Core features are free · Works offline via PWA*.
4. **Flowchart "How Our Pregnancy Works"** — Sage-pale tinted bg, 4 numbered step nodes connected by a Sage gradient line. Each node: circular white card with icon, "Step N" overline, title, body.
5. **Features Bento Grid "Comprehensive Toolkit"** — 12 cards: 1 hero (AI Food Safety Scanner, 2-col, with thali image on right), 1 tall (Real-Time Partner Sync, with Sync Mode + Cloud Storage pills), 10 small. Each small card: colored circle icon (Sage / Blush / Gold / Charcoal tile), Playfair title, Nunito body. See "Bento Grid Layout" below for the exact tile colour rotation.
6. **"Made for Indian mothers 🇮🇳" India section** — Full-bleed **Sage `#8AB6A3` background with white text**. The only marketing surface where the brand inverts. 3 white cards on top with rotated tile icons (🥗 / 🏥 / 📞): Indian Foods Database, Govt Scheme Guide, Emergency Ready.
7. **"Core features, always free." CTA section** — Sandalwood, centered Playfair H2 + body + Sage CTA "Start Tracking Now".
8. **Testimonials** — White bg, "Trusted by Indian mothers" h2, 3-up cards from a 5-quote pool (rotates Priya / Kavitha / Anjali / Sneha / Divya).
9. **Footer** — Full-bleed **Deep Charcoal `#2C3E50` with light text**. Logo + wordmark left, link row right (Privacy · Terms · email), bottom row with 🔒 "Your data is encrypted and only accessible by you."

### Bento Grid Layout (Features section, desktop)

The grid is **3 columns by 4 rows on desktop, 1 column on mobile**. Visual hierarchy is intentional:

| Row | Layout |
|---|---|
| 1 | **AI Food Safety Scanner (cols 1-2, hero card)** · Partner Sync (col 3, tall card spans rows 1-2) |
| 2 | Labor Readiness Score (col 1) · FHIR R4 EHR Export (col 2) · *(Partner Sync continues)* |
| 3 | Ask Bloom 24/7 · Vitals Tracker · Kick Counter |
| 4 | Multiple Checklists · Contraction Timer · Pregnancy Timeline |
| 5 | Calm/Dark Mode · *(empty)* · *(empty)* |

All cards: `border-[32px]` radius (more rounded than the rest of the system — bento-specific), white bg, soft border, subtle hover shadow. Tile icon colors rotate Sage → Blush → Gold → Sage → Blush → Gold to keep the grid visually rhythmic.

### Inverted Sage section — the only place we go dark

The "Made for Indian mothers 🇮🇳" section uses **Sage `#8AB6A3` as a full-bleed background with white type**. This is a deliberate brand moment — the only marketing surface where the visual hierarchy inverts. Use it sparingly elsewhere; reserve full-Sage backgrounds for India / cultural-context content.

### Dashboard
- Top bar with logo + LMP / T1 / T2 / Due date + 0% done bar + mode toggles (Critical only, Calm Mode, Dark Mode)
- Left sidebar (`nav.tsx`) — Overview / Daily Health & Tracking / Smart Tools / Planning & Tasks / Medical & Govt / Labor & Postpartum sections
- Smart Tools section includes: AskOur Pregnancy AI (Ask Bloom full page), AI Food Guide (Food Safety Scanner), Name Generator
- Main content — alternating `Card`, `feature-card`, and form components
- Right floating: Feedback button (sage pill, bottom-right)
- Floating chatbot pill (lower-right on the landing) opens **Ask Bloom** in an inline panel powered by the Hugging Face Router API + Cloud Functions backend.

### Article / knowledge page
- Hero — 12px overline + Playfair h1 + 18px Nunito lead
- Body — 16px Nunito, 1.65 line-height, 720px max width
- Pull quote — Playfair italic, sage-light left border
- Disclaimer card at footer — `tone="sage"` with the standard disclaimer text

## SEO / metadata (verbatim from live `index.html`)

| Field | Value |
|---|---|
| `<title>` | Our Pregnancy — Your Free Pregnancy Companion |
| `<meta description>` | A beautifully designed pregnancy companion — track milestones, health vitals, tasks, and decisions, securely synced across your devices. |
| Keywords | pregnancy tracker, pregnancy app, baby tracker, kick counter, contraction timer, pregnancy companion, pregnancy journal, safe food for pregnancy, Indian pregnancy app, our pregnancy, ourpregnancy.in, maternity tracker, baby growth tracker, trimester guide |
| `<meta theme-color>` | `#F2F4EB` (currently shipping; recommended change to `#FDFBF7` to match the page background) |
| Favicon | Replace with `design-system/logo/favicon.png` once approved |
| OG image | 1200×630 — Sandalwood bg, lotus + italic Playfair "Our Pregnancy" + tagline + Sage URL pill |
| Twitter card | summary_large_image, same OG image |

> Note: The `<title>` tag still leads with "Your Free Pregnancy Companion" even though the H1 dropped "Free" in May 2026. This is intentional — search-query matches still benefit from the keyword. The visible H1 is more conservative ("Your pregnancy companion — secure & synced.").

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
