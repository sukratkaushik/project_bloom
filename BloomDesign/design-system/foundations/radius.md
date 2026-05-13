# Radius

Rounded corners are a load-bearing brand decision. **Nothing in this brand is sharp.** The system has *one* default radius and a few special cases.

## The scale

| Token | Value | Use |
|---|---|---|
| `radius-xs` | 6px | Tags, inline chips, tiny pills |
| `radius-sm` | 8px | Form inputs (mini), nav items |
| `radius-md` | 12px | Inputs, list items, nav rows |
| `radius-soft` | **16px** | **Default — cards, buttons (non-pill), modals** |
| `radius-card` | 24px | Premium cards, modals, large surfaces |
| `radius-hero` | 32px | Hero card, dashboard knowledge drop |
| `radius-pill` | 9999px | All CTAs and primary buttons |
| `radius-circle` | 50% | Avatars, dots, status indicators |

## Rules

### 1. Buttons are pills

All primary and secondary actions use `radius-pill`. The shipped CTA button — "Start Tracking — It's Free" — is fully rounded. Never use a square button for a primary action.

Exception: **icon-only buttons** (e.g., navigation chevrons) use `radius-circle` and stay perfectly round.

### 2. Cards are 16px or 24px

Default cards: 16px. Premium / hero cards: 24px. The "Knowledge Drop" card on the dashboard is 24px. The dashboard sidebar nav rows are 12px (between input and card).

### 3. Never 0px, never 2px

The shipped site's tailwind config never uses 0 or 2 for radius. The brand's "soft" feeling depends on it.

### 4. Mehndi pattern motifs

When using the Mehndi line-art pattern as a watermark or decorative element, keep the line-art geometric (it has its own structure) — *don't* round its lines further. Just keep it at low opacity.

### 5. Photography crops

Photo crops use `radius-card` (24px) for marketing surfaces, `radius-soft` (16px) for in-app. Never sharp corners on photos.

### 6. Images inside cards

Images that *fill* a card inherit the card's radius (16 or 24). Images that *sit inside* a card with padding can be 12px (slightly less than the card) for visual hierarchy.
