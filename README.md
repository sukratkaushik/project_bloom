# Project Bloom — design assets branch

> ⚠️ This is the **`design-assets`** branch of [Project_Bloom](https://github.com/sukratkaushik/Project_Bloom). It holds brand and design assets only — **never** product code. It is **never merged into `main`**.

The product code lives on the [`main`](https://github.com/sukratkaushik/Project_Bloom/tree/main) branch.

## What's in here

```
BloomDesign/
└── design-system/
    ├── README.md
    ├── CLAUDE.md                       — load-order + non-negotiables for LLMs
    ├── BRAND-SUMMARY.md                — 60-second snapshot
    ├── CLAUDE-DESIGN-HANDOFF.md        — paste-ready text for Claude Design
    ├── foundations/                    — brand, voice, color, typography, etc.
    ├── tokens/                         — tokens.json + tokens.css + tailwind.preset.js
    ├── logo/                           — SVG + PNG + JPG + usage rules
    ├── components/                     — React + Tailwind starters
    ├── voice/                          — copy examples + drop-in homepage variants
    ├── applications/                   — per-surface guidance (web, IG, LinkedIn, email, decks, ads, infographics)
    └── assets/
        ├── patterns/                   — Mehndi watermark, Rangoli corner, grid, brand wash
        └── templates/                  — real shipped assets + synthetic drafts per surface
```

## How to use

| What you want to do | What to read |
|---|---|
| Start here | [`BloomDesign/design-system/README.md`](BloomDesign/design-system/README.md) |
| Upload to Claude Design | [`BloomDesign/design-system/CLAUDE-DESIGN-HANDOFF.md`](BloomDesign/design-system/CLAUDE-DESIGN-HANDOFF.md) |
| Hand to any LLM that produces brand assets | [`BloomDesign/design-system/CLAUDE.md`](BloomDesign/design-system/CLAUDE.md) |
| 60-second brand snapshot | [`BloomDesign/design-system/BRAND-SUMMARY.md`](BloomDesign/design-system/BRAND-SUMMARY.md) |

## Branch policy

- This branch starts with no history from `main` (orphan branch).
- Never merge into `main`. Never rebase onto `main`.
- Updates to brand assets land here as commits on this branch.
- Tag major releases (e.g., `design-v1.0`) when the brand evolves significantly.

## Why a separate branch?

Design assets evolve on a different cadence than product code, and they're for a different audience (marketing tools, Claude Design, designers — not engineers). Keeping them on a long-lived side branch means:

- `main` stays product-focused.
- Brand commits don't clutter product history.
- Anyone can grab the latest brand kit by switching to this branch — no second repo to manage.

## Provenance

Generated on 2026-05-13 by the design-system-creator skill (Branch B — extract from existing business). Sources:
- Live site at [ourpregnancy.in](https://ourpregnancy.in/) (Firecrawl scrape + extract-design-system).
- Shipped React/Tailwind codebase (`src/index.css` on `main`).
- Existing internal brand kit (`branding/Master-Brand-Kit.md` on `main`).
- Real product screenshots provided by Sukrat.

Where the brand kit and the shipped product disagreed, the **shipped product wins**.
