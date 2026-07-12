# Homepage copy — drop-in variants

Three full sets of hero copy. Mix and match across A/B tests. All on-brand.

Last refreshed against live site on **2026-06-14** (visual review of 57 shipped screenshots).

## Sticky glassmorphic header (v1.5 — nav expanded)

Floats above the page, centered, max-width 1200px, with rounded `20px` corners. Backdrop blur + white/90 fill. Border + shadow intensify when the user scrolls more than 20px.

```
RESTING (top of page)        SCROLLED (>20px)
top: 16px                    top: 8px
padding: 14px 24px           padding: 8px 24px
shadow: 0 4px 20px           shadow: 0 12px 32px (heavier)
border: border/80            border: sage-light/20 (tinted)
```

**Left:** Lotus logo (`/logo.png`, 40–48px tall) + "Our Pregnancy" Sage Playfair semibold (hidden below 400px). The wordmark carries `.notranslate` so Google Translate leaves the brand name alone.

**Center (desktop only, ≥768px):** **Five** nav links (was three in v1.3) — `Features` · `How it Works` · `About` · `Pricing` · `Team`. Charcoal/80 text, hover underline grows left-to-right in Sage.

**Right:** Language Selector pill, dark-mode toggle (☀️/🌙), `Log In` (transparent), `Sign Up` (Charcoal-filled, white text) — or `Open Dashboard` if the user is already set up. **Note:** these header CTAs use a 10px corner radius and Charcoal/white — NOT the Sage pill used on the hero CTA. The header is a tighter, more functional treatment.

## Language Selector (v1.5 — 12 languages)

A pill button labelled "English" by default, opens a dropdown of **12 supported languages** (11 Indian + German). Each row shows the English label on the left and the native script on the right in muted color.

```
English    English      Hindi        हिन्दी      Punjabi     ਪੰਜਾਬੀ
Gujarati   ગુજરાતી        Marathi      मराठी      Bengali     বাংলা
Tamil      தமிழ்         Kannada      ಕನ್ನಡ       Telugu      తెలుగు
Malayalam  മലയാളം       Urdu         اردو       German      Deutsch
```

Backed by Google Translate widget. The brand name "Our Pregnancy" is marked `.notranslate` and will NOT be translated. When a non-English language is selected, the body content is auto-translated client-side.

## Variant A — the shipped one (verbatim, v1.5)

```
H1         Your pregnancy companion — secure & synced.
            (note: "secure & synced" is italic Sage #8AB6A3; H1 wraps naturally)
SUBTITLE   Track symptoms, count kicks, pack your hospital bag, and monitor
           blood pressure. Core features free. AI tools coming soon.
            (note: "Core features free. AI tools coming soon." is bold Charcoal;
             this line still ships as-is because the pricing tier reinforces
             the free entry point rather than promising "everything free.")
CTA 1      Go to Dashboard  (returning users)  |  Start Tracking (new users)
                                                (Sage pill, 32px radius, ArrowRight icon)
CTA LINK   See how it works ↓
```

**Right side (hero visual — replaced June 2026):** The v1.3 "3 nested organic blob rings + baby orb" is gone. New visual: a **soft cream disc** (~360px, Sandalwood pale, subtle inner shadow) centered inside a light Sage aura, with **the pink lotus logo centered inside the disc**. **Two orbiting rings** of Soft Saffron dots + arc segments circle the disc (one at ~15s clockwise, one at ~20s counter-clockwise). Small heart glyph accents in Blush at ring corners. Much cleaner + more focused than the v1.3 version. Do NOT replicate the womb tableau on social or deck assets — it's tuned for the live web hero only.

**Right side (hero visual — new May 2026):** A "womb / growth" animated tableau:
- Ambient Sage-pale glow at 80% opacity, blur 100px, pulsing at 4s.
- 3 nested organic blob shapes (using custom `border-radius` like `60% 40% 30% 70% / 60% 30% 70% 40%`) — Sage at 30%, Blush at 40%, Gold at 30%.
- Each rotates at a different speed: 25s linear infinite (outer), 20s reverse (middle), 15s (inner).
- A single Lotus Pink → blush-light glowing orb sits on the inner ring representing the baby, with a soft `box-shadow` glow and a 2s pulse.

This is the brand's most ambient marketing visual. Do NOT replicate the womb tableau on social or deck assets — it's tuned for the live web experience only.

## Variant B — privacy + security emphasis

```
EYEBROW    Cloud Sync · Encrypted
H1         Your pregnancy. Synced everywhere it needs to be.
SUBTITLE   Track kicks, contractions, vitals, and the hospital bag list —
           securely synced across your devices and accessible only by you.
CTA 1      Start tracking
CTA 2      How privacy works
LINK       See features ↓
```

## Variant C — Indian-context emphasis

```
EYEBROW    🇮🇳 Made for Indian mothers
H1         A pregnancy companion that knows ragi, JSY, and your due date.
SUBTITLE   Pregnancy tracker built around Indian foods, government schemes,
           and 108 emergency contacts. Core features always free.
CTA 1      Start tracking
CTA 2      Browse features
LINK       See how it works ↓
```

---

## Trust bar — verbatim from live site (v1.5)

Four chips, single row, sage icons on a white strip with Charcoal text. Always in this exact order:

```
📍  Made for expectant mothers
🛡  Your data is private & secure
✓  Core features are free
📡  Works offline via PWA
```

**Change from v1.3:** the first chip was previously "Made for Indian mothers 🇮🇳". As of June 2026 it reads "Made for expectant mothers" — no country flag, no "Indian". Indian context stays central to the *feature depth* (Foods Database, government schemes, 108/112 helplines) but the top-of-page audience framing broadened.

(The icon column maps to: `MapPin`, `ShieldCheck`, `CheckCircle`/`IndianRupee`, `WifiOff` from `lucide-react`.)

---

## "How it works" — 4-step section (verbatim from live site)

```
Step 1 — Quick Setup
Enter your due date. No account required to start tracking.

Step 2 — Track Daily
Log vitals, kick counts, and contractions right on your phone.

Step 3 — Prepare
Build your hospital bag checklist and track symptoms.

Step 4 — Sync & Share
Securely sync to the cloud or share progress with your partner.
```

The lead under "How Our Pregnancy Works":
> A seamless, private journey from your first trimester to delivery day.

---

## "Comprehensive Toolkit" — features bento grid (verbatim)

### Section header
```
EYEBROW    ✨ COMPREHENSIVE TOOLKIT
H2         Everything you need,
           beautifully organized.
```

### Hero feature card — AI Food Safety Scanner (2 col)
```
ICON       Camera
TITLE      AI Food Safety Scanner
BODY       Not sure if that street food or local fruit is safe during
           pregnancy? Snap a picture and let our Gemini-powered AI verify
           it against Indian food safety guidelines instantly.
BULLET 1   ✓ Detects harmful ingredients
BULLET 2   ✓ Tailored for Indian cuisine
VISUAL     /food_scanner_updated_1779026987896.png (Indian thali with AI overlay)
```

### Hero feature card — Real-Time Partner Sync (1 col)
```
ICON       Cloud
TITLE      Real-Time Partner Sync
BODY       Enjoy secure storage in the cloud. Securely link devices via
           WebRTC to share the journey with your partner while maintaining
           granular privacy controls.
PILL 1     Sync Mode → Encrypted (white text on Sage)
PILL 2     Cloud Storage → Secure (white text on Charcoal)
```

### Small feature cards (9 total)

```
1.  Labor Readiness Score
    Predictive biometrics analyzing your HRV, RHR, and Braxton Hicks frequency.
    Icon: Activity · Tile: Blush

2.  FHIR R4 EHR Export
    Instantly export your entire care plan and vitals to major hospital
    systems like Epic.
    Icon: Stethoscope · Tile: Gold

3.  Bloom AI 24/7                    ← rebranded June 2026 (was "Ask Bloom 24/7")
    Get immediate answers to your pregnancy questions with our fine-tuned
    AI companion.
    Icon: Bot · Tile: Sage

4.  Vitals Tracker
    Log blood pressure with preeclampsia threshold alerts.
    Icon: Heart · Tile: Sage

5.  Kick Counter
    Count fetal movements daily from 28 weeks with auto-alerts if count is low.
    Icon: Activity · Tile: Blush

6.  Multiple Checklists
    Prepare essentials for delivery day with our curated hospital bag lists.
    Icon: CheckCircle2 · Tile: Gold

7.  Contraction Timer
    Time contractions and get the 5-1-1 hospital rule calculated automatically.
    Icon: Timer · Tile: Sage

8.  Pregnancy Timeline
    Track weekly changes, milestones, and what to expect along your journey.
    Icon: Calendar · Tile: Blush

9.  Calm/Dark Mode
    Soothing dark mode for tracking during those 3 AM wake-ups.
    Icon: Moon · Tile: Charcoal (white icon on dark tile)
```

---

## "Made for expectant mothers" — localized section (verbatim, v1.5)

This section ships on a full-bleed **Sage `#8AB6A3` background with white type** — the only marketing surface where the brand inverts to Sage. Cards on top are white-on-Sage with rotation-on-hover micro-animation.

```
EYEBROW (white pill on Sage)    LOCALIZED CARE
H2                               Made for expectant mothers
LEAD                             Because pregnancy means navigating local foods,
                                 government schemes, and unique cultural contexts.
                                 We've got you covered.

CARD 1
🥗 (Sage-pale tile, rotated 3°)
TITLE       Foods Database                        ← "Indian" dropped from title
BODY        Know exactly what's safe. Comprehensive coverage for dal, ragi,
            paneer, amla, and accurate risk flags for items like raw papaya
            or street food.                       ← Indian nouns kept in body

CARD 2
🏥 (Blush-pale tile, rotated -3°)
TITLE       Govt Scheme Guide
BODY        Don't miss out on important benefits. Clear, actionable
            guides for JSY, PMMVY (₹5,000 cash assistance), and JSSK
            (hospital delivery).

CARD 3
📞 (Gold-pale tile, rotated 3°)
TITLE       Emergency Ready
BODY        Critical helplines at your fingertips. 108 Ambulance, 112
            National Emergency, and iCall psychosocial support — always
            one tap away.
```

**What changed from v1.3:**
- Section H2 dropped "Indian" and the 🇮🇳 flag → now "Made for expectant mothers"
- Lead sentence dropped "in India" → generic "pregnancy means navigating…"
- Card 1 title dropped "Indian" → "Foods Database" (body copy retains dal/ragi/paneer)
- Indian scheme names, helplines, and cash amounts stay verbatim in card bodies — the depth stays; the headline broadens

---

## "Simple, Transparent Pricing" — 3-tier pricing section (new June 2026, v1.5)

```
EYEBROW (Sage-pale pill)     PACKAGES
H2                            Simple, Transparent Pricing
LEAD                          Choose the package that fits your pregnancy
                              journey. No hidden fees or contracts.
```

Three pricing cards, equal width, on Sandalwood. The middle card is **highlighted with a "MOST POPULAR" pill floating above** and a light Sage-pale border.

### Free Plan — ₹0/month
```
OVERLINE (small caps)   STARTER
TITLE                   Free Plan
PRICE                   ₹0 / 1 month
SUB                     Always free for moms

DURATION SLIDER         1m ─ 3m ─ 6m ─ 9m ─ 12m       [1 Month pill, Sage-pale]

BODY                    Essential tracking tools for everyday updates,
                        completely free.

FEATURES (Sage checkmarks)
✓  Basic pregnancy weekly tracker
✓  Daily symptom logs & timeline
✓  Kick counter & contraction timer
✓  Hospital bag checklist
✓  Offline-first sync capabilities

CTA (outline, Sage)     Start Tracking Free
```

### Standard Plan — ₹199/month · MOST POPULAR
```
FLOATING PILL           MOST POPULAR                  [Sage-pale on Sage border]
OVERLINE (small caps)   MATERNAL CARE PACK
TITLE                   Standard Plan
PRICE                   ₹199 / 1 month

DURATION SLIDER         1m ─ 3m ─ 6m ─ 9m ─ 12m       [1 Month pill, Sage]

BODY                    Comprehensive tracking with complete medical
                        guides & postpartum care.

FEATURES (Sage checkmarks)
✓  Everything in Free starter plan
✓  Complete Medical tasks & vaccines tracker
✓  Detailed Government Schemes guide
✓  Postpartum & Early Parenthood support
✓  Encrypted real-time Partner Sync

CTA (filled, Sage)      Upgrade to Standard
```

### Premium Plan — ₹499/month
```
OVERLINE (small caps)   AI ULTIMATE
TITLE                   Premium Plan
PRICE                   ₹499 / 1 month

DURATION SLIDER         1m ─ 3m ─ 6m ─ 9m ─ 12m       [1 Month pill, Saffron-pale]

BODY                    Full access to advanced AI support tools &
                        clinical report exports.

FEATURES (Saffron checkmarks)
✓  Everything in Standard plan
✓  Bloom AI prenatal chatbot support 24/7
✓  Gemini-powered AI Food Safety Scanner
✓  FHIR R4 EHR Doctor Report Exports
✓  Priority feature request channel

CTA (filled, Charcoal)  Go Premium
```

**Overline colors:**
- Free / Starter: Sage
- Standard / Maternal Care Pack: Sage
- Premium / AI Ultimate: Saffron

Below the pricing grid, a **thin dotted separator with "PRIVACY" overline**, then the reinforcing H2 section:

---

## "Core features, always free" — reinforcement CTA (still shipping under pricing)

```
H2     Core features, always free.
SUB    We believe every mother deserves access to tools that make
       pregnancy safer and less stressful. Tracking, vitals, tasks,
       and more — free, always.
CTA    Start Tracking Now                                (Sage pill)
```

This section still ships as a **reinforcement** to the Free Plan card above — it's not the primary pricing story anymore, but it emphasizes that the entry point remains free even though there are paid tiers.

---

## Testimonials — 6 cards (verbatim, ordered)

Live homepage shows all 6 in a symmetric 3-col grid (2 rows). The full set:

```
1. "I love how personal it feels — everything is tailored to my
   pregnancy week and my situation."
   — Priya M., Mumbai

2. "The kick counter works perfectly. Simple, fast, exactly what I
   needed when my doctor asked me to track."
   — Kavitha R., Bangalore

3. "The core features are free and work even when I'm travelling.
   Such a blessing!"
   — Anjali S., Delhi

4. "The AI food scanner saved me so much anxiety during my babymoon
   in Goa. Highly recommend!"
   — Sneha P., Goa

5. "Finally an app that understands Indian contexts and government
   schemes."
   — Divya K., Chennai

6. "The vaccination reminders and daily tips kept me so reassured.
   A must-have for every expectant mom!"
   — Meera J., Pune
```

Card style: cream background, sage open-quote in upper-right at 20% opacity, Charcoal italic quote, Sage-light circle avatar with single letter, name + city below in small Charcoal/Medium. Cards use `flex flex-col justify-between h-full` so all cards in a row line up symmetrically regardless of quote length.

---

## Footer copy (verbatim)

Footer is the **only** marketing surface that uses a full-bleed **Deep Charcoal `#2C3E50` background with light text** — the dark anchor that closes the page.

```
LOGO ROW     [lotus] Our Pregnancy (Sage serif, 24px tracking)
CAPTION      Made with 🤍 for expectant mothers    ← changed June 2026 (was "for Indian mothers")

LINKS        Privacy Policy  ·  Terms of Service  ·  hello@ourpregnancy.in

BOTTOM       🔒 Your data is encrypted and only accessible by you.
```

---

## Modal — Email login / signup (the only modal on the landing)

When a user clicks "Sign Up with Email", an overlay modal opens.

```
H2 (signup)   Create your account
H2 (login)    Welcome back

FIELDS        (signup only) Full name
              Email address
              Password
              (signup only) Confirm password

CTA (signup)  Sign up
CTA (login)   Log in

SWITCH        Already have an account? Log in
              Don't have an account? Sign up

FORGOT        Forgot password?
RESET H2      Reset password
RESET BODY    Enter your email and we'll send you a link to reset your
              password.
RESET CTA     Send reset link
```

Error copy uses the warm recovery style (see `voice/examples.md` → Errors).

---

## A note about the title tag

The `<title>` element in `index.html` still reads:
> **Our Pregnancy — Your Free Pregnancy Companion**

…but the visible H1 dropped "Free" in commit `8d70c3d`. The title tag still works for SEO (the search keyword "free pregnancy companion India" matches what users search for), but the on-page voice no longer leads with "free." This is intentional — the brand still *is* free for core features, it just doesn't promise the world.

If we ever revisit the title, recommended replacement:
> **Our Pregnancy — A pregnancy companion for Indian mothers**
