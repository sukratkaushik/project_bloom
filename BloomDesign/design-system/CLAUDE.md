# CLAUDE.md — Our Pregnancy Design System

> If you are an LLM (Claude Design, Claude Code, or any other model) generating an asset for **Our Pregnancy**, read this file first. The non-negotiables override anything else you might infer from context.

---

## Load order

1. **This file** — non-negotiables.
2. `BRAND-SUMMARY.md` — one-page brand snapshot.
3. `foundations/voice.md` + `foundations/vocabulary.md` — for copy.
4. `foundations/color.md` + `foundations/typography.md` + `tokens/tokens.css` — for visuals.
5. `applications/<surface>.md` — for the specific channel you're working on.
6. `assets/templates/<surface>/` — copy the real shipped templates whenever they exist; only generate fresh designs from scratch when no template is present.

---

## Identity in one line

> A pregnancy companion app for Indian mothers — empathetic older sister, not strict doctor. Core features free; AI tools coming soon.

**Product name:** Our Pregnancy (always — never "Project Bloom" externally).
**Domain:** ourpregnancy.in
**Tagline:** *Your pregnancy companion — secure & synced.*
**Pricing line:** *Core features, always free. AI tools coming soon.*
**AI chatbot product name:** *Ask Bloom* (the only sanctioned external use of "Bloom").

---

## Non-negotiables — never violate

### Logo — read this first
1. **The Our Pregnancy logo is ONLY `logo/logo.png`.** There is no SVG version, no flat-vector version, no hand-drawn alternative. Period.
2. **Never recreate, redraw, trace, or approximate the lotus.** It's a soft painted PNG with gradient blends. Any vector recreation will be wrong.
3. **When you need the logo in any asset, embed the actual `logo.png` file** — via `<image href>` in SVG, `<img src>` in HTML, file-place in design tools, or by importing it as an asset. Never paint petal shapes yourself.
4. **Pre-made lockups are in `logo/`:** `mark.png`, `lockup-horizontal.png`, `lockup-stacked.png`, `favicon.png`. Use these directly. They were composed by embedding `logo.png` — no recreation involved.
5. **If the user asks for a new logo asset** (e.g., a Twitter banner, a new social size), compose it by embedding `logo.png`. Do not synthesize a new lotus drawing. If the size or framing isn't yet in `logo/`, extend `build-logo-assets.mjs` to add it.
6. Full logo rules — clear space, sizes, banned backgrounds — are in [`logo/usage.md`](logo/usage.md).

### Color
1. **One workhorse accent:** Sage `#8AB6A3`. Use it for primary CTAs, links, active states, progress.
2. **One emotional accent:** Lotus Pink `#F9C7D2`. Use it for journals, memories, partner-sharing, "first-time" moments.
3. **One warmth accent:** Soft Saffron `#F4A261`. Use it for milestones, celebrations, nutrition.
4. **Background is Sandalwood `#FDFBF7`.** Never pure white `#FFFFFF` in marketing surfaces.
5. **Text is Deep Charcoal `#2C3E50`.** Never pure black `#000000`.
6. Never use red except for clearly destructive/critical states (`#d97777` only).

### Type
1. **Headings:** Playfair Display, regular or medium weight, **sentence case always**. No Title Case. No ALL CAPS except in a ≤3-word overline (e.g., "DAILY KNOWLEDGE DROP").
2. **Body & UI:** Nunito (primary) or Inter (fallback). Minimum 15px, preferred 16px.
3. **Calm Mode swap:** Lexend everywhere (dyslexia-friendly). Same hierarchy.
4. Never use a third display face. Never use script. Never use serif body.

### Voice
1. Second person: "you / your", not "users / mothers / they."
2. Use the user's nouns: *baby, kicks, contractions, due date, nausea, ladoo, dal, midwife, hospital bag, JSY, PMMVY, biryani, ragi, paneer*. Not ours: *platform, pipeline, LLM, ingestion*.
3. **No hype vocabulary.** Banned everywhere: *revolutionary, game-changing, 10x, cutting-edge, supercharge, unleash, leverage, transform, synergy, seamless, robust, AI-powered (as a bare adjective).*
4. Contractions are welcome (we're, you'll, let's). They feel warm.
5. **No clinical alarm language.** Never "ERROR" or "FAILED" — use "Hmm, let's try that again."

### Retired claims (May 2026) — never use
These phrases were live on the homepage and have since been walked back. If you find them in older marketing, replace with the current equivalent. Never reintroduce.

| ❌ Never say | ✅ Say instead |
|---|---|
| Free forever / Pay nothing / All entirely free | Core features, always free |
| No hidden costs. Completely Free. | Core features, always free |
| Privacy-first | Private & secure |
| Your data stays on your device | Your data is private & secure |
| Stored locally / Local-first | Encrypted and only accessible by you |
| No account needed | (omit — modal flow does require sign-in for sync) |
| Never touches a centralized database | (omit — we use Firebase Firestore) |

### AI talk
1. The product has real AI: **Ask Bloom 24/7** (chatbot, fine-tuned), **AI Food Safety Scanner** (Gemini-powered, Qwen2.5-VL backend), **AI Name Generator**, **Labor Readiness Score** (HRV/RHR/Braxton Hicks biometrics). These are Premium tier — "AI tools coming soon" on marketing.
2. Talk about AI as a careful safety feature, not a magic trick. *"Gemini-powered AI Food Safety Scanner, tailored for Indian cuisine"* > *"AI-powered insights"*.
3. Don't name underlying model providers unless they're already on the site (Gemini is OK; Qwen/Hugging Face stays internal).

### Imagery
1. **Real Indian women** in soft cotton kurtas, light sarees, or modern everyday wear. Warm morning light. Comfortable, real spaces — home, garden, kitchen, balcony.
2. **No stock "diverse team around laptop."** No clinical hospital imagery. No medical instruments.
3. **No AI-generated humans.** No glowing orbs, neural meshes, wireframe globes, or "tech-y AI" tropes.
4. Illustrations: flat, vector, soft curves, no sharp corners.

### Shape & motion
1. **Radius:** 16px (default), 24px (cards/modals), pill (buttons). Never 0px, never 4px.
2. **Shadow:** `0 4px 20px -4px rgba(44, 62, 80, 0.05)` for cards. `0 8px 24px rgba(244, 162, 97, 0.1)` for warm float. Never harsh black drop shadows.
3. **Motion:** fade + small translate. 160 / 240 / 480 ms. Calm Mode multiplies by 2.5×. No parallax, no looping hero video, no scroll-jacking, no confetti.

### Cultural
1. **Indian context first.** When in doubt, use Indian nouns and examples (₹ pricing, JSY/PMMVY/JSSK schemes, dal/ragi/paneer foods, 108/112 helplines, Karwa Chauth/Diwali timing).
2. **Don't translate to Hindi.** Speak English with naturally embedded Indian vocabulary. The audience is English-fluent Indian women.
3. Approved emoji set: 🌸 ✨ 🤍 🌿 🇮🇳 🤰🏻. Never 🚨 ⚠️ ❗ 💊 (clinical/alarm).

### Always include
1. Medical disclaimer in any health/medical article footer:
   > *Our Pregnancy provides general guidance and cultural wisdom. Always consult your gynecologist or healthcare provider for medical advice.*
2. Privacy statement somewhere visible:
   > *Your data is private & secure. Core features are free. Works offline via PWA.*

---

## Three modes — the system ships all three

| Mode | When | Behavior |
|---|---|---|
| **Light** (default) | Day, public surfaces, marketing | Sandalwood `#FDFBF7` background, Sage CTAs |
| **Dark** | Evening, late tracking sessions | Charcoal `#1B2936` bg, lighter Sage `#96C1AE` accents |
| **Calm** | Anxiety / 3am wake-ups / accessibility | Lexend everywhere, ultra-soft palette, 2.5× slower motion, 1.85 line-height |

Every component must work in all three. See `tokens/tokens.css` for the full mode-specific overrides.

The product also has **premium theme transitions** — toggling Dark/Calm fades all theme-affected CSS over 400ms with a `cubic-bezier(0.25, 0.8, 0.25, 1)` curve. Components don't need to opt in; it's a global rule on `html, body, header, main, footer, .premium-card, .glass-panel, button, input, textarea, select`.

---

## Multilingual (11 Indian languages)

The site auto-translates to: **English · Hindi · Punjabi · Gujarati · Marathi · Bengali · Tamil · Kannada · Telugu · Malayalam · Urdu** via Google Translate.

Rules:
- Author all design-system copy in **English**. Translations happen at runtime.
- The brand name "**Our Pregnancy**" carries `.notranslate` and is never translated.
- Other strings to mark `.notranslate` when used inline: AI feature names (Ask Bloom, AI Food Safety Scanner), scheme abbreviations (JSY, PMMVY, JSSK), helpline numbers (108, 112, 1098).

---

## Premium visual patterns (new May 2026)

Two new utility patterns ship in `tokens/tokens.css`:

- **`.glass-panel`** — translucent white bg with backdrop-blur. Used by the sticky header and premium dashboard cards.
- **`.mesh-glow-container`** + `.mesh-glow-blob-1` + `.mesh-glow-blob-2` — premium ambient glow with two drifting radial gradients (Sage + Lotus Pink). Use sparingly — reserved for hero / premium tracker cards.

---

## When in doubt

Ask: "Would a thoughtful, calm, modern Indian older sister say it this way / make it look this way?" If no, redo it.
