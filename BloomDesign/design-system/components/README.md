# Components

Drop-in React + Tailwind starters that match the live `ourpregnancy.in` UI. These are not a full UI library — they're the **canonical reference implementations** of the most-shipped patterns.

## Stack

- React 19 + TypeScript
- Tailwind v4 with the preset at `tokens/tailwind.preset.js`
- `lucide-react` for icons
- `motion` (framer-motion) for transitions

## Usage

1. Wire the Tailwind preset into your project's `tailwind.config.js`.
2. Copy any component file into your `src/components/`.
3. Adjust `cn()` import in `utils.ts` if your project has a different className helper.

## Components in this folder

| File | Pattern |
|---|---|
| `button.tsx` | Pill button — primary (Sage), secondary (outline Sage), ghost, critical, sizes sm/md/lg |
| `input.tsx` | Text input with optional label, helper, error state |
| `card.tsx` | Default soft card (16px radius, soft shadow, hover lift) |
| `feature-card.tsx` | Icon-led feature card matching the homepage "Vitals Tracker / Kick Counter" pattern |
| `badge.tsx` | Pills for CRITICAL / OPTIONAL / PARTNER / NICE TO HAVE labels |
| `nav.tsx` | Sidebar nav row matching the dashboard left-nav |
| `hero.tsx` | Marketing hero block with Playfair title + sage CTA + secondary action |
| `testimonial.tsx` | Quote card matching the "Trusted by Indian mothers" pattern |
| `cta-section.tsx` | Full-width Sage-pale CTA block |
| `stat.tsx` | Number + label stat |
| `animated.tsx` | Wrapper that applies the brand's entry animations (fade-in, slide-in, zoom-in) |
| `utils.ts` | `cn()` className helper |
