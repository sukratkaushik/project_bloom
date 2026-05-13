# Motion

The brand is **calm**. Motion is minimal, intentional, and respects `prefers-reduced-motion`. Calm Mode multiplies all durations by 2.5×.

## The duration scale

| Token | Default | Calm Mode | Use |
|---|---|---|---|
| `duration-fast` | 160ms | 400ms | Hover state, color swap, focus ring |
| `duration-base` | 240ms | 600ms | Default — fade-in, slide-in, button press |
| `duration-slow` | 480ms | 1200ms | Page transitions, modal open, card lift |
| `duration-ambient` | 800ms | 2000ms | Hero blob drift, ambient background motion |
| `duration-entry` | 700ms (web app default) | 1750ms | Animate-in entrance for a freshly mounted card |

## The easing scale

| Token | Bezier | Use |
|---|---|---|
| `ease-soft` | `cubic-bezier(0.33, 1, 0.68, 1)` | Default — gentle deceleration, Calm Mode native |
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entries, fade-ins |
| `ease-in-out` | `ease-in-out` | Transitions between two states (theme switch, mode flip) |
| `ease-active` | `cubic-bezier(0, 0, 0.2, 1)` | Button press pop (scale 0.96) |

## The motion primitives

### 1. Fade-in
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```
Default entry for any new content. 700ms, ease-out.

### 2. Slide-in from bottom
```css
@keyframes slideInFromBottom {
  from { transform: translateY(16px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```
Cards, list items, dashboard widgets. 700ms, ease-out.

### 3. Zoom-in
```css
@keyframes zoomIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```
Modals, focused detail views. 700ms, ease-out.

### 4. Blob drift (ambient only)
```css
@keyframes blob {
  0%   { transform: translate(0,0)   scale(1);   }
  33%  { transform: translate(30px,-50px) scale(1.1); }
  66%  { transform: translate(-20px,20px) scale(0.9); }
  100% { transform: translate(0,0)   scale(1);   }
}
```
8s infinite, used only for landing-page hero background blobs.

### 5. Card hover lift
```css
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px -10px rgba(138, 182, 163, 0.15);
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

### 6. Button press
```css
button:active {
  transform: scale(0.96);
  transition: transform 100ms cubic-bezier(0, 0, 0.2, 1);
}
```

## Motion rules

### 1. Never parallax, scroll-jacking, looping hero video, confetti, or sparkles

The brand is calm. Anything that imposes motion on the user (scroll-jacking) or competes for attention (confetti) breaks it.

### 2. Stagger child entries

When multiple cards enter together, stagger them by **80–120ms** each. Up to 5 children; beyond that, drop the stagger and fade them in as a group.

### 3. Respect prefers-reduced-motion

All motion must fall back to a static state when `(prefers-reduced-motion: reduce)` is set:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 4. Calm Mode swap

When `body.calm-mode` is active, all motion slows 2.5×, easing becomes `ease-soft` everywhere, and transitions between hover/active states become softer.

### 5. No animations on critical safety paths

The kick counter, contraction timer, and BP entry forms must be **instant** — no entry animation, no hover lift, no zoom. If a user is in the middle of timing a contraction, animation is friction.

### 6. Logo interactive glow (marketing only)

```css
.logo-interact:hover img {
  filter: drop-shadow(0 0 8px rgba(138, 182, 163, 0.4));
  transform: scale(1.05) rotate(2deg);
  transition: all 500ms ease-out;
}
```

Only on the marketing site, only on the header logo. Never on in-app surfaces.
