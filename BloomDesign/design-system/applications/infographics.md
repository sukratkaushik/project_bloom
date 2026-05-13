# Infographics

When complex content needs visual structure — week-by-week pregnancy guides, scheme comparison tables, "what's safe to eat" reference sheets, hospital bag checklists.

## Output formats

- **Web** — embedded SVG or PNG, max width 880px, scrollable on mobile.
- **PDF** — A4 portrait (210 × 297mm) for printable handouts.
- **Social** — 1080 × 1350 (IG portrait) or 1080 × 4500 (long stitched-share) when length demands.

## Composition rules

- **One axis of comparison.** If you're comparing 3 things, all 3 are on the same row. If you're showing 9 weeks of growth, all 9 are in the same column.
- **Generous whitespace.** Infographics fail when they look like spreadsheets. Default 48px gutter between sections.
- **A clear visual hierarchy.** Use exactly 3 levels of type — title (Playfair 40pt), section heading (Playfair 24pt), body (Nunito 16pt).
- **One accent color per section.** Sage for "safe / recommended," Soft Saffron for "watch closely," Critical for "avoid."
- **Source citations on every fact.** Footer block lists references (WHO, NHS, Govt of India).

## Templates

### Template A — Week-by-week comparison

A vertical timeline. Each row = one week. Columns:

| Column | Content |
|---|---|
| Week label | Playfair 36pt "Week N" in Sage |
| Baby size | Image + Playfair 24pt size (e.g., "23 mm") |
| What's happening (body) | Nunito 16pt, 2–3 lines |
| What you might feel | Nunito 14pt italic, Medium |

Connect rows with a 2px dotted Sage line on the left.

### Template B — Safe food / not safe

Two-column grid: ✅ Safe (Sage-pale bg) / ❌ Avoid (Critical-bg pale `#FDF5F5` — kept soft).

| ✅ Safe | ❌ Avoid |
|---|---|
| Dal (all kinds) | Raw papaya (early term) |
| Boiled eggs | Runny eggs |
| Pasteurised paneer | Soft cheeses (raw milk) |
| Cooked sprouts | Raw sprouts |
| Filtered water | Street water |

Each row gets a small icon (lucide-react size 24px) on the left.

### Template C — Scheme comparison (JSY / PMMVY / JSSK)

Three-column card layout. Each card:
- Scheme name in Playfair 28pt
- One-line description in Nunito 16pt
- Cash benefit number in Playfair 60pt (e.g., ₹5,000)
- "Eligibility" Nunito 14pt list of 3 bullets
- "How to apply" Nunito 14pt link/list

### Template D — Hospital bag checklist (printable PDF)

Single column, checkboxes on the left, item names in Nunito 16pt.

Sections divided by Playfair 22pt overlines:
1. For mom — labor / delivery
2. For mom — recovery
3. For baby — first 48 hours
4. Documents
5. Snacks & comfort

## Color palette in infographics

Use the **full brand palette** here — infographics benefit from clear color-coding:

- **Sage** — safe / recommended / done
- **Lotus Pink** — emotional / first-time / partner
- **Soft Saffron** — milestone / watch / cultural
- **Tulsi Mint pale** — success / completed
- **Critical** — avoid / urgent
- **Medium / Light** — supporting / disabled

## Footer (required on every infographic)

Always include in the footer:

1. **Source citations** — WHO 2024, Govt of India MOHFW website, etc.
2. **Disclaimer** — "Always consult your OB or midwife."
3. **Brand mark + URL** — small lotus + "ourpregnancy.in"
4. **Last updated** — "Updated May 2026" — so we know when to refresh.

## Iconography in infographics

Use lucide-react icons at 24–32px, Charcoal stroke, paired with body text. Never use multi-color icon packs.

Approved category icons:
- 🥗 / `Salad` — food
- 🏥 / `HeartPulse` — health
- 💊 / `Pill` (rare — only when literally about supplements)
- 📞 / `Phone` — helpline
- 🧾 / `FileText` — documents
- 👶 / `Baby` — baby content
- 🤰 / `Heart` — mom content
- 📅 / `Calendar` — week / timeline

## When NOT to make an infographic

If the content fits in 3 lines of body copy, write 3 lines — don't dress it up.
If the comparison is just 2 things, use a 2-column card layout, not an "infographic."
