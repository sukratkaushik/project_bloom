# Voice & tone

## The voice in one line

> Empathetic older sister > strict doctor. Modern > traditional. Calm > urgent.

## Tone spectrum

We lean toward… over…

| | |
|---|---|
| **Empathetic** — "Let's check that date" | Authoritative — "Invalid input" |
| **Modern** — backed by nutrition science | Folkloric — "old wisdom says…" |
| **Calm** — "your baby is growing well" | Urgent — "ALERT: low movement!" |
| **Specific** — "400–800mcg folic acid" | Vague — "take your supplements" |
| **Cultural** — "fasting tips for Karwa Chauth" | Generic — "religious holiday tips" |

## The voice rules

### 1. Always second person

✅ *Your baby is growing every day.*
❌ *Users will see their baby's progress.*
❌ *Mothers can track their kicks.*

### 2. Sentence case in headings

✅ *Your daily health tips*
❌ *Your Daily Health Tips*
❌ *YOUR DAILY HEALTH TIPS*

Only exception: ≤3-word overlines that act as labels — *DAILY KNOWLEDGE DROP*, *BABY SIZE*, *CRITICAL*, *OPTIONAL*.

### 3. Contractions are warm

✅ *We're glad you're here.*
✅ *Let's set up your due date.*
❌ *We are glad that you are here.*

### 4. Speak the user's nouns

The user's world: **baby, kick, contraction, due date, ladoo, dal, ragi, paneer, midwife, hospital bag, ultrasound, JSY, PMMVY, 108, calm mode, partner, mom, MIL.**

Our world (avoid in user-facing copy): *user, platform, app, AI, LLM, pipeline, ingestion, sync, schema, endpoint, dashboard*.

It's okay to say *app* or *dashboard* sparingly — but lead with the user's noun.

### 5. No hype vocabulary

**Banned, everywhere:**

> revolutionary, game-changing, 10x, cutting-edge, supercharge, unleash, leverage, transform, synergy, seamless, robust, AI-powered (as a bare adjective), best-in-class, world-class, next-gen, disrupt, redefine, reimagine, empower (as filler).

**Replace with the specific thing:**

| ❌ | ✅ |
|---|---|
| AI-powered insights | Personalised tips, based on your due date and week |
| Revolutionary tracker | A simple kick counter that auto-alerts you if the count is low |
| Seamless sync | Sync across your phone and your partner's phone |
| Robust security | Encrypted on your device. Nothing leaves until you say so. |
| Transform your pregnancy | A small tool that makes the next 9 months a bit easier |

### 6. Every claim gets a number or a name

✅ *Free at PHCs — saves up to ₹400 per BP check.*
✅ *PMMVY pays ₹5,000 cash assistance for first-time mothers.*
✅ *Auto-alerts if kick count drops below 10 in 2 hours.*
❌ *Saves you money.*
❌ *Keeps you safe.*

### 7. No alarm copy

| ❌ | ✅ |
|---|---|
| ERROR: Invalid date. | Oops! Let's check that date again. |
| Submission failed. | Hmm, that didn't go through. Let's try once more. |
| Required field. | We'll need this to keep tracking — please fill it in. |
| Login failed. Try again. | Hmm, that didn't match. Let's try again. |
| Are you sure you want to delete? | Just checking — delete this entry? You can't undo this. |

### 8. Approved emoji set — use sparingly

> 🌸 ✨ 🤍 🌿 🇮🇳 🤰🏻

Never use clinical or alarm emoji: 🚨 ⚠️ ❗ 💊 🆘. They break the calm.

### 9. Indian English, no Hinglish in body copy

The audience reads English fluently. We do **not** code-switch into Devanagari or transliterated Hindi inside body copy. Indian nouns (*ladoo, dal, Karwa Chauth, JSY, MIL*) stay in English-Indian context where they belong.

✅ *Fasting tips for Karwa Chauth*
❌ *Karwa Chauth ke liye fasting tips*

### 10. Cultural sensitivity

- Don't assume the user is in a heterosexual marriage. *Partner* > *husband*.
- Don't assume the user is the genetic mother. *You / your pregnancy* > *biological mother*.
- Don't assume religious context. *Festivals* > *Hindu festivals*. List Diwali, Eid, Christmas, Pongal, Onam, Karwa Chauth equally.
- Don't lecture on choices. Inform, don't moralise — say *some women choose…* not *the right choice is…*.

### 11. How to talk about AI

The product now ships real AI: **Ask Bloom 24/7** (chatbot), **AI Food Safety Scanner**, **AI Name Generator**, **Labor Readiness Score**. Talk about each AI feature as a careful safety tool, not a magic wand.

| ❌ Don't | ✅ Do |
|---|---|
| Revolutionary AI for pregnancy | AI Food Safety Scanner — tailored for Indian cuisine |
| Our AI knows everything | Ask Bloom answers pregnancy questions; always verify with your OB or midwife |
| Powered by next-gen LLMs | Gemini-powered AI Food Safety Scanner (only name providers already on the site) |
| AI will track everything for you | The AI scanner flags risky ingredients in items like raw papaya or street food |
| AI-driven personalised insights | "Auto-alerts if your kick count drops below 10 in 2 hours" |

**Rule of thumb:** every AI claim names the *specific* feature, the *specific* user problem it solves, and includes a *safety disclaimer* (when relevant). Never sell AI as a magic helper.

### 12. Don't reintroduce retired claims

In May 2026 the brand walked back several absolutes. Never reintroduce them in any new copy:

- ❌ "Free forever / Pay nothing / All entirely free" → ✅ "Core features, always free"
- ❌ "Privacy-first" → ✅ "Private & secure"
- ❌ "Your data stays on your device" → ✅ "Your data is private & secure"
- ❌ "Stored locally / Local-first" → ✅ "Encrypted and only accessible by you"
- ❌ "No account needed" → (omit — modal flow now requires sign-in for sync)
- ❌ "Never touches a centralized database" → (omit — Firebase Firestore is in use)

If you spot any of these in older marketing files or templates, replace with the current equivalent.

## When the voice changes by surface

| Surface | Adjustment |
|---|---|
| **In-app tracking** | Tighter, more functional — "Kick count: 7" not "You've felt 7 little kicks!" |
| **Knowledge tips / Articles** | Warmer, more conversational — "Did you know…" |
| **Errors / Empty states** | Warmest — recovery-oriented, never alarm |
| **Marketing site** | Confident, claim-backed — "Core features, always free" not "100% free" (retired May 2026); always specific over absolute |
| **Social / IG / LinkedIn** | Slightly more poetic — Playfair Display quotes shine |
| **Email — transactional** | Clear, calm, never hype |
| **Email — newsletter** | Closest to a friend writing — first-name openers, P.S. lines |
| **Ads** | Specific claim + one number + one CTA. Never "click here." |

See `voice/examples.md` for paired do/don't examples per surface.
