# Design system changelog

## v1.3 — 2026-05-31 — Sticky header, mesh glow, multilingual, AI Medical Reports

A wave of UI polish + 4 new product surfaces landed on `main` (commits `5cb33a9`, `75422ba`, `587078a`, `d87cd3a`, `c99e24e`, `f9f6e9b`, `bfd5856`, `ec87a03`, and others).

### New visual patterns

- **Sticky glassmorphic header** documented in `applications/web.md` + new tokens in `tokens.css` + `tokens.json`. Floats `top:16px` resting → `top:8px` when scrolled (>20px). Backdrop-blur 12px, white/90 bg, rounded 20px, max-width 1200px. Border + shadow intensify on scroll.
- **Mesh Glow pattern** for premium cards — `.mesh-glow-container` + `.mesh-glow-blob-1` (Sage 22%) + `.mesh-glow-blob-2` (Lotus Pink 26%). Two blobs drift in offset rhythms (12s + 15s).
- **Premium theme transitions** — global 400ms `cubic-bezier(0.25, 0.8, 0.25, 1)` on `background-color`, `border-color`, `color`, `box-shadow` for all theme-affected elements. Makes Dark/Calm Mode toggles fade smoothly.
- **Animated hero womb tableau** — 3 nested organic blob rings (Sage 30%, Blush 40%, Gold 30%) rotating at 25s / 20s reverse / 15s with a Lotus-Pink glowing baby orb on the inner ring.
- **`.notranslate` class** on the brand name "Our Pregnancy" — Google Translate leaves it alone.
- **scroll-behavior: smooth** added to `<html>` for nav-link smooth scrolling.

### New product features (now in vocabulary)

- **Medical Reports** — secure upload + AI Medical Report Summarizer + Prescription Decipherer (Cloud Function backend).
- **Wearable Integrations** — Apple Health, Oura Ring, Google Fit, Garmin Connect, Fitbit.
- **Language Selector** — 11 Indian languages: English, Hindi, Punjabi, Gujarati, Marathi, Bengali, Tamil, Kannada, Telugu, Malayalam, Urdu.
- **Daily Knowledge Drop** (was already in product, now elevated in vocab).
- **Vaccination Reminders** (now referenced in 6th testimonial).

### SEO / metadata went BACK to leading with "Free" + "Private"

| Surface | Now reads |
|---|---|
| `<title>` | Our Pregnancy — Secure & Private Indian Pregnancy Companion |
| `<meta description>` | A privacy-first, free pregnancy companion tailored for Indian mothers. Track milestones, blood pressure, kick counts, contraction timing, and scan food safety offline. |
| OG title | Our Pregnancy — Your Secure & Private Pregnancy Companion |

This is a SEO decision — search-query matches still benefit from "free" + "privacy-first" + "secure" keywords. The **visible H1 stays conservative** ("Your pregnancy companion — secure & synced.") so the brand voice remains honest. Two-track copy: metadata for SEO, on-page copy for trust.

### Testimonial pool: 6 cards

Added: *Meera J., Pune* — "The vaccination reminders and daily tips kept me so reassured. A must-have for every expectant mom!"

Live site now shows all 6 in a symmetric 3-col × 2-row grid (was 3-up rotation).

### Govt scheme copy softened

- "Don't miss out on **important** benefits" (was "**free** benefits")
- "JSSK (hospital delivery)" (was "**free** hospital delivery")

These edits preserve the JSY/PMMVY/JSSK names but reduce the absolute "free benefits" framing.

### Files updated

- `BRAND-SUMMARY.md` — feature list expanded with Medical Reports, Wearables, Language Selector
- `README.md` — version bumped to v1.3, provenance date refreshed
- `applications/web.md` — full sticky header spec, hero womb tableau, mesh glow + premium-transitions docs, SEO metadata refresh, Multilingual section
- `voice/homepage-copy.md` — sticky header spec, Language Selector copy, refreshed hero (no Cloud Sync chip), 6-card testimonial pool, softened scheme copy
- `foundations/vocabulary.md` — Medical Reports, Wearables, Language Selector, Daily Knowledge Drop, Vaccination Reminders, exact wearable device names
- `tokens/tokens.css` — header tokens, mesh-glow tokens, `.glass-panel`, `.mesh-glow-*` utility classes, premium transition rule, `.notranslate`, smooth-scroll
- `tokens/tokens.json` — header.*, mesh-glow.*, easing.premium, duration.premium / mesh-glow-1 / mesh-glow-2, shadow.header-resting / header-scrolled

### Unchanged

- Color palette, type stack, base spacing — all confirmed unchanged in `src/index.css` diff.
- Logo (`logo.png`) — MD5 unchanged.
- The three modes (Light / Dark / Calm) — same overrides.
- Six non-negotiables in `CLAUDE.md` still apply.

---

## v1.2 — 2026-05-17 — Landing page refresh + AI features

The live site shipped a major landing page redesign (commit `32476d3` and follow-ups) plus a wave of AI backend work. The design system caught up.

### Visual / structural changes

- **New "Comprehensive Toolkit" bento grid** documented in `applications/web.md`. 12 feature cards across a 3-col grid, with 1 hero (AI Food Safety Scanner) + 1 tall (Real-Time Partner Sync) + 10 small cards. Tile-icon color rotation: Sage → Blush → Gold → Sage → Blush → Gold.
- **New "Made for Indian mothers 🇮🇳" full-bleed Sage section** documented as the only marketing surface where the brand inverts (Sage `#8AB6A3` bg, white text). Cards on top use rotated tile icons.
- **Footer is full-bleed Charcoal `#2C3E50`** with light text — documented as the dark anchor that closes the page.
- **Bento card radius:** new 32px radius for feature bento cards added to the spacing/radius scale (`radius-bento` = `32px`).

### Copy / positioning changes

The brand walked back several absolutes in commits `8d70c3d` and `fdb6ada`. All design-system docs updated to reflect:

| Retired (May 2026) | Current |
|---|---|
| "Your free pregnancy companion — secure & synced." | "Your pregnancy companion — secure & synced." |
| "All your data, entirely free." | "Core features free. AI tools coming soon." |
| "Privacy-first" | "Private & secure" |
| "Your data stays on your device" | "Your data is private & secure" |
| "Stored locally / Local-first" | "Encrypted and only accessible by you" |
| "No account needed" | (omitted — modal sign-in flow now required) |
| "No hidden costs. Completely Free." | "Core features, always free." |
| "Never touches a centralized database" | (omitted — Firebase Firestore is in use) |
| "Free and offline" | "Core features free", "Works offline via PWA" |

### Trust bar refresh

The 4-chip trust strip below the hero, verbatim:

```
🗺  Made for Indian mothers 🇮🇳
🛡  Your data is private & secure
₹  Core features are free
📡  Works offline via PWA
```

### New product features documented

- **AI Food Safety Scanner** (Gemini + Qwen2.5-VL-72B backend, tailored for Indian cuisine)
- **Real-Time Partner Sync** (WebRTC + encrypted cloud, Sync Mode + Cloud Storage pills)
- **Labor Readiness Score** (HRV / RHR / Braxton Hicks biometrics)
- **FHIR R4 EHR Export** (Epic / Cerner)
- **Ask Bloom 24/7** (rebranded from "AskOur Pregnancy AI" — the only sanctioned external use of "Bloom")
- **Cloud Sync** (Firebase-backed; previously "local-first" framing retired)

### Testimonials expanded

The testimonial pool grew from 3 to 5. Added:
- *Sneha P., Goa* — "The AI food scanner saved me so much anxiety during my babymoon in Goa."
- *Divya K., Chennai* — "Finally an app that understands Indian contexts and government schemes."

### Files updated
- `BRAND-SUMMARY.md`
- `CLAUDE.md` — added retired-claims rule + AI talk rule
- `CLAUDE-DESIGN-HANDOFF.md`
- `foundations/brand.md`
- `foundations/voice.md` — added Rule 11 (how to talk about AI) and Rule 12 (don't reintroduce retired claims)
- `foundations/vocabulary.md` — new product feature names, retired claims table, "phrases we love" refresh
- `voice/examples.md` — full refresh + new "AI features" section
- `voice/homepage-copy.md` — verbatim live homepage copy, bento grid spec, testimonial pool, modal copy, India section
- `applications/web.md` — full bento grid layout, inverted Sage section, Smart Tools dashboard nav names, SEO metadata verbatim
- `applications/ads.md` — refreshed RSA headlines + descriptions, new Pattern 5 (AI claim), retired Pattern 1/2 absolutes
- `applications/email.md` — privacy line softened
- `build-logo-assets.mjs` — tagline updated in OG image + stacked lockup composers
- All composed PNGs in `logo/` and `assets/templates/` re-rendered with new tagline

### Real assets added

- `assets/templates/web/shipped-mockups/dashboard-mockup.png` — the dashboard mockup the team uses in marketing
- `assets/templates/web/shipped-mockups/food-scanner-mockup-v1.png` — first iteration of the food scanner promo
- `assets/templates/web/shipped-mockups/food-scanner-mockup-v2.png` — current shipped iteration (Indian thali with AI overlay, "SAFE TO EAT" verdict)

These are **canonical product imagery**. Use them in decks / social / landing pages instead of generating synthetic substitutes.

### Unchanged
- Logo (`logo.png`) — MD5 unchanged.
- `src/index.css` design tokens — unchanged. All color / type / spacing / radius / shadow tokens still accurate.
- The three modes (Light / Dark / Calm).

---

## v1.1 — 2026-05-13 — Logo fix

Removed all wrong hand-drawn SVG reconstructions of the lotus logo. Promoted the painted `logo.png` to canonical source of truth. Added build script (`build-logo-assets.mjs`) that composes every lockup by embedding the real PNG. Added a "Logo — read this first" non-negotiable to `CLAUDE.md`. See commit `751c43a`.

## v1.0 — 2026-05-12 — Initial design system

Generated from the live site (Firecrawl + extract-design-system), the shipped Tailwind theme in `src/index.css`, and the internal brand kit in `branding/Master-Brand-Kit.md`. Commit `5a6f58e`.
