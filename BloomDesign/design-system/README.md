# Our Pregnancy — Design System

The single source of truth for everything **Our Pregnancy** ships: the live web app, marketing site, social posts, decks, emails, infographics, and ads.

**Product:** [ourpregnancy.in](https://ourpregnancy.in/) — a pregnancy companion app for Indian mothers. Core features always free; AI tools (Ask Bloom, Food Scanner, Name Generator) coming soon.
**Internal codename:** Project Bloom (do not use externally).

## What's in here

| Folder | What it is |
|---|---|
| `BRAND-SUMMARY.md` | One-page snapshot — read this first. |
| `CLAUDE.md` | Load order + non-negotiables for any LLM consuming this system. |
| `foundations/` | Brand foundations: voice, vocabulary, color, typography, spacing, motion, imagery. |
| `tokens/` | Machine-readable tokens — JSON, CSS custom properties, Tailwind preset. |
| `logo/` | **Canonical logo PNG** (`logo.png`) + composed PNG lockups + strict usage rules. No SVG — the painted lotus is canonical only as the PNG. |
| `components/` | React + Tailwind component starters. |
| `voice/` | Voice examples and drop-in homepage copy. |
| `applications/` | Per-surface guidance — web, decks, IG, LinkedIn, email, infographics, ads. |
| `assets/templates/` | Real shipped artifacts (canonical) + synthetic drafts where none exist. |
| `assets/patterns/` | Mehndi / Rangoli line-art SVG patterns for subtle backgrounds. |

## How to use

1. Read `BRAND-SUMMARY.md` for the 60-second overview.
2. If you're an LLM generating assets, load `CLAUDE.md` first.
3. For per-surface specs, jump straight to `applications/<surface>.md`.
4. For code, import from `tokens/tokens.css` or wire up `tokens/tailwind.preset.js`.

## Provenance

This system was first extracted on **2026-05-12** and most recently refreshed on **2026-05-17** from:
- The live site at https://ourpregnancy.in/ (Firecrawl scrape + extract-design-system).
- The shipped React/Tailwind codebase at `src/index.css`.
- The existing internal brand kit at `branding/Master-Brand-Kit.md`.
- Real product screenshots (dashboard, planning, nutrition, food scanner, landing page).

Where the brand kit and the shipped product disagreed, the **shipped product wins**.

See [`CHANGELOG.md`](CHANGELOG.md) for the full refresh history.

## Version

Currently at **v1.2** (May 2026 landing-page refresh + AI features).
