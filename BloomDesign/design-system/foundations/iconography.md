# Iconography

Two icon systems coexist: a **utility system** (lucide-react, used throughout the app) and an **expressive emoji set** (used for navigation and emotional moments).

## 1. Utility icons — Lucide

`lucide-react` ships in `package.json`. Use it for *every* utility icon — close, edit, delete, chevron, plus, search, settings, lock, sync, share.

### Specs

- **Stroke width:** 1.75 (slightly softer than Lucide's 2.0 default)
- **Size:** 16, 20, 24 (rarely 32). Default 20.
- **Color:** inherits `currentColor`. Buttons set the stroke via text color.

### Common icons mapped

| Use | Lucide name |
|---|---|
| Close / dismiss | `X` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| Add | `Plus` |
| Search | `Search` |
| Settings | `Settings` |
| Lock / privacy | `Lock` |
| Sync | `RefreshCw` |
| Share | `Share2` |
| Chevron right | `ChevronRight` |
| Calendar / date | `Calendar` |
| Clock / time | `Clock` |
| Heart (favorite) | `Heart` |
| Bell (alert) | `Bell` |
| Help | `HelpCircle` |
| Check / done | `Check` |
| Info | `Info` |
| External link | `ExternalLink` |
| Download | `Download` |
| User / profile | `User` |
| Users / partner | `Users` |
| Phone (emergency) | `Phone` |

## 2. Expressive emoji — for nav & emotional moments

The shipped sidebar uses real emoji as feature icons. They warm the navigation and are culturally legible to Indian users.

### Approved nav emoji

| Feature | Emoji |
|---|---|
| Pregnancy Tracker | 📅 (calendar) |
| Kick Counter | 👣 (footprints) |
| Contraction Timer | ⏱️ (stopwatch) |
| Vitals (BP/Weight) | 💙 (blue heart) |
| Mood Tracker | 😊 (smile) |
| Hydration | 💧 (droplet) |
| Nutrition | 🥗 (salad) |
| Symptom Log | 📈 (chart) |
| AskOur Pregnancy AI | ✨ (sparkles) |
| AI Food Guide | 🧁 (cupcake) |
| Name Generator | 🌟 (star) |
| Partner Sync | 🐝 (bee — collaborative) |
| Notes & Journal | 📝 (memo) |
| Settings | ⚙️ (gear) |
| Feedback | 💬 (speech bubble) |
| Calm Mode | 🌿 (herb) |
| Dark Mode | 🌙 (moon) |
| Log Out | 🚪 (door) |

### Approved tonal emoji

For copy moments — celebration, warmth, care:
> 🌸 ✨ 🤍 🌿 🇮🇳 🤰🏻

### Banned emoji

Never use anything that creates alarm or feels clinical:
> 🚨 ⚠️ ❗ 💊 🆘 🔴 ☠️ 💉 🏥 (as alarm) 📢 🚫

## 3. Logo as icon

Use the lotus app icon (`logo/mark.svg`) as the system's signature icon — in the header, favicon, app icon, and as a watermark when no other icon fits.

## 4. Icon + label rule

In navigation, **always** pair an icon with a text label. Icon-only nav is acceptable only in (a) icon buttons for one-shot actions (close, edit) and (b) very tight mobile bars where labels appear on tap.

## 5. Decorative line-art

For decorative motifs (Mehndi watermarks, footer ornament, deck end-slide), use the SVG patterns in `assets/patterns/`. These are not icons; don't use them inline.
