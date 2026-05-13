# Claude Design — hand-off text

When you upload this `design-system/` folder to Claude Design's "Set up your design system" flow, you'll see two text fields. **Paste the blocks below verbatim** — they've been tuned to bias Claude Design's output toward the brand's actual voice and visual rules.

---

## 1. Company name and blurb (≤80 words)

```
Our Pregnancy is a privacy-first pregnancy companion app for Indian mothers, live at ourpregnancy.in. We help women in India track kicks, contractions, BP, mood, and nutrition; navigate JSY, PMMVY, and JSSK government schemes; and prepare the hospital bag — all free, all on-device. We'll ship: a marketing website, mobile-PWA in-app UI, pitch decks, Instagram and LinkedIn posts, email newsletters and transactional emails, infographics for week-by-week guides, and paid social ads.
```

---

## 2. Any other notes? (~250 words)

```
Voice: empathetic older sister, not strict doctor. Second person ("you"), sentence case headings (never Title Case), short sentences, Indian context (dal, ragi, ladoo, JSY, 108, Karwa Chauth). Banned words: revolutionary, game-changing, 10x, transform, leverage, supercharge, seamless, robust, "AI-powered" as a bare adjective. Banned tone: clinical alarm, hype, engagement bait. Approved emoji set only: 🌸 ✨ 🤍 🌿 🇮🇳 🤰🏻. Always include the medical disclaimer in any health content.

Color: ONE workhorse accent — Sage #8AB6A3 — for all primary CTAs, links, focus, success. Lotus Pink #F9C7D2 is reserved for emotional/partner moments. Soft Saffron #F4A261 for warmth/milestones. Background is ALWAYS Sandalwood #FDFBF7 — never pure white. Text is ALWAYS Deep Charcoal #2C3E50 — never pure black. Critical/alert color is softened red #D97777, never #FF0000.

Type: Playfair Display for headings (sentence case, can be italic for emphasis), Nunito for body (Inter as fallback). Lexend takes over in Calm Mode. Generous line-height (1.6 body, 1.85 Calm Mode). Numbers use tabular-nums where aligned.

Shape: 16px radius default, 24px for cards, pill for buttons, never 0px. Shadows soft and warm — never harsh black. Motion fade + small translate at 160/240/480ms; Calm Mode multiplies 2.5×. No parallax, no scroll-jacking, no looping hero video, no confetti, no glassmorphism, no 3D, no AI-tech tropes (orbs, neural meshes, wireframe globes).

Imagery: real Indian women in soft cotton kurtas, warm morning light, real homes. Never AI-generated humans, never clinical hospital imagery, never "diverse team around laptop" stock.

Three modes ship: Light (default), Dark, Calm. Every output must work in all three.
```

---

## Optional — if Claude Design asks for example assets

Upload from this folder, in this order:

1. `design-system/logo/mark-shipped.png` — canonical full-color logo
2. `design-system/logo/lockup-horizontal.png` — primary marketing lockup
3. `design-system/assets/templates/web/homepage-shipped.png` — real live homepage reference
4. `design-system/assets/templates/web/og-image-1200x630.png` — OG image style
5. `design-system/assets/templates/social-instagram/template-A-knowledge-tip.png` — IG portrait style
6. `design-system/assets/templates/social-linkedin/template-stat-card.png` — LinkedIn landscape style
7. `design-system/tokens/tokens.json` — machine-readable design tokens

For ongoing reference, also share:
- `design-system/CLAUDE.md` — load-order + non-negotiables doc
- `design-system/BRAND-SUMMARY.md` — one-page snapshot
