# Canonical Welcome Email Template — Our Pregnancy (OPIN)

> **Status:** Final & Canonical  
> **Source Module:** [`functions/src/templates/welcomeEmail.ts`](../functions/src/templates/welcomeEmail.ts)  
> **Trigger Points:**
> 1. Completed 6-digit OTP verification (`verifyOtp`)
> 2. Google Sign-In / OAuth completion (`triggerWelcomeEmailIfNew`)

---

## 1. Email Metadata

| Field | Value |
| :--- | :--- |
| **Subject** | `A personal note from the team behind Our Pregnancy` |
| **From Name** | `Our Pregnancy Team` |
| **Sender Mailbox** | `sukrat.kaushik@gmail.com` (authenticated via Gmail SMTP) |
| **Reply-To** | `hello@ourpregnancy.in` |
| **CTA Destination** | `https://ourpregnancy.in/dashboard` |

---

## 2. Full Copy

**From:** `Our Pregnancy Team`  
**Reply-To:** `hello@ourpregnancy.in`  
**Subject:** `A personal note from the team behind Our Pregnancy`  

Hi [Name],

First of all — **congratulations**. Carrying life is a truly extraordinary journey.

I wanted to send a quick personal note to welcome you to Our Pregnancy and share a little bit about why we built this.

Pregnancy brings so many new feelings, questions, and decisions. We created Our Pregnancy to give expectant parents a calm, reliable companion with science-backed guidance, helpful medical tools, and compassionate support every step of the way.

To help you experience everything Our Pregnancy has to offer, you can use code **OPIN30** at checkout to unlock full Premium features for your first 30 days.

Whether this is your very first week or you are entering your final trimester: we are honored to walk beside you.

**Three simple things you can try today:**
1. **Ask Bloom AI** any pregnancy or symptom question on your mind for gentle, instant guidance.
2. **Check your daily timeline** to see how your baby is developing today.
3. **Explore the dashboard** and tools designed to make your journey smoother.

[ **Open my dashboard** ] (`https://ourpregnancy.in/dashboard`)

If you ever have any questions, suggestions, or need assistance, please visit the **Feedback & Support** section in your app footer — our team reviews every message.

Wishing you and your little one radiant health and happiness,

**Our Pregnancy Team**  
[ourpregnancy.in](https://ourpregnancy.in)

---
*Our Pregnancy · Made with 🤍 for expectant mothers*  
*© 2026 Our Pregnancy. Dedicated to maternal care.*

---

## 3. Brand & Content Compliance Rules

1. **No Absolute Claims**: Never use claims like *"a private, ad-free, Zero Advertisements"* or mention data selling or trackers in email communication.
2. **Path-Based URLs**: All navigation URLs use path-based routing (e.g. `https://ourpregnancy.in/dashboard`), never legacy `#` hash anchors.
3. **Feedback Channel**: Always direct users to the **Feedback & Support** section in the app footer.
4. **Canonical Logo**: Uses `https://ourpregnancy.in/logo.png` (never re-generate or overwrite logos).
