# User Email Notification System — Project Bloom (Our Pregnancy)
**Context & Handoff Document for Future Session**
*Generated: 2026-08-29*
*Domain: [ourpregnancy.in](https://ourpregnancy.in)*

---

## 1. Overview & Business Goal

When an administrator upgrades, extends, or gifts a subscription tier (`standard` or `premium`) to an expectant mother via the **Admin Suite**, the system sends a warm, reassuring, branded email.

### Goal:
* Welcome the user to their upgraded experience.
* Encourage high feature engagement (e.g. 24/7 Bloom AI, Food Scanner, Medical EHR exports, Govt Schemes).
* Deliver a delightful, non-transactional tone (*"A gift for your pregnancy journey"*).

---

## 2. Key Decisions & Configuration Agreed Upon

| Setting | Approved Value |
| :--- | :--- |
| **Email Protocol / Service** | **Option A: Google Workspace / Gmail SMTP** (via `nodemailer`) |
| **SMTP Host & Port** | `smtp.gmail.com` on SSL Port `465` (secure: `true`) |
| **Display Name** | `Our Pregnancy Team` |
| **From Address** | `notifications@ourpregnancy.in` |
| **Reply-To Address** | `hello@ourpregnancy.in` |
| **Authentication Method** | Google 16-character **App Password** |

---

## 3. Email Template & Visual Branding

### Subject Line:
`🌸 A special gift for your pregnancy journey: You've been upgraded to Our Pregnancy [Standard / Premium]!`

### Visual Theme:
* **Primary Brand Accent**: Tulsi Mint (`#8AB6A3`)
* **Warm Brand Accent**: Soft Saffron / Gold (`#F4A261`)
* **Background**: Sandalwood Neutral (`#FDFBF7`)
* **Typography**: Clean serif header (Georgia/Playfair) with modern sans-serif body text (`-apple-system, Segoe UI, Roboto, Helvetica, Arial`).

### Key Unlocked Features Listed in the Email:
* 🤖 **24/7 Bloom AI Prenatal Guide** — Instant, comforting answers to any pregnancy question, symptom, or doubt.
* 🥗 **AI Food Safety Scanner** — Scan and check Indian & international foods, snacks, and ingredients for safety.
* 📋 **FHIR R4 Doctor EHR Medical Exports** — Formatted clinical summaries ready for OB-GYN visits.
* 🏛️ **Government Maternity Schemes Guide** — Step-by-step guidance on PMMVY, JSY, and financial benefits.
* 🌿 **Postpartum & Early Parenthood Recovery** — Guided recovery logs and daily newborn care checklists.
* 🤝 **Encrypted Partner Sync** — Real-time collaboration with partner on vitals and appointments.

### Primary Call to Action:
* **Button**: `✨ Open My Dashboard & Start Exploring`
* **Target URL**: `https://ourpregnancy.in/#dashboard`
* **Footer Note**: *"No credit card or payment required. This access is activated directly on your account."*

---

## 4. Current Codebase Implementation

The feature is already fully coded and deployed across the frontend and backend:

### 1. Backend Cloud Function
* **File**: `functions/src/index.ts`
* **Function**: `sendPlanChangeNotificationEmail` (Firebase 2nd Gen, region `asia-south1`)
* **Key Logic**:
  * Authenticates caller and verifies admin permissions (`sukrat.kaushik@gmail.com` or Firestore `users/{uid}.role === 'admin'`).
  * Validates inputs (`targetEmail`, `targetName`, `planTier`, `durationMonths`).
  * Fallback safety check:
    ```typescript
    const userVal = process.env.SMTP_USER || "notifications@ourpregnancy.in";
    const passVal = process.env.SMTP_PASS;

    if (!passVal) {
      console.warn("SMTP_PASS environment variable not yet configured. Skipping live SMTP dispatch.");
      return { success: false, message: "SMTP credentials not yet configured." };
    }
    ```
  * Transports mail using `nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user: userVal, pass: passVal } })`.

### 2. Frontend Client Helper
* **File**: `src/firebase.ts`
* **Function**: `sendPlanChangeEmail(targetEmail, targetName, planTier, durationMonths)`
* Invokes `httpsCallable(functions, 'sendPlanChangeNotificationEmail')`.

### 3. Admin Suite Trigger
* **File**: `src/components/sections/AdminPanel.tsx`
* Under the user subscription modal, there is a toggle:
  `[x] Send warm announcement email to user` (controlled by `sendEmailNotification` state).
* When clicking **Confirm Plan**, if toggled on, it automatically calls `sendPlanChangeEmail` and displays toast confirmation:
  `"Updated plan for [user] to PREMIUM & email notification sent!"`

---

## 5. Next Steps / How to Turn On Live Email Delivery

The only missing piece is setting the Google App Password so Google's SMTP server allows email dispatch.

### Step 1: Generate a Google App Password
1. Log into the Google Account that owns `notifications@ourpregnancy.in` or `sukrat.kaushik@gmail.com`.
2. Make sure **2-Step Verification** is enabled on the account.
3. Visit [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
4. Create a new App Name (e.g. `Our Pregnancy Mailer`).
5. Copy the generated **16-character password** (e.g. `xxxx yyyy zzzz wwww`).

### Step 2: Configure Firebase Secrets
In the terminal for `Project_Bloom`:
```bash
# 1. Set the SMTP User (if different from notifications@ourpregnancy.in)
firebase functions:secrets:set SMTP_USER

# 2. Set the 16-character App Password (without spaces)
firebase functions:secrets:set SMTP_PASS

# 3. Redeploy functions to bind the secret
firebase deploy --only functions
```

### Step 3: Verification Test
1. Open `https://ourpregnancy.in/#dashboard` and navigate to the **Admin Suite**.
2. Find your own account (`sukrat.kaushik@gmail.com`).
3. Select **Edit Subscription**, choose **Premium**, keep **"Send warm announcement email to user"** checked.
4. Click **Confirm Plan**.
5. Check your inbox for the warm branded email!
