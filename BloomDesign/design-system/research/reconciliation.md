# Reconciliation — brand kit vs. shipped product

This document is the receipt for every decision in this design system. When the internal brand kit (`branding/Master-Brand-Kit.md` on `main`) said one thing and the shipped product on ourpregnancy.in said another, this file records which one we picked and why.

**The rule: shipped product wins.** A design system that contradicts the live site is a design system nobody trusts.

---

## Sources used

| Source | Format | What it gave us |
|---|---|---|
| **Live site** — https://ourpregnancy.in/ | Firecrawl scrape (markdown + branding extraction, full-page screenshot) | The canonical copy, layout, color usage, and component patterns in production. Latest snapshot in `firecrawl-latest.json`. |
| **CSS-computed tokens** — `npx extract-design-system <url>` | dembrandt JSON | Independent CSS-computed token extraction. Cross-checks Firecrawl's LLM-inferred values. Latest in `extracted-tokens.json`. |
| **Shipped codebase** — `origin/main` | Git read | `src/index.css` for the actual `@theme` tokens; `src/landing/LandingPage.tsx` for verbatim copy; `index.html` for SEO metadata; `public/` for shipped mockup imagery. |
| **Internal brand kit** — `branding/Master-Brand-Kit.md` on `main` | Markdown | The aspirational brand kit written before the product matured. Useful for archetype + voice principles; out-of-date on tagline / pricing / palette emphasis. |
| **Real product screenshots** | PNG | Dashboard, planning, nutrition, food scanner — provided by Sukrat during v1.0 + v1.2 + v1.3. |

---

## v1.0 reconciliation — May 2026 (commit `5a6f58e`)

### Where brand kit and shipped product agreed ✅

- **Logo:** Pink upper petals + saffron lower petals + mint leaves at base. Brand kit description matches the painted PNG byte-for-byte.
- **Color palette:** All 5 named colors (Lotus Pink, Soft Saffron, Tulsi Mint, Sandalwood, Deep Charcoal) match what ships.
- **Typography:** Playfair Display for headings + Nunito/Inter for body — matches `<link>` in `index.html` and `@theme` in `src/index.css`.
- **Radius:** 16px default + pill buttons.
- **Voice direction:** "Empathetic older sister > strict doctor" — supported by the shipped error messages, knowledge tips, and footer copy.
- **No pure black / no pure white rule** — shipped CSS enforces it via `--color-charcoal: #2C3E50` and `--color-cream: #FDFBF7`.

### Where they disagreed — shipped product won ⚠️

| What the brand kit said | What ships | What we did |
|---|---|---|
| Brand name = "Project Bloom" | Brand name = "Our Pregnancy" | Documented "Our Pregnancy" everywhere. "Project Bloom" is internal codename only. |
| Tagline = "Your modern companion for a mindful pregnancy." | H1 = "Your free pregnancy companion — secure & synced." | Used the shipped tagline. |
| UI accent = Soft Saffron `#F4A261` (primary CTA) | UI accent = Sage `#8AB6A3` (primary CTA, links, focus) | Made Sage the **workhorse**. Saffron stayed as warmth/milestone accent. |
| One mode shown | Three modes ship: Light, Dark, Calm | Documented all three with full token overrides for each. |
| No mention of Calm Mode font | Calm Mode swaps Playfair + Nunito → Lexend (dyslexia-friendly) | Documented the swap. |
| Logo described as authored vector | Logo only exists as a 1024×1024 painted PNG | Made `logo.png` the canonical source; no SVG until a designer produces one. |

---

## v1.1 reconciliation — May 2026 (commit `751c43a`)

This was a **logo fix**, not a brand reconciliation. Earlier, the system contained hand-drawn SVG approximations of the lotus logo. These violated the skill's Rule 2 ("render what's actually there, never invent details") because the painted PNG has gradient blends that flat SVG can't reproduce.

**Resolution:**
- Deleted all SVG reconstructions (mark.svg, mark-inverse.svg, wordmark.svg, lockup-*.svg, favicon.svg).
- Promoted `mark-shipped.png` → `logo.png` (canonical name).
- Added a build script (`build-logo-assets.mjs`) that composes every lockup PNG by **embedding the real `logo.png` via a data URI** inside an SVG canvas, then rendering with Playwright. No recreation involved.
- Added a "Logo — read this first" non-negotiable to CLAUDE.md so any LLM consuming the system knows the rule.

---

## v1.2 reconciliation — May 2026 (commit `7ec5485`)

The product walked back several absolute claims in commits `8d70c3d` and `fdb6ada`, and shipped a major bento-grid landing page redesign in `32476d3`.

### Retired claims — replaced everywhere

| ❌ Retired | ✅ Replacement |
|---|---|
| "Free forever / Pay nothing / All entirely free" | "Core features, always free" |
| "Privacy-first" | "Private & secure" |
| "Your data stays on your device" | "Your data is private & secure" |
| "Stored locally / Local-first" | "Encrypted and only accessible by you" |
| "No account needed" | (omitted — modal flow requires sign-in for sync) |
| "Never touches a centralized database" | (omitted — Firebase Firestore is in use) |
| "No hidden costs. Completely Free." | "Core features, always free." |
| "Your free pregnancy companion — secure & synced." | "Your pregnancy companion — secure & synced." (H1) |

**Why:** Cloud Sync, Firebase Auth, and the AI Premium tier all involve servers. The new positioning is honest.

### New product features documented

- **AI Food Safety Scanner** (Gemini + Qwen2.5-VL backed, tailored to Indian cuisine)
- **Ask Bloom 24/7** (rebrand of "AskOur Pregnancy AI" — the only sanctioned external use of "Bloom")
- **Real-Time Partner Sync** (WebRTC + encrypted cloud framing)
- **Labor Readiness Score** (HRV / RHR / Braxton Hicks biometrics)
- **FHIR R4 EHR Export** (Epic / Cerner)

### New visual patterns

- **Bento grid** (3-col, 12 cards, AI Food Scanner hero + Partner Sync tall) — `radius: 32px` added to the system.
- **Inverted Sage section** — the only marketing surface where the brand goes dark (full-bleed Sage `#8AB6A3` + white text).
- **Full-bleed Charcoal footer** — the page-closing dark anchor.

---

## v1.3 reconciliation — May 2026 (commit `a4f6b09`)

A wave of UI polish + 4 new product surfaces landed (commits `5cb33a9`, `75422ba`, `587078a`, `d87cd3a`, `c99e24e`, `f9f6e9b`, `bfd5856`, `ec87a03`).

### Visual additions

- **Sticky glassmorphic header** — floats `top:16px` resting → `top:8px` scrolled. White/90 + 12px backdrop-blur + 20px radius. Border + shadow intensify on scroll.
- **Hero womb tableau** — 3 nested organic blob rings rotating at 25s / 20s reverse / 15s with a Lotus Pink glowing baby orb.
- **Mesh Glow** pattern (`.mesh-glow-container` + Sage 22% + Lotus Pink 26% drifting blobs in 12s + 15s rhythms) — premium tracker cards only.
- **Premium theme transitions** — global 400ms `cubic-bezier(0.25, 0.8, 0.25, 1)` for smooth Dark/Calm fades.
- **`.notranslate` class** on brand name so Google Translate leaves "Our Pregnancy" alone.

### New product surfaces

- **Medical Reports** (upload + AI Medical Report Summarizer + Prescription Decipherer)
- **Wearable Sync** (Apple Health, Oura Ring, Google Fit, Garmin Connect, Fitbit)
- **Language Selector** (11 Indian languages via Google Translate widget)
- **Vaccination Reminders** (referenced in new 6th testimonial)

### SEO metadata went BACK to leading with "Free" + "Private"

This is the most counterintuitive shift, so it's worth explaining clearly.

| Surface | What it reads |
|---|---|
| `<title>` | "Our Pregnancy — Secure & Private Indian Pregnancy Companion" |
| `<meta description>` | "A privacy-first, free pregnancy companion tailored for Indian mothers..." |
| Visible H1 | "Your pregnancy companion — secure & synced." (no "free", no "privacy-first") |

**Why both:** SEO is keyword-matching. The terms "free", "privacy-first", and "secure" still appear in users' search queries — dropping them from `<title>` and `<meta>` would hurt rankings on a YMYL ("Your Money Your Life") category page. But the visible on-page voice stays conservative — we don't want to over-promise to a user who clicked the result.

**Two-track copy:**
- Metadata (search query matches) → keyword-heavy, claim-friendly.
- On-page (trust building) → softened, honest.

Both are correct for their surface. Don't sync them to identical strings.

### Testimonial pool expanded to 6

Added **Meera J., Pune** — "The vaccination reminders and daily tips kept me so reassured. A must-have for every expectant mom!"

Live homepage now shows all 6 in a symmetric 3-col × 2-row grid (was a 3-up rotation).

### Govt scheme copy softened

- "Don't miss out on **important** benefits" (was "**free** benefits")
- "JSSK (hospital delivery)" (was "**free** hospital delivery")

Same scheme names; reduced absolute "free" framing.

---

## v1.5 reconciliation — June 2026 (screenshot-driven)

Unlike v1.0–v1.3 (which relied on Firecrawl + code diffs), this refresh was driven by a **57-screenshot capture** of the live app in `shipped-screens/`. When the docs and the screenshots disagreed, the screenshots won.

### The four biggest shifts

1. **Audience broadened from "Indian mothers" to "expectant mothers".** Every marketing surface dropped "Indian" from the *audience* framing while keeping Indian *feature depth*. See `foundations/vocabulary.md` → June 2026 retired-claims table for the full swap list.

2. **3-tier pricing shipped.** Free (₹0) · Standard (₹199) · Premium (₹499). "AI tools coming soon" is retired; AI tools are Premium features shipping today. See `voice/homepage-copy.md` → PACKAGES section for verbatim card copy.

3. **AI chatbot rebranded** "Ask Bloom 24/7" → **"Bloom AI"**. Applied across in-app H2, landing feature card, and Premium tier feature list.

4. **12 languages, not 11.** German (Deutsch) added to the Language Selector. Signals the broader audience shift.

### Other rebrands captured

| v1.4 doc | v1.5 (in-app) | Reason |
|---|---|---|
| Vitals Tracker | **Health Metrics** | Screenshot shows sidebar label rebrand |
| AI Food Safety Scanner | **Our Pregnancy AI Food Guide** | In-app H2; marketing card kept old name |
| Ask Bloom 24/7 | **Bloom AI** | In-app H2 + Premium tier card |
| Labor Readiness Score | **Labor Readiness** | In-app; marketing kept "Score" |
| Pregnancy Timeline | **Pregnancy Tracker** | In-app H2; marketing kept "Timeline" |
| Multiple Checklists | **Hospital Bag** | In-app sidebar |

Docs now clearly distinguish **marketing name** vs **in-app name**.

### Framing that got much tighter

- **Labor Readiness** now ships with an explicit "**Conceptual Demonstration**" info card + the disclaimer *"There is currently no ACOG/WHO guideline validating the use of consumer wearables to predict labor onset. Do not use this for medical decisions."* This is now the canonical example of how to talk about biometric/AI features honestly.

### New surfaces documented from screenshots

- Safe Travel Guide (Smart Tools sidebar)
- Sidebar search input ("Search features…")
- Streak gamification pill ("N Day Streak" 🔥)
- Adjust Setup button
- AI Premium Active pill
- Financial Planning + Key Decisions sections
- Early Parenthood / Fourth Trimester
- 6 government schemes (was 3) — PMSMA, JSY, PMMVY, JSSK, PMJAY/Ayushman Bharat, ICDS

### Sources for v1.5

- **`shipped-screens/`** — 57 canonical PNGs captured June 2026. Primary source.
- **`firecrawl-latest.json`** — for meta tags + branding extraction that Firecrawl surfaces cleanly.
- Live scroll-through of ourpregnancy.in for animation / interaction confirmation.

---

## Open questions / never resolved

These didn't get definitive answers from the live site. Flagged for future review.

1. **Authored vector logo** — the painted PNG is canonical. We need a designer to produce a clean SVG/AI source for print, large-format, and embossing use cases. Until then: use `logo.png`, never recreate.
2. **`theme-color` mismatch** — `index.html` ships `<meta theme-color content="#F2F4EB">` but the page background is `#FDFBF7`. The two are visually close but not identical. Should be `#FDFBF7` to match the canvas. Flagged in v1.0; still not fixed as of v1.3.
3. **Title tag still leads with "Free"** — `<title>Our Pregnancy — Secure & Private Indian Pregnancy Companion` — but H1 doesn't. SEO benefit is real; on-page honesty is preserved. Worth revisiting if conversion-rate data ever justifies a change.

---

## How this gets maintained

When the live site shifts (new feature, new copy, new section), the workflow is:

1. **Re-scrape** with `npx -y firecrawl-cli@latest scrape https://ourpregnancy.in/ --format markdown,branding --full-page-screenshot --wait-for 5000`.
2. **Re-extract tokens** with `npx -y extract-design-system@latest https://ourpregnancy.in/ --extract-only`.
3. **Pull `origin/main`** and diff `src/index.css`, `index.html`, `src/landing/LandingPage.tsx`.
4. **Identify stale copy / structure** by grepping the design-system folder for retired phrases.
5. **Update the affected docs** + bump version in `README.md` + add a new section to `CHANGELOG.md` + append a new section to this file (`reconciliation.md`).
6. **Re-render templates** if any composed asset references stale copy (OG image, social templates, deck cover).
7. **Commit + push to `design-assets`**.

See `CHANGELOG.md` for the version-by-version log. See `firecrawl-latest.json` + `extracted-tokens.json` in this folder for the most recent extraction snapshots.
