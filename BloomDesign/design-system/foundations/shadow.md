# Shadow

Shadows are **soft and warm** — never harsh black. Two shadows do 95% of the work.

## The scale

| Token | Value | Use |
|---|---|---|
| `shadow-none` | `none` | Default — most elements don't need a shadow |
| `shadow-card` | `0 4px 20px -4px rgba(44, 62, 80, 0.05)` | Default card resting state |
| `shadow-card-hover` | `0 12px 30px -10px rgba(138, 182, 163, 0.15)` | Card hover (lifts 4px up too) |
| `shadow-float` | `0 8px 24px rgba(244, 162, 97, 0.1)` | Warm "lift" for milestone surfaces |
| `shadow-modal` | `0 20px 60px -20px rgba(44, 62, 80, 0.18)` | Modal backdrop |
| `shadow-calm` | `0 10px 40px rgba(0, 0, 0, 0.02)` | Calm Mode universal — barely there |

## Rules

### 1. Never harsh black

The default shadow uses **Deep Charcoal `#2C3E50` at 5% alpha** — never `rgba(0,0,0,…)` straight. The shipped code in `src/index.css` enforces this.

### 2. Hover lifts warmly

When a card hovers, the shadow takes on a **Sage tint** (`rgba(138, 182, 163, 0.15)`) — the shadow itself feels green-ish under the card, signaling growth and life.

### 3. Card hover combines two effects

```css
.premium-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px -10px rgba(138, 182, 163, 0.15);
  border-color: var(--color-sage-light);
}
```

The card both *moves up* and *gains a green shadow*. This is the canonical interaction.

### 4. Calm Mode flattens everything

In Calm Mode, all shadows are replaced with the universal `shadow-calm` (barely visible). The visual hierarchy comes from spacing, not depth.

### 5. Buttons don't have resting shadows

Pill buttons sit flush. Only on `:active` does a button micro-pop (`scale(0.96)`), no shadow change.

### 6. Modals: backdrop + shadow

A modal gets `shadow-modal` AND a `rgba(44, 62, 80, 0.3)` backdrop overlay. Together they create a calm "floating above" feel without going to glassmorphism.
