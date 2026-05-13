# Our Pregnancy — Design System

The single source of truth for everything **Our Pregnancy** ships: the live web app, marketing site, social posts, decks, emails, infographics, and ads.

**Product:** [ourpregnancy.in](https://ourpregnancy.in/) — a privacy-first pregnancy companion for Indian mothers.
**Internal codename:** Project Bloom (do not use externally).

## What's in here

| Folder | What it is |
|---|---|
| `BRAND-SUMMARY.md` | One-page snapshot — read this first. |
| `CLAUDE.md` | Load order + non-negotiables for any LLM consuming this system. |
| `foundations/` | Brand foundations: voice, vocabulary, color, typography, spacing, motion, imagery. |
| `tokens/` | Machine-readable tokens — JSON, CSS custom properties, Tailwind preset. |
| `logo/` | Logo SVGs + rasters + usage rules. |
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

This system was extracted on **2026-05-12** from:
- The live site at https://ourpregnancy.in/ (Firecrawl scrape + extract-design-system).
- The shipped React/Tailwind codebase at `src/index.css`.
- The existing internal brand kit at `branding/Master-Brand-Kit.md`.
- Real product screenshots (dashboard, planning, nutrition).

Where the brand kit and the shipped product disagreed, the **shipped product wins**.
