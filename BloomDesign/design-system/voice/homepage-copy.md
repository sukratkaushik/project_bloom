# Homepage copy — drop-in variants

Three full sets of hero copy. Mix and match across A/B tests. All on-brand.

Last refreshed against live site on **2026-05-17** (commits up to `24a6d48`).

## Variant A — the shipped one (verbatim)

```
EYEBROW    New: Cloud Sync Available
H1         Your pregnancy companion — secure & synced.
            (note: "secure & synced" is italic Sage #8AB6A3)
SUBTITLE   Track symptoms, count kicks, pack your hospital bag, and monitor
           blood pressure. Core features free. AI tools coming soon.
            (note: "Core features free. AI tools coming soon." is bold Charcoal)
CTA 1      Start Tracking
CTA 2      Sign Up with Email
LINK       See how it works ↓
```

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

## Trust bar — verbatim from live site

Four pills, single row, sage icons on a white strip with Charcoal text. Always in this exact order:

```
🗺  Made for Indian mothers 🇮🇳
🛡  Your data is private & secure
₹  Core features are free
📡  Works offline via PWA
```

(The icon column maps to: `MapPin`, `ShieldCheck`, `IndianRupee`, `WifiOff` from `lucide-react`.)

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

3.  Ask Bloom 24/7
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

## "Made for Indian mothers 🇮🇳" — localized section (verbatim)

This section ships on a full-bleed **Sage `#8AB6A3` background with white type** — the only marketing surface where the brand inverts to Sage. Cards on top are white-on-Sage with rotation-on-hover micro-animation.

```
EYEBROW (white pill on Sage)    LOCALIZED CARE
H2                               Made for Indian mothers 🇮🇳
LEAD                             Because a pregnancy in India means navigating
                                 local foods, government schemes, and unique
                                 cultural contexts. We've got you covered.

CARD 1
🥗 (Sage-pale tile, rotated 3°)
TITLE       Indian Foods Database
BODY        Know exactly what's safe. Comprehensive coverage for dal, ragi,
            paneer, amla, and accurate risk flags for items like raw papaya
            or street food.

CARD 2
🏥 (Blush-pale tile, rotated -3°)
TITLE       Govt Scheme Guide
BODY        Don't miss out on free benefits. Clear, actionable guides for
            JSY, PMMVY (₹5,000 cash assistance), and JSSK (free hospital
            delivery).

CARD 3
📞 (Gold-pale tile, rotated 3°)
TITLE       Emergency Ready
BODY        Critical helplines at your fingertips. 108 Ambulance, 112
            National Emergency, and iCall psychosocial support — always
            one tap away.
```

---

## "Core features, always free" — pricing-style CTA (verbatim)

Replaced the earlier "No hidden costs. Completely Free." copy. New version is softer and honest.

```
H2     Core features, always free.
SUB    We believe every mother deserves access to tools that make
       pregnancy safer and less stressful. Tracking, vitals, tasks,
       and more — free, always.
CTA    Start Tracking Now
```

---

## Testimonials — 5 cards (verbatim, ordered)

Live homepage rotates 3 at a time. The full set:

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
```

Card style: cream background, sage open-quote in upper-right at 20% opacity, Charcoal italic quote, Sage-light circle avatar with single letter, name + city below in small Charcoal/Medium.

---

## Footer copy (verbatim)

Footer is the **only** marketing surface that uses a full-bleed **Deep Charcoal `#2C3E50` background with light text** — the dark anchor that closes the page.

```
LOGO ROW     [lotus] Our Pregnancy (Sage serif, 24px tracking)
CAPTION      Made with ❤️ for Indian mothers

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
