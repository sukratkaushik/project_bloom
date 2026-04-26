# Project Bloom — Master Brand Kit

> **App Concept:** A modern, lightweight, and culturally resonant pregnancy companion app for women in India.
>
> **Brand Vibe:** Reassuring, modern, maternal, and culturally rooted — without being traditional or heavy.

---

## Table of Contents

1. [Brand Foundation & Story](#1-brand-foundation--story)
2. [Visual Identity & Rules](#2-visual-identity--rules)
3. [Digital & Product Design (UI)](#3-digital--product-design-ui)
4. [Voice, Content & Grammar](#4-voice-content--grammar)
5. [Everyday Business & Social](#5-everyday-business--social)
6. [Sonic & Legal](#6-sonic--legal)
7. [Logo Reference Sheet](#7-logo-reference-sheet)
8. [Quick-Reference Cheat Sheet](#8-quick-reference-cheat-sheet)
9. [Content Requirements & AI Generation Prompts](#9-content-requirements--ai-generation-prompts)

---

## 1. Brand Foundation & Story

| | |
|---|---|
| **Mission** | To empower expectant mothers in India with modern medical insights wrapped in the comfort of cultural wisdom. |
| **Vision** | A healthy, joyful, and anxiety-free pregnancy journey for every Indian mother. |
| **Brand Archetype** | **The Caregiver** meets **The Sage** — empathetic, nurturing, knowledgeable, and deeply trusted. |
| **Tagline** | *"Your modern companion for a mindful pregnancy."* |

### Elevator Pitch (50 words)

> Project Bloom is a digital pregnancy companion designed specifically for the modern Indian woman. By blending evidence-based health tracking with comforting cultural wisdom — from dietary tips to *Garbh Sanskar* (mindful pregnancy) concepts — Bloom provides a light, reassuring, and intuitive space for mothers to navigate their journey with confidence.

---

## 2. Visual Identity & Rules

### 2.1 The Logo System

The primary logo is a soft, minimalist lotus flower whose lower petals subtly form the curve of a pregnant belly. The mark balances **Lotus Pink** (upper petals) with **Soft Saffron** (lower petals) and a small **Tulsi Mint** leaf accent.

**Logo Variations**

| # | Variation | Usage |
|---|---|---|
| 1 | **Full Logo** (Icon + "Project Bloom" text) | Primary usage — marketing, website header, splash screens |
| 2 | **App Icon** (lotus/belly mark only) | Mobile app icon, favicon, social avatar, tight spaces |
| 3 | **Monochrome** (solid Deep Charcoal) | Print, fax, single-color backgrounds, embossing |

**Logo Rules — The "Do Nots"**

- **Clear space:** Maintain padding around the logo equal to the width of the letter **"o"** in *Bloom*.
- **Do not** stretch, squash, skew, or rotate the logo.
- **Do not** place the colored logo on busy photographic backgrounds.
- **Do not** recolor the logo outside the official palette.
- **Do not** add drop shadows, glows, or outlines to the mark.

---

### 2.2 Color Palette (Light & Indian Cultural)

We deliberately avoid heavy, saturated traditional colors (bright red, dark green) in favor of a modern, airy pastel take on Indian elements.

| Role | Name | HEX | RGB | Meaning |
|---|---|---|---|---|
| **Primary 1** | Lotus Pink | `#F9C7D2` | `249, 199, 210` | Maternal love, softness, care |
| **Primary 2** | Soft Saffron | `#F4A261` | `244, 162, 97` | Morning energy, auspiciousness, warmth |
| **Secondary** | Tulsi Mint | `#E9F5E9` | `233, 245, 233` | Health, growth, natural soothing |
| **Background** | Sandalwood Neutral | `#FDFBF7` | `253, 251, 247` | Warm off-white — easier on the eyes than pure `#FFFFFF` |
| **Text / Ink** | Deep Charcoal | `#2C3E50` | `44, 62, 80` | Softer and more elegant than pure `#000000` |

**Swatch preview**

```
■ Lotus Pink         #F9C7D2
■ Soft Saffron       #F4A261
■ Tulsi Mint         #E9F5E9
■ Sandalwood Neutral #FDFBF7
■ Deep Charcoal      #2C3E50
```

**Critical rules**

- **Never** use pure black `#000000` for text — it causes eye strain. Always use Deep Charcoal.
- **Never** use pure white `#FFFFFF` as the primary background — use Sandalwood Neutral.
- Deep Charcoal on Sandalwood Neutral passes **WCAG AAA** contrast requirements.

---

### 2.3 Typography

| Role | Font | Style | Why |
|---|---|---|---|
| **Headings** | Playfair Display | Serif | Editorial elegance, trustworthiness, slight heritage feel |
| **Body & UI** | Nunito *or* Inter | Sans-Serif | Highly legible, rounded, soft, friendly — ideal for health apps where readability is paramount |

**Type-setting rules**

- Headings in Playfair Display, **sentence case** (never ALL CAPS or Title Case for long headers).
- Body copy in Nunito/Inter at a comfortable size — minimum 14px, preferred 16px for reading content.
- Line-height generous (1.5–1.6) for calming, breathable layouts.

---

### 2.4 Photography & Illustration Style

**Photography Vibe**

Joyful, light-filled, natural. Women in comfortable modern ethnic wear — soft cotton kurtas, light sarees. **No clinical, sterile, or hospital imagery.** Warm morning lighting, soft focus, conveying comfort, health, and peace.

**Illustration Style**

- Flat, vector-based, featuring soft curves.
- No sharp corners or harsh geometry.
- Rounded, friendly characters and objects.

**Brand Patterns**

- Minimalist, transparent line-art inspired by **Mehndi (Henna)** or **Rangoli** geometry.
- Used **only** as very subtle watermarks in the background of cards — never as a dominant element.

---

## 3. Digital & Product Design (UI)

### 3.1 Design Tokens (CSS Variables)

```css
:root {
  /* Colors */
  --color-lotus-pink: #F9C7D2;
  --color-soft-saffron: #F4A261;
  --color-tulsi-mint: #E9F5E9;
  --color-sandalwood: #FDFBF7;
  --color-deep-charcoal: #2C3E50;

  /* Shape */
  --radius-soft: 16px;          /* Everything rounded and safe — no sharp corners */

  /* Elevation */
  --shadow-float: 0px 8px 24px rgba(244, 162, 97, 0.1); /* Soft, warm — never harsh black */

  /* Typography */
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Nunito', 'Inter', sans-serif;
}
```

### 3.2 Component Specs

- **Buttons:** pill-shaped (fully rounded).
- **Cards & modals:** `--radius-soft` (16px) on all corners.
- **Shadows:** only `--shadow-float` — never harsh `rgba(0,0,0,...)` drop shadows.

**Action color mapping**

| Action Type | Color | Examples |
|---|---|---|
| **Primary** (utility) | Soft Saffron `#F4A261` | Next, Save, Continue, Log |
| **Emotional** | Lotus Pink `#F9C7D2` | Journal, Memories, Favourites, Love entries |
| **Growth / success** | Tulsi Mint `#E9F5E9` | Healthy-state chips, progress complete |

### 3.3 Accessibility (A11y)

- **Sandalwood Neutral must always be the background** for deep reading (articles, tips) to prevent screen glare for sensitive, tired eyes.
- Deep Charcoal (`#2C3E50`) on Sandalwood Neutral (`#FDFBF7`) meets **WCAG AAA** contrast.
- Tap targets: minimum 44×44 px.
- Respect system font-size and reduced-motion preferences.

---

## 4. Voice, Content & Grammar

### 4.1 The Tone Spectrum

| We lean toward… | …over |
|---|---|
| **Empathetic** — guiding like a wise older sister | Authoritative / clinical |
| **Modern** — backing tradition with nutritional science | Purely traditional / folkloric |
| **Calm** — soothing, paced, grounded | Urgent / alarming |

### 4.2 Error Message Style

| ❌ Avoid | ✅ Use |
|---|---|
| "ERROR: Invalid date entered." | "Oops! Let's check that date again so we can track your journey perfectly." |
| "Submission failed." | "Hmm, that didn't go through. Let's try once more." |
| "Required field." | "We'll need this to continue — please fill it in." |

### 4.3 Grammar & Mechanics

- **Sentence case** for all headers (e.g., "Your daily health tips" — *not* "Your Daily Health Tips").
- Contractions are welcome (we're, let's, you'll) — they feel conversational and warm.
- **Emoji use is sparing** — focus on soft, on-brand ones only:
  - 🌸 (bloom, welcome)
  - ✨ (celebration, small wins)
  - 🤍 (care, empathy)
  - 🌿 (wellness, natural)

  Do **not** use loud or clinical emojis (🚨, ⚠️, ❗, 💊).

---

## 5. Everyday Business & Social

### 5.1 Social Media Templates

| Format | Background | Font / Content |
|---|---|---|
| **A — Educational** | Tulsi Mint `#E9F5E9` | Playfair Display quote about the baby's weekly growth |
| **B — Cultural** | Lotus Pink `#F9C7D2` | Tips on navigating Indian festivals while pregnant (e.g., "Fasting tips for Karwa Chauth") |

### 5.2 OG Image (Link Preview)

- **Dimensions:** 1200 × 630 px
- **Background:** Sandalwood Neutral `#FDFBF7`
- **Centerpiece:** Soft Lotus logo
- **Below logo:** Tagline in Deep Charcoal `#2C3E50`

### 5.3 Presentations (Pitch Decks)

- Clean, spacious slides with generous whitespace.
- Subtle line-art mandala pattern as a footer graphic.
- Headings in Playfair Display, body in Nunito/Inter.

---

## 6. Sonic & Legal

### 6.1 Sonic Branding (App Sounds)

| Event | Sound |
|---|---|
| **Success state** (e.g., logging water) | A soft, resonant chime — like a small brass Indian bell, modernized and muted |
| **Notifications** | A gentle acoustic string pluck — reminiscent of a soft sitar or guitar note |

### 6.2 Legal & Disclaimers

Always include the standard medical disclaimer in the app footer and inside all medical articles:

> *"Project Bloom provides general guidance and cultural wisdom. Always consult your gynecologist or healthcare provider for medical advice."*

---

## 7. Logo Reference Sheet

Below is the official brand logo sheet showing the primary logo and all approved variations.

*(Refer to the attached `logo-options.png` or `bloom-brand-reference.png` for visual representations of the variations: Full Logo, App Icon, and Monochrome.)*

---

## 8. Quick-Reference Cheat Sheet

**Colors at a glance**

```
Lotus Pink          #F9C7D2   Primary 1  — maternal, emotional actions
Soft Saffron        #F4A261   Primary 2  — warmth, primary CTAs
Tulsi Mint          #E9F5E9   Secondary  — health, success states
Sandalwood Neutral  #FDFBF7   Background — always, never pure white
Deep Charcoal       #2C3E50   Text       — always, never pure black
```

**Core design tokens**

```
Radius        16px
Shadow        0px 8px 24px rgba(244, 162, 97, 0.1)
Heading font  Playfair Display
Body font     Nunito / Inter
Button shape  Pill (fully rounded)
```

**Voice in one line**

> Empathetic older sister > strict doctor. Modern > traditional. Calm > urgent.

**Approved emoji set**

> 🌸 ✨ 🤍 🌿

---

## 9. Content Requirements & AI Generation Prompts

This section lists every piece of marketing and social content I need for Project Bloom, along with paired prompts for **Gemini Nano Banana** (image/visual generation) and **Claude Design** (layout, copy, and structured design specs).

### 9.1 Reusable Brand Context Block

Prepend this block to every prompt so the AI stays on-brand:

> **Brand:** Project Bloom — a modern, culturally rooted pregnancy companion app for Indian women. **Palette:** Lotus Pink `#F9C7D2`, Soft Saffron `#F4A261`, Tulsi Mint `#E9F5E9`, Sandalwood Neutral background `#FDFBF7`, Deep Charcoal text `#2C3E50`. **Fonts:** Playfair Display (headings, sentence case), Nunito/Inter (body). **Vibe:** empathetic, calm, modern, maternal, airy. **Never:** pure black, pure white, clinical imagery, loud emojis, harsh shadows, sharp corners. **Always:** soft rounded corners (16px), warm lighting, generous whitespace, subtle Mehndi/Rangoli line-art watermarks.

*(... Continues through Section 9.2 Content Matrix up to 9.4 Prompt Usage Notes as per original spec)*
