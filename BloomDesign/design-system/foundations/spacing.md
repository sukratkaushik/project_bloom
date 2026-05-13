# Spacing

The system uses an **8px base grid** with a 4px half-step for tight UI moments.

## The scale

| Token | Value | Use |
|---|---|---|
| `space-0` | 0 | Reset |
| `space-1` | 4px | Tight icon-to-text gap, inline tag inner padding |
| `space-2` | 8px | Default small gap; pill button inner Y |
| `space-3` | 12px | Card inner gap; form field row gap |
| `space-4` | 16px | Default card padding (small); section row gap |
| `space-5` | 24px | Card padding (medium); paragraph spacing |
| `space-6` | 32px | Card padding (large); component-to-component gap |
| `space-7` | 40px | Section internal padding |
| `space-8` | 48px | Section vertical rhythm |
| `space-9` | 64px | Major section break |
| `space-10` | 80px | Hero section padding |
| `space-11` | 96px | Page-level top/bottom |

This matches the spacing scale extracted from the live site via extract-design-system.

## Layout rules

### 1. Page max-widths

| Surface | Max content width |
|---|---|
| Marketing hero | 1200px (centered, 24px gutter mobile) |
| Marketing body | 880px (centered) |
| Article / long-form | 720px |
| Dashboard main column | 880px (with 280px sidebar) |
| Modal | 560px |
| Toast / inline alert | 480px |

### 2. Vertical rhythm

Default paragraph-to-paragraph spacing in body copy is **1em** (one full line-height). Between H2-and-following-body, use **0.5em**. Between sections, use **`space-9` (64px)** on desktop, **`space-7` (40px)** on mobile.

### 3. Generosity > density

This is a pregnancy app. Calm beats efficient. Default to *more* whitespace than feels strictly necessary — the brand reads visually as "you can breathe here."

### 4. Card padding by size

| Card size | Padding |
|---|---|
| Tight (inline chip, pill) | 8px / 12px |
| Small (compact list item) | 12px / 16px |
| Medium (default card) | 20px / 24px |
| Large (hero card, knowledge drop) | 24px / 32px |
| Hero | 32px / 40px |

### 5. Mobile gutters

Always **24px** horizontal page gutter on mobile (under 640px). Never 16px or smaller for marketing surfaces — content should feel held, not cramped.

### 6. Sidebar / nav widths

- Web app left nav: **280px** wide.
- Web app right column (when present): **320px**.
- Mobile nav drawer: full width with **24px** content gutter.

### 7. Tap targets

Minimum **44 × 44px** for all interactive elements. The brand is mobile-first; users tap with tired thumbs.

## Component-level spacing

| Component | Spec |
|---|---|
| **Button (pill)** | `padding: 10px 24px` (default), `8px 16px` (sm), `14px 32px` (lg) |
| **Input** | `padding: 12px 16px`, `border-radius: 12px`, `min-height: 44px` |
| **Card (default)** | `padding: 24px`, `border-radius: 16px`, `gap: 16px` between children |
| **Card (premium)** | `padding: 24px`, `border-radius: 24px`, shadow `0 4px 20px -4px rgba(44,62,80,0.05)` |
| **Modal** | `padding: 32px`, `border-radius: 24px`, max-width 560px |
| **Nav item** | `padding: 12px 16px`, `border-radius: 12px`, `gap: 12px` icon-to-label |
| **Form row** | `gap: 12px` field-to-field within a row; `gap: 16px` row-to-row |
| **List item** | `padding: 16px 20px`, `gap: 12px` |
