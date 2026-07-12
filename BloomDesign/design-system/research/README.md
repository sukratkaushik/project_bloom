# Research

The receipts for every decision in this design system.

| File | What it is |
|---|---|
| [`reconciliation.md`](reconciliation.md) | Where the brand kit and the shipped product disagreed, and which one we picked. Version-by-version log of brand-kit → live-site reconciliation across v1.0–v1.5. |
| [`claude-design-form.md`](claude-design-form.md) | Paste-ready text for Claude Design's "Set up your design system" setup form (company blurb + non-negotiables notes). |
| [`firecrawl-latest.json`](firecrawl-latest.json) | Latest Firecrawl scrape of ourpregnancy.in. Contains markdown, branding extraction (colors, fonts, components), and meta tags. |
| [`extracted-tokens.json`](extracted-tokens.json) | Latest `extract-design-system` normalized output — independent CSS-computed token extraction that cross-checks the Firecrawl values. |
| [`shipped-screens/`](shipped-screens/) | **57 canonical screenshots** of the live app (June 2026 capture). The visual source of truth. When docs and screenshots disagree, the screenshots win. See folder README for the full index by surface. |

## How this folder is used

When you ship a refresh:
1. Re-scrape: `npx -y firecrawl-cli@latest scrape https://ourpregnancy.in/ --format markdown,branding --full-page-screenshot --wait-for 5000`
2. Re-extract: `npx -y extract-design-system@latest https://ourpregnancy.in/ --extract-only`
3. Copy the slimmed Firecrawl output → `firecrawl-latest.json`, and `.extract-design-system/normalized.json` → `extracted-tokens.json`.
4. Append a new "v1.x reconciliation" section to `reconciliation.md`.
5. Commit.

## When NOT to update this folder

- For copy tweaks that don't trace back to a live-site change. Those go in the relevant `voice/`, `applications/`, or `foundations/` doc directly.
- For private extraction caches (`brands/`, `.extract-design-system/`) — those stay gitignored. Only the slimmed, signal-dense outputs land here.
