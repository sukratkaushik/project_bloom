# Vocabulary

The words we use, the words we don't.

Last refreshed against live site on **2026-05-17** to reflect retired claims and new product features.

## Product nouns — say these

| Preferred | Avoid |
|---|---|
| Our Pregnancy | The app, Bloom, Project Bloom (note: "Ask Bloom" is the AI chatbot's external name — keep it) |
| Companion | Tracker, dashboard, platform |
| Track | Log, record, capture |
| Tip / insight | Article, content, post |
| Plan | Roadmap, schedule, queue |
| Partner | Husband, spouse, significant other |
| Baby | Foetus, child, embryo (clinical only) |
| Kick / movement | Foetal activity |
| Contraction | Uterine spasm |
| Due date | EDD (only in medical contexts) |
| Hospital bag | Birth kit |
| Mood | State, condition |
| Calm Mode | Anxiety mode, accessibility mode |
| Dark Mode | Night theme |
| Cloud Sync | Auto-sync, cross-device backup |
| Partner Sync | Couple sharing, two-person mode |
| Ask Bloom | AI chatbot, Q&A bot, AI helper |
| AI Food Safety Scanner | Food checker, photo scanner, AI camera |
| Labor Readiness Score | Birth predictor, labor predictor |
| FHIR R4 EHR Export | Health record export, hospital export |
| Premium (capitalised) | Paid tier, paid version, pro |

## Health & medical nouns

Use the names users hear from doctors and family.

- **Vitals** — BP, weight, temperature
- **Trimester 1 / 2 / 3** — never T1/T2/T3 in user-facing copy
- **Folic acid, iron, vitamin D, DHA, calcium** — by name, with dosage
- **Ultrasound** — never *sono* or *scan* (which is regional and ambiguous)
- **Antenatal check-up / ANC** — *check-up* in body copy, *ANC* in technical/medical
- **Midwife / OB / gynaecologist** — say *OB or midwife*, let users pick
- **Preeclampsia** — spell out, don't abbreviate
- **Gestational diabetes / GDM** — *gestational diabetes* in body, GDM acceptable in tracking
- **HRV, RHR, Braxton Hicks** — fine to use as-is for the Labor Readiness Score (medical-literate audience)

## Indian-context nouns — say these specifically

Don't generalise; name the thing.

- **Foods:** dal, ragi, paneer, ghee, ladoo, jeera water, methi, amla, papaya (raw vs ripe), pickles, chai, biryani, chana masala, butter chicken, naan, raita
- **Schemes:** JSY (Janani Suraksha Yojana), PMMVY (Pradhan Mantri Matru Vandana Yojana), JSSK (Janani Shishu Suraksha Karyakram), Mission Indradhanush
- **Helplines:** 108 (ambulance), 112 (national emergency), 1098 (child), iCall (psychosocial)
- **Settings:** PHC (Primary Health Centre), CHC (Community Health Centre), private hospital, midwife / dai
- **Festivals & timing:** Karwa Chauth, Navratri, Ramadan, Diwali, Pongal, Onam, Eid, Christmas — name them, don't say *religious holidays*
- **Family:** MIL (mother-in-law), partner, mom (not mother — too formal), sister-in-law
- **Currency:** ₹ symbol, comma separators (₹5,000 not Rs.5000 or 5000 INR)

## Product features — say these

The shipped product surfaces these features by these names. Use them verbatim.

| Feature | Exact name |
|---|---|
| Pregnancy tracker (week-by-week) | Pregnancy Timeline *(rebranded — was "Pregnancy Tracker")* |
| Kick counter | Kick Counter |
| Contraction timer | Contraction Timer |
| BP + weight | Vitals Tracker |
| Mood logger | Mood Tracker |
| Hydration | Hydration |
| Nutrition + supplements | Nutrition & Supplements |
| Symptom logger | Symptom Log |
| AI chatbot | **Ask Bloom 24/7** *(rebranded — was "AskOur Pregnancy AI")* |
| AI food scanner | **AI Food Safety Scanner** *(now Gemini + Qwen2.5-VL backed)* |
| Name generator | AI Name Generator |
| Hospital bag | Multiple Checklists *(rebranded — was "Hospital Bag Checklist")* |
| Birth plan | Birth Plan Builder |
| Partner sharing | **Real-Time Partner Sync** *(was "Partner Sync"; now sells WebRTC + encrypted cloud)* |
| Notes | Notes & Journal |
| Cloud backup | Cloud Sync |
| Health record export | **FHIR R4 EHR Export** |
| Biometric labor prediction | **Labor Readiness Score** |
| Calm Mode | Calm Mode |
| Dark Mode | Dark Mode (sometimes shown as "Calm/Dark Mode") |

## Numbers — always include them

The brand promises **specific** value, not vague benefit. Every claim should have a number.

| Vague (bad) | Specific (good) |
|---|---|
| Saves money | Saves up to ₹400 per BP check (free at PHCs) |
| Track easily | Count kicks daily from 28 weeks — auto-alerts under 10 in 2 hrs |
| Government scheme support | PMMVY pays ₹5,000 cash assistance for first pregnancy |
| Many users love it | Quote from a real user with first name + city (e.g., "Priya M., Mumbai") |
| Lots of food coverage | AI-scanned safety check for hundreds of Indian dishes |
| Comprehensive | 11-tile feature grid covering tracking, AI, labor readiness, and EHR export |

## Retired claims (May 2026) — never use

The brand walked back several absolutes in commits `8d70c3d` and `fdb6ada`. These phrases were live on the homepage; they are no longer:

| ❌ Retired | Why |
|---|---|
| "All your data, entirely free" | Premium tier in flight |
| "No hidden costs. Completely Free." | Same |
| "Free forever" | Same |
| "Pay nothing" | Same |
| "Privacy-first" | Too absolute — we have Firebase + cloud sync |
| "Your data stays on your device" | Now: "Your data is private & secure" |
| "Stored locally" / "Local-first" | Now: "Encrypted and only accessible by you" |
| "No account needed" | Modal flow requires email/Google sign-in |
| "Free and offline" (as a unit) | Now: "Core features free", "Works offline via PWA" |
| "Never touches a centralized database" | Now using Firebase Firestore (commit `8d70c3d`) |

If you find these in older marketing, replace them with the equivalent current phrase.

## What we never say

| Banned | Why |
|---|---|
| Revolutionary / game-changing / 10x | Hype words |
| Cutting-edge / next-gen | Hype words |
| Supercharge / unleash / leverage | Hype words |
| Transform your pregnancy | Hype + overpromises |
| AI-powered (as bare adjective) | Hype; specify *which* AI feature does what (e.g., "Gemini-powered AI Food Safety Scanner") |
| Seamless / robust | Empty filler |
| Best-in-class / world-class | Cliché |
| Users (in user-facing copy) | Always *you* |
| Mothers will love this | Always *you'll* |
| Click here / Click below | Replace with action verb |
| Sign up to unlock | *Sign up to sync* — describe the value, not the gate |
| Don't worry / Don't stress | Patronising; the user decides what to worry about |
| Just relax / Just trust the process | Patronising |
| Mama / Mommy / Mumma | Too American/baby-talk for Indian audience — *mom* if needed |
| Bump (in marketing) | Acceptable in casual social copy, never in clinical / health copy |

## Phrases we love (current)

The post-refresh set:

- *Made for Indian mothers* (with 🇮🇳 emoji, only in this exact phrase)
- *Your data is private & secure*
- *Your data is encrypted and only accessible by you*
- *Core features, always free*
- *AI tools coming soon*
- *No payment required* (yes, still on the trust bar — but only as a chip, not the headline)
- *Works offline via PWA*
- *Always consult your OB or midwife*
- *Let's*… (any sentence)
- *Hmm, …* (recovery openers)
- *A few things to know:*

## How to talk about AI

The product now ships real AI features (Ask Bloom, Food Scanner) on a Cloud-Functions-and-Hugging-Face backend. Talk about them like a careful safety feature, not a magic trick.

| ❌ Don't say | ✅ Say |
|---|---|
| AI-powered insights | Gemini-powered AI Food Safety Scanner |
| Our AI knows everything | Ask Bloom answers pregnancy questions with our fine-tuned AI companion |
| Revolutionary AI for moms | The AI scanner is tailored for Indian cuisine — biryani, dal, paneer, raw papaya, street food |
| Powered by GPT / OpenAI | (Don't name underlying providers — say "Gemini-powered" only where it's already on the site, otherwise just "AI") |

## Disclaimer — paste verbatim wherever needed

> Our Pregnancy provides general guidance and cultural wisdom. Always consult your gynecologist or healthcare provider for medical advice.
