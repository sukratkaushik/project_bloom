# Ads — paid social and search

Performance budget is real. Every ad has to earn its impression.

## Channels & formats

| Channel | Format | Sizes | When |
|---|---|---|---|
| **Meta (Instagram / Facebook)** | Single image | 1080 × 1080, 1080 × 1350, 1080 × 1920 | Awareness, installs |
| Meta | Carousel | 1080 × 1080, 10 cards | Feature explanation, scheme guides |
| Meta | Reels / Video | 1080 × 1920, 6–15 sec | Demo, testimonial |
| **Google Search** | Responsive search ad | 30-char headlines × 15, 90-char descriptions × 4 | Intent capture (queries like "pregnancy tracker India") |
| **Google Display** | Image | 300×250, 728×90, 160×600, 1200×628 | Retargeting |
| **YouTube** | Skippable in-stream | 1920 × 1080, 5–30 sec | Brand awareness |

## The ad voice — specific, single-claim

An ad has one job and 1.5 seconds to do it. Rules:

1. **One specific claim per ad.** Never "Track everything, save money, plan birth, prepare." Pick the one thing.
2. **Lead with a number.** *"PMMVY pays ₹5,000."* > *"Get government benefits."*
3. **One CTA.** "Try it free" or "Open the app" — never both.
4. **Indian context first.** *"Pregnancy tracker that knows ragi and JSY"* is better than *"Built for Indian mothers."*
5. **No hype words.** Banned everywhere; in ads, doubly so. *Cutting-edge / AI-powered / revolutionary* fails performance tests.

## Approved headline patterns (Meta + Google)

### Pattern 1 — The free claim
- "Free pregnancy tracker. No account needed."
- "Track kicks, BP, contractions — free, forever."
- "₹0/month. Forever. For everything you actually need."

### Pattern 2 — The privacy claim
- "Your pregnancy data stays on your device."
- "Track your pregnancy without an account."
- "No data brokering. No ads. Just tracking."

### Pattern 3 — The India claim
- "Pregnancy tracker that knows ragi and JSY."
- "Track your pregnancy — and don't miss ₹5,000 from PMMVY."
- "200+ Indian foods, scheme guides, 108 helpline. Free."

### Pattern 4 — The specific feature
- "Kick counter with auto-alerts. Free."
- "Time contractions. Get the 5-1-1 rule automatically."
- "Hospital bag checklist for Indian mothers."

## Visual rules in ad creative

| Surface | Rule |
|---|---|
| Background | Sandalwood. Never pure white. Never a stock photo unless it's of a real Indian mother in a real space (see `foundations/imagery.md`). |
| Headline | Playfair Display, sentence case, max 8 words. |
| Subhead | Nunito 18pt, max 14 words. |
| CTA button | Pill, Sage, white text, "Try free" or "Open app." |
| Logo | Small lotus mark + wordmark, top-left or bottom-right, never centered with the content. |
| Disclaimer text | Below CTA, 12pt Medium, only if the ad makes a medical claim. |

## Google Search RSA — headline set

15 headlines, ≤30 chars each. Don't pack all keywords into one — Google rotates.

```
Free Pregnancy Tracker India
Track Kicks, BP, Contractions
Indian Pregnancy Companion
Privacy-First Pregnancy App
₹0 Pregnancy Tracker
PMMVY Reminder + Tracker
Pregnancy App for Indians
Free Hospital Bag Checklist
Contraction Timer 5-1-1
Pregnancy Tracker, No Account
Kick Counter with Alerts
Government Scheme Tracker
JSY PMMVY JSSK Guide
Indian Foods Safety Database
Track Pregnancy — Free Forever
```

## Google Search RSA — descriptions

4 descriptions, ≤90 chars each.

```
Free pregnancy tracker built for Indian mothers. Track kicks, BP, contractions — no account.
Indian foods safety database, JSY/PMMVY scheme reminders, hospital bag — all free, all private.
Privacy-first pregnancy companion. Data stays on your device. No ads, no payment required.
Built for Indian mothers 🇮🇳. Free forever for the basics. Try ourpregnancy.in now.
```

## Negative keywords (Google Search)

Always include these as negatives to avoid wasted spend:
- `app development`
- `clinical trial`
- `download .apk`
- `hindi version`
- `apk`
- competitor names (review monthly)

## Landing pages from ads

Send each ad to a **dedicated landing page** that mirrors the ad's claim. Don't drop ad traffic on the generic homepage.

| Ad claim | Landing page |
|---|---|
| Free pregnancy tracker | `/free` |
| PMMVY scheme tracker | `/schemes` |
| Kick counter | `/kick-counter` |
| Hospital bag checklist | `/hospital-bag` |

Each landing page: hero with the claim, 3 trust signals (free, private, offline), one CTA, one screenshot.

## Performance budgets

- **CTR target (Meta):** 1.5%+ on awareness, 2.5%+ on retargeting.
- **CPC target (Google):** under ₹15 for branded, under ₹40 for non-brand.
- **Install cost (Meta):** under ₹50 in Tier-1, under ₹25 in Tier-2/3.

## What ads NEVER do

- ❌ Stock images of pregnancy bumps in white-room studios.
- ❌ AI-generated humans.
- ❌ "Doctor recommended" claims unless we have a real doctor on record.
- ❌ Testimonials without first name + city.
- ❌ Countdown urgency ("Last 24 hours!") — we're not running a sale.
- ❌ Before/after framings.
- ❌ "Comment your due date below!" engagement bait.
