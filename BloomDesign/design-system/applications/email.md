# Email

Two kinds of email: **transactional** (signup, password reset, sync notice) and **newsletter** (monthly knowledge drop, big launches). Both follow the same visual system, different tones.

## Constraints — emails are not webpages

- **Width:** 600px max content, centered on a 100% Sandalwood `#FDFBF7` body background.
- **Tables for layout** — modern flex/grid doesn't render in many email clients. Use nested `<table>` with role="presentation".
- **Inline styles** — Gmail strips most `<style>` blocks. Inline every rule.
- **Web fonts may not load** — declare Playfair / Nunito but always fall back to `Georgia / Helvetica`.
- **Dark mode** — many email clients auto-invert. Test in Gmail dark mode, Outlook dark, Apple Mail dark.
- **No background images** that carry meaning — many clients block by default.

## Visual hierarchy

| Element | Spec |
|---|---|
| Outer table bg | Sandalwood `#FDFBF7` |
| Inner content table | 560px wide, white `#FFFFFF`, 16px radius (some clients drop this — fine) |
| Header | Logo lockup centered, 32px tall, 24px padding top/bottom |
| Pre-header | Hidden 0px height — sets the inbox preview text |
| Body | 16px Nunito (fallback Helvetica), 1.6 line-height, Charcoal `#2C3E50` |
| H1 | 28px Playfair (fallback Georgia), 1.3, sentence case |
| H2 | 22px Playfair, 1.35, sentence case |
| Button | Pill, Sage `#8AB6A3` bg, white text, 14px padding, 16px Nunito 600 |
| Footer | 13px Nunito, Medium `#6B7A87`, centered, with unsubscribe link |

## Transactional templates

### 1. Welcome

```
SUBJECT       Welcome 🌸
PREHEADER     A few things to know about Our Pregnancy

H1            Hi {{firstName}},
BODY          We're glad you're here. Your tracker is set to week {{week}} — and the next 9 months will move quickly.

              Here's what to try first:
              · Log your first vitals reading.
              · Browse the hospital bag checklist — most parents start it around week 28, but it never hurts to start early.
              · Have a look at the JSY / PMMVY guides if you haven't yet.

CTA           Open Our Pregnancy

OUTRO         If anything feels off or confusing, hit reply. A real person reads everything.

              With care,
              Sukrat & the Our Pregnancy team
```

### 2. Cloud sync confirmation

```
SUBJECT       Your data is now syncing
PREHEADER     A quick note about what just happened

H1            You're synced.
BODY          Cloud sync is on. Your tracking now stays consistent between your phone and the web — and your partner can join with the invite code below.

CODE BLOCK    XXXX-XXXX-XXXX

OUTRO         Your data is encrypted and only accessible by you. Cloud sync keeps an encrypted copy on our server as a backup. You can turn this off anytime in Settings.
```

### 3. Password reset

```
SUBJECT       Password reset — Our Pregnancy
PREHEADER     If you didn't request this, ignore this email.

H1            Reset your password
BODY          You asked to reset your Our Pregnancy password. Click the button below — the link works for the next 30 minutes.

CTA           Reset password

OUTRO         If you didn't ask for this, you can safely ignore this email. Nothing will change.
```

### 4. Low-kick alert (in-app + email summary)

```
SUBJECT       Just checking in on today's kick count
PREHEADER     If you've been feeling fewer movements, here's what to do.

H1            A small note
BODY          Your kick count today is lower than the usual range we'd expect at week {{week}}. This is often nothing — babies have quiet days. But it's worth a quick check.

              Try this:
              · Drink a cold glass of water.
              · Lie on your left side for 30 minutes.
              · Count kicks again. If still under 10 in 2 hours, call your OB or midwife.

CTA           Call my OB / midwife

DISCLAIMER    Our Pregnancy provides general guidance and cultural wisdom. Always consult your gynecologist or healthcare provider for medical advice.
```

## Newsletter — monthly

Title pattern: *This week's small things* or *Notes from week {{N}}*. Never *Our Pregnancy Monthly* (too corporate).

### Structure (4 sections max)

1. **Founder note** — 2–3 paragraphs. First-name signed.
2. **One knowledge tip** — short, with a source.
3. **One Indian-context tip** — food, scheme, festival timing.
4. **What we shipped** — bullets, with links.

### Voice rules

- First-name openers ("Hi Priya,").
- Plain text feel, even though it's HTML.
- One CTA max per email — usually "Try this feature" or "Read on the site."
- P.S. line at the bottom — a small extra thought ("P.S. We're at 1,247 users now. Thanks for spreading the word.").

## Subject lines

- Never ALL CAPS, never emoji-stuffed.
- Maximum 50 characters (Gmail truncates).
- One emoji at most, only if it earns its place (🌸 ✨ 🤍).
- A/B-test specificity vs. curiosity:
  - Specific: *Your week 12 check-in is here*
  - Curiosity: *A small note about today's kick count*

## Footer (every email)

```
You're getting this because you signed up at ourpregnancy.in.
Update preferences  ·  Unsubscribe
Our Pregnancy  ·  Made with 🤍 for Indian mothers
hello@ourpregnancy.in
```
