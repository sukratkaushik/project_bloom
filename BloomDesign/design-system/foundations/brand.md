# Brand foundation

## Who we are

**Our Pregnancy** is a pregnancy companion app made for Indian mothers. We exist because the average pregnancy app is built for a Western audience, treats users as data points, and charges for tools that should be free.

## Mission

Give every expectant mother in India a calm, well-designed companion through pregnancy — one that respects both modern medicine and the cultural rhythms of life in India. Core tracking is free for everyone. AI-powered tools (food scanner, chatbot, name generator) come with the Premium tier.

## Vision

A healthy, joyful, lower-anxiety pregnancy journey for every Indian mother, without the noise of clinical-feeling tools.

## Archetype

**The Caregiver × The Sage.** Empathetic, nurturing, knowledgeable, deeply trusted. Think a thoughtful older sister who happens to be a doctor — calm, kind, knows the science, but speaks human.

## Pillars

1. **Privacy & security.** Encrypted on-device storage with optional cloud sync (Firebase). Only accessible by you. Granular sharing controls on Partner Sync.
2. **Core features free.** Vitals, kicks, contractions, birth plan, government schemes, food guide, hospital bag — free, always. AI features (food scanner, Ask Bloom) sit behind a future Premium tier.
3. **Indian by design.** Built around Indian foods, schemes, helplines, festivals, family structure.
4. **Calm interfaces.** No alarm-red. No hype. Sandalwood backgrounds. Soft motion. Calm Mode for 3am.
5. **AI in service of safety.** AI-powered features (food scanning via Qwen2.5-VL, Ask Bloom via Hugging Face Router) only where they make pregnancy *safer* — never as decoration.

## Tagline & elevator pitch

**Tagline:** *Your pregnancy companion — secure & synced.*

**Elevator pitch (~50 words):**
> Our Pregnancy is a pregnancy companion app built for Indian mothers. Track vitals, count kicks, time contractions, plan the hospital bag, navigate JSY and PMMVY, and check Indian foods for safety with an AI scanner. Core tracking is free. Your data is encrypted and only accessible by you.

## Anti-brand

We are **not**:
- A clinical / medical-looking app.
- A US/EU pregnancy app translated to Indian English.
- An "AI-powered" hype product (AI is in service of safety, not the headline).
- An ad-supported or data-monetized app.
- A subscription wall around basic safety features.

## Pricing — current shape (May 2026)

The shipped product runs on a tier:

| Tier | What's in it | Status |
|---|---|---|
| **Core (always free)** | Vitals, kicks, contractions, mood, hydration, nutrition, symptom log, hospital bag, birth plan, government schemes, Partner Sync, FHIR R4 EHR export, Pregnancy Timeline, Calm/Dark Mode | Live |
| **Premium (coming)** | Ask Bloom 24/7 AI chatbot, AI Food Safety Scanner (Qwen2.5-VL-72B), AI Name Generator, predictive Labor Readiness Score | AI tools coming soon — actively in development |

Pricing language to use:
- ✅ "Core features free."
- ✅ "AI tools coming soon."
- ✅ "Core features, always free."
- ❌ "Free forever" (too absolute given the Premium tier in flight)
- ❌ "Pay nothing" (we'll be charging for AI eventually)
- ❌ "Free with no hidden costs" (retired in commit `fdb6ada`)

## Naming

| Use | Name |
|---|---|
| **External** (web, social, app store, all marketing) | Our Pregnancy |
| **Domain & handle** | ourpregnancy.in, @ourpregnancy |
| **Internal codename (repo, branches, slack)** | Project Bloom |
| **AI assistant nickname (visible to users)** | Ask Bloom — *yes, the chatbot is branded "Bloom" even externally. It's the one place "Bloom" leaks out.* |
| **Email** | hello@ourpregnancy.in |

Never use "Project Bloom" in any external surface. The chatbot product name "Ask Bloom" is the only sanctioned external use of "Bloom".
