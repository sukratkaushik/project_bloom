# Our Pregnancy (OP) - Project Status Log

This file tracks the ongoing development, bug fixes, and deployment tasks for the Project Bloom / Our Pregnancy application.

## 📅 2026-08-30

### **Task: Brand Design System Alignment for Email Communications**
*   **Details:**
    *   **Audit against `Project_Bloom_Design`:** Audited transactional email templates against `/Users/D067208/gitclones/Project_Bloom_Design/BloomDesign/design-system/applications/email.md` and `BRAND-SUMMARY.md`.
    *   **Canonical Lotus Logo Header:** Embedded the canonical high-resolution Our Pregnancy lotus logo (`https://ourpregnancy.in/logo.png`) centered at 48×48px with serif brand title and tagline, replacing raw Unicode emojis (`🌸`) and solid harsh green banners.
    *   **Typography & Color System:** Applied Playfair Display (Georgia fallback) for sentence-case headings and Nunito (Helvetica/Arial fallback) for body copy. Standardized text colors to Deep Charcoal (`#2C3E50`) and Medium (`#6B7A87`) on Sandalwood (`#FDFBF7`) background.
    *   **Tulsi Mint OTP Box:** Redesigned the 6-digit verification code container with Tulsi Mint Pale background (`#E9F5E9`), 2px dashed Sage border (`#8AB6A3`), and monospace typography with 12px letter spacing.
    *   **Sage Pill CTA Button:** Styled the plan upgrade call-to-action as a full pill button with Sage background (`#8AB6A3`), white bold text, and subtle warm shadow.
    *   **Deliverability & Subject Lines:** Shortened subject lines to conform with the 50-character mobile client cutoff.

---

## 📅 2026-08-27

### **Task 1: Government Schemes State & National Multi-Tier Filter**
*   **Details:**
    *   **State & National Dropdown (`GovernmentSchemes.tsx`):** Added a dropdown selector featuring `National (All India)` and all 33 Indian States/UTs.
    *   **Scope Filtering Engine:** When selecting a specific state (e.g. Tamil Nadu, Telangana, Karnataka, Maharashtra, UP, Rajasthan, Odisha, WB, Bihar, MP, Gujarat, etc.), displays the state-specific schemes alongside Central Government schemes. When "National" is selected, filters strictly to all-India Central schemes.
    *   **Priority Sort for State Schemes:** State-specific schemes are sorted and placed at the top of the grid above Central schemes for maximum visibility.
    *   **Rich State Schemes Database:** Added detailed benefits, eligibility criteria, and application steps for major state maternity benefits (Dr. Muthulakshmi Reddy, KCR Kit, MAMATA, Mathru Poorna, Kanya Sumangala, IGMPY, Ladli Laxmi, etc.).
    *   **User Persistence:** Stores the user's selected state in `localStorage` so their region remains saved.

### **Task 2: Professional 2-Tier Streamlined Footer**
*   **Details:**
    *   **Redesigned Layout (`src/components/Footer.tsx`):** Designed a balanced 2-tier footer card matching the exact dimensions, borders, and margins of the header.
    *   **Clean Typography & No Icons:** Removed all emoji clutter from feature links (*Adjust Setup, Settings & Profile, Feedback & Support, Admin Suite*).
    *   **Organized Hierarchy:**
        *   **Top Tier:** Features the app logo, bold serif brand title `Our Pregnancy`, tagline `"Made with ❤️ for expectant mothers"`, and primary navigation links.
        *   **Bottom Tier:** Features copyright text on the left and clean dot-separated legal links (*Privacy Policy • Terms of Service • Support*) on the right.

### **Task 3: Calm Mode Clean Removal & UI De-cluttering**
*   **Details:**
    *   **Eliminated Redundant Calm Mode:** Completely removed Calm Mode state, toggles, CSS overrides, and conditional gating across the entire application.
    *   **Always Visible Milestone Timeline (`Header.tsx`):** The header now consistently renders LMP, T1 End, T2 End, Due Date, and gestational progress percentage without awkward replacement quotes.
    *   **Restored Educational Banners & Advisory Notes:** All milestone countdowns, medical tags, and health recommendations render naturally across all 15 feature modules.

### **Task 4: Consistent Sidebar GUI & Action Button Harmonization**
*   **Details:**
    *   **Matched Button Design (`Sidebar.tsx`):** Harmonized `Export Care Plan PDF` and `Log Out` to share the exact same typography (`font-sans text-[13px] font-medium`), padding (`py-2.5 px-3.5`), border styling (`border border-border/80`), rounded corners (`rounded-[10px]`), elevation, and layout.
    *   **Mobile Drawer Parity:** Standardized all action buttons across both desktop and mobile navigation drawers.

### **Task 5: Information Architecture & Navigation Restructuring**
*   **Details:**
    *   **Eliminated Single-Child "Overview" Header (`Sidebar.tsx`):** Removed the redundant `OVERVIEW` uppercase header.
    *   **Primary Hub "My Journey" (`Sidebar.tsx`, `PregnancyTracker.tsx`):** Pinned `🌸 My Journey` as the primary home anchor at the top of the sidebar.
    *   **Renamed Category to "Daily Logs" (`Sidebar.tsx`):** Renamed the second group from `Tracking` to `Daily Logs` to eliminate the semantic collision with `Tracker`.
    *   **100% Backward Compatible:** Retained internal route ID `tracker` so all deep links, active state bindings, and local storage data remain fully intact.

### **Task 6: Typography System Modernization (Inter + Playfair Display)**
*   **Details:**
    *   **Elevated Inter to Primary UI Sans (`index.html`, `index.css`):** Replaced casual rounded `Nunito` with crisp, modern, authoritative `Inter` across all UI controls, body copy, navigation, buttons, forms, and tables.
    *   **Pruned Unused Font Assets:** Removed dead `Lexend` and `Nunito` network font imports (~120KB performance saving).
    *   **Locked Monospace Tabular Figures:** Added `JetBrains Mono` for jitter-free contraction timers, kick counters, and countdown clocks.
    *   **100% Backward Compatible:** Fully preserves all CSS variables (`--font-serif`, `--font-sans`, `--font-mono`) without altering any component structure or layout dimensions.

### **Task 7: Top Promo Ribbon Marquee Velocity Adjustment**
*   **Details:**
    *   **Gentle & Readable Velocity (`src/index.css`):** Relaxed the top promotional ribbon marquee animation duration from `30s` to `70s`.
    *   **Comfortable Reading Speed:** Enables users to easily read offer details and coupon codes without rushed visual motion, while maintaining hover-to-pause functionality.

### **Task 8: OPIN30 & VIPCARE90 Free Access Promo Passes**
*   **Details:**
    *   **30-Day Free Pass (`OPIN30`):** Grants 30 Days (1 Month) of Premium AI tools for 100% free with instant activation.
    *   **90-Day VIP Trimester Pass (`VIPCARE90`):** Grants 90 Days (3 Months) of full Premium AI access for 100% free (reserved for confidential partner/doctor distribution).
    *   **Zero-Friction Gateway Bypass (`CheckoutPage.tsx`):** When a promo code covers 100% of the cost (`finalPrice === 0`), users can activate their trial with 1 click without entering payment card details or triggering gateway failures.
    *   **Public Top Ribbon Focus (`PromoBanner.tsx`):** Focuses the public marquee ribbon cleanly on `OPIN30` (30 Days Free) to avoid broadcasting the VIP partner code to general traffic.
    *   **100% Backward Compatible:** Retained legacy codes (`BLOOM30`, `BLOOM50`, `WELCOME10`) without breaking existing links or database subscriptions.

### **Task 9: AI Vision Multi-Subject & Non-Food Detection**
*   **Details:**
    *   **Food Scanner Vision AI (`functions/src/index.ts`, `FoodScanner.tsx`):** Upgraded the `analyzeFood` Cloud Function to validate whether an uploaded image contains food or non-food objects.
    *   **Comprehensive Subject Recognition:** Correctly detects children/people, animals/pets, vehicles/automobiles, electronic devices, household objects, and scenery.
    *   **Graceful UI Notification:** Prevents displaying false "Looks safe for pregnancy" badges or empty nutrient tables for non-food images, showing a polite and clear non-food notification instead.

### **Task 10: Bloom AI 3rd Trimester Comprehension & Clean Path Routing**
*   **Details:**
    *   **Classifier Gate Fix (`pregnancyClassifier.ts`):** Removed brittle client-side substring gating that falsely rejected valid prenatal questions (e.g. 8th month travel queries).
    *   **Clinical Prompt Refinement:** Updated `chatWithAI` system instructions to ground answers in ACOG/WHO travel guidelines without dumping repetitive disclaimers.
    *   **Clean Path URL Navigation (`src/utils/navigation.ts`, `App.tsx`, `Dashboard.tsx`):** Migrated from hash routing (`/#dashboard/feature`) to modern clean HTML5 paths (`/dashboard/feature`, `/privacy`, etc.) with full browser history support.

### **Task 11: Mandatory Email Verification Link Enforcement**
*   **Details:**
    *   **Mandatory Activation on SignUp (`src/firebase.ts`, `LandingPage.tsx`):** When a user registers via email/password, a verification link is dispatched immediately and the user is signed out (`await signOut(auth)`), blocking immediate access until verified.
    *   **Login Barrier for Unverified Accounts (`src/firebase.ts`):** In `signInWithEmail`, if `user.emailVerified === false`, the session is terminated immediately with an `auth/email-not-verified` error.
    *   **Dedicated Verification Screen (`LandingPage.tsx`):** After signing up, modal transitions to a comforting "Check your inbox 📬" view displaying their email and a "Resend verification link" action with live feedback.
    *   **One-Click Resend on Login (`LandingPage.tsx`):** If an unverified user tries to log in, a helpful alert offers an instant "Resend verification link" button.
    *   **Session Security Guard (`App.tsx`, `store.tsx`):** On auth state change, any unverified password account is purged from active memory to prevent bypassing verification on refresh.
    *   **Google Sign-In Unaffected:** Google OAuth users remain pre-verified by Google with zero friction or disruption.

### **Task 12: Admin User Auto-Sync & Permanent User Account/Data Deletion**
*   **Details:**
    *   **Instant Registration Visibility (`src/firebase.ts`):** During `signUpWithEmail`, user profile document is immediately written to Firestore `users/{uid}` with `role: 'user'`, `planTier: 'free'`, and `isSetup: false` so new accounts appear instantaneously in the Admin Suite.
    *   **Comprehensive Auth-Firestore Directory Sync (`functions/src/index.ts` `getAdminUsersList`):** Added a 2nd-gen Cloud Function that reconciles all accounts directly from Firebase Auth (`admin.auth().listUsers`) with Firestore user documents, automatically backfilling missing records and exposing `emailVerified` status to the admin.
    *   **Permanent User Deletion Engine (`functions/src/index.ts` `deleteUserByAdmin`):** Built a secure server-side deletion function that completely purges:
        1. Firebase Authentication login credentials (`admin.auth().deleteUser`).
        2. Firestore user profile document (`users/{uid}`).
        3. All pregnancy journeys and subcollection tracking records (kicks, vitals, daily logs, notes).
        4. All feedback records submitted by the user.
    *   **Admin Suite UI Actions (`AdminPanel.tsx`):**
        *   Added **Actions** column with a dedicated red Delete Trash icon.
        *   Added "Unverified" indicator badge for newly registered users pending verification.
        *   Added a confirmation dialog with full summary of wiped assets before proceeding with deletion.
        *   Protected the primary owner account (`sukrat.kaushik@gmail.com`) from accidental deletion.

### **Task 13: Zero-Trust Email Verification Route Gating & In-App Action Handler**
*   **Details:**
    *   **Protected Route Isolation (`App.tsx`):** Centralized all routing behind a zero-trust check (`isVerifiedUser`). Both `/dashboard/*` and `/setup` are completely inaccessible unless the user is actively authenticated AND has `emailVerified: true` (or is the verified owner).
    *   **Dedicated Verification Gate (`EmailVerificationGate.tsx`):** Unverified users attempting to access protected routes are blocked and shown an interactive verification gate with:
        *   Live **"Check Again"** status button (reloads user token from Firebase servers without requiring page reload).
        *   Instant **"Resend Verification Link"** action.
        *   Clean **"Sign Out / Switch Account"** option.
    *   **Elimination of State Bypass Loopholes (`App.tsx`, `LandingPage.tsx`, `store.tsx`):**
        *   Removed unconditional routing to `/dashboard` based on cached `state.isSetup` in localStorage.
        *   Guarded `hasStartedOnboarding` in `onAuthStateChanged` so unverified accounts never transition into the setup wizard.
        *   Gated the Landing Page "Go to Dashboard" button strictly to verified users (`isSetupComplete = state.isSetup && isVerified`).
    *   **Root-Cause Diagnosis for Link Error:** Explained Microsoft SafeLinks pre-fetch consumption causing the "link expired or already used" warning in corporate Outlook/SAP mailboxes.

### **Task 14: Universal 6-Digit Email OTP Verification System**
*   **Details:**
    *   **Elimination of Link-Based Auto-Detonation:** Replaced clickable action links with a 6-digit numeric OTP. Because email scanners (SafeLinks / Microsoft Defender / Proofpoint) only scan links via HTTP GET, they can never enter or auto-verify a 6-digit code.
    *   **Server-Side OTP Engine (`functions/src/index.ts`):**
        *   `sendVerificationOtp`: Generates cryptographic 6-digit OTP (`crypto.randomInt(100000, 999999)`), persists hashed/expiring record in `emailOtps/{email}` (10-minute TTL, 45s cooldown), and dispatches soothing Our Pregnancy branded email.
        *   `verifyOtp`: Validates code, rate-limits failed attempts (max 5), updates `emailVerified: true` in Firebase Authentication and Firestore `users/{uid}` via Admin SDK, and deletes redeemed OTP.
    *   **Interactive 6-Digit Input UI (`LandingPage.tsx`):**
        *   Direct modal transition to numeric security code input with auto-formatting, paste support, and real-time error/attempt feedback.
        *   Automatic seamless login and setup routing upon valid OTP submission.
        *   Coordinated resend button with live 45-second countdown timer.
    *   **Security & Gate Integration (`EmailVerificationGate.tsx`, `firestore.rules`):**
        *   Protected routes gate updated with native 6-digit code entry.
        *   Locked `emailOtps` collection in `firestore.rules` preventing any client read/write.

### **Task 15: Clean Checkout Coupon Box & Remove Promotional Code Leaks**
*   **Details:**
    *   **Removed Text Inside Coupon Input (`CheckoutPage.tsx`):** Removed the placeholder (`"e.g. OPIN30 or VIPCARE90"`) inside the "Have a coupon?" text box so it is clean and blank.
    *   **Removed Promo Code Leakage (`CheckoutPage.tsx`):** Removed the promo hint (`"💡 Hint: Enter OPIN30..."`) and sanitized invalid code error feedback from suggesting secret promotional codes (`"Invalid coupon code."`).

### **Task 16: Automated Founder Welcome Email (Concept 3)**
*   **Details:**
    *   **Automated Verification Trigger (`functions/src/index.ts`):** Wired `sendWelcomeFounderEmail` into `verifyOtp` so newly verified users automatically receive the personal Founder's Letter upon successful 6-digit OTP submission.
    *   **Production-Grade HTML Template:** Designed with Our Pregnancy's canonical lotus branding, Playfair Display / Nunito typography, Tulsi Mint (`#8AB6A3`) & Sandalwood palette, 5 core feature highlights, `OPIN30` 30-day free trial card, and encrypted health data trust seals.
    *   **Sender Configuration:** Configured to dispatch via `smtp.gmail.com:465` with Display Name `"Our Pregnancy Team"` <`sukrat.kaushik@gmail.com`> and Reply-To `hello@ourpregnancy.in`.
    *   **Deployment:** Compiled and deployed updated `verifyOtp` function to GCP `asia-south1`.

### **Task 17: Universal Welcome Email Trigger for Google Sign-In & All OAuth Users**
*   **Details:**
    *   **Root-Cause Resolution for Google Sign-In:** Google Sign-In accounts arrive with pre-verified emails (`emailVerified: true`), entirely bypassing the `verifyOtp` route.
    *   **Dedicated Cloud Function (`triggerWelcomeEmailIfNew`):** Created an idempotent backend Cloud Function that checks if `welcomeEmailSent` is already marked on `users/{uid}`. If not, it dispatches the Concept 3 Founder Welcome Email immediately and marks `welcomeEmailSent: true`.
    *   **Frontend Integration (`App.tsx`, `LandingPage.tsx`, `firebase.ts`):** Triggered upon Google login completion and in `onAuthStateChanged` for verified sessions.
    *   **Manual Delivery Confirmation:** Dispatched welcome email directly to `distantsolutions@gmail.com` (Message ID: `<e75cb3ed...>` ).
    *   **Deployment:** Deployed `triggerWelcomeEmailIfNew` and web assets to Firebase Hosting.

### **Task 18: Canonical Modular Welcome Email Template & Compliance Alignment**
*   **Details:**
    *   **Dedicated Template Module (`functions/src/templates/welcomeEmail.ts`):** Modularized the canonical welcome email into its own file with clean function `renderWelcomeEmailHtml(recipientFirstName)` and exported constants (`WELCOME_EMAIL_SUBJECT`, `WELCOME_EMAIL_SENDER_NAME = "Our Pregnancy Team"`, `WELCOME_EMAIL_REPLY_TO = "hello@ourpregnancy.in"`).
    *   **Removal of Absolute Claims:** Removed all claims of "a private, ad-free, Zero Advertisements", trackers, and data selling from all email templates and communications.
    *   **Path-Based URLs (No `#`):** Updated all dashboard destinations to `https://ourpregnancy.in/dashboard` across both welcome emails and plan change notification emails.
    *   **OPIN30 Placement:** Integrated the `OPIN30` 30-day free trial offer immediately following the opening vision paragraph.
    *   **Support Routing:** Directed customer feedback and inquiries to the **Feedback & Support** section in the app footer.
### **Task 19: Instant Free Promo Activation & Success Pop-Up Modal (`CheckoutPage.tsx`)**
*   **Details:**
    *   **Instant Activation on Apply:** When a user applies a 100% free pass coupon (`OPIN30`, `VIPCARE90`, `BLOOM30`), it immediately sets duration to the free period, updates Firestore subscription directly, and updates the local planner store without requiring manual navigation through the checkout flow.
    *   **Celebratory Success Pop-Up Modal:** Rendered a modern modal popup displaying celebration badges, promo code confirmation, unlocked features summary (Bloom AI, Food Scanner, EHR Exports), and an explicit **[ Go to Dashboard ]** button (`navigate('/dashboard')`).
### **Task 21: Audit & Correction of Government Scheme Weblinks (`GovernmentSchemes.tsx`)**
*   **Details:**
    *   **Fixed Kanyashree Prakalpa URL:** Corrected invalid URL (`wbkanyashree.gov.in`) to the live official portal `https://kanyashree.wb.gov.in`.
    *   **Audited & Updated State Scheme Links:**
        *   Telangana: Replaced deprecated `kcrkit.telangana.gov.in` with live `https://mchkit.telangana.gov.in`.
        *   Delhi: Replaced `edistrict.delhigovt.nic.in` with official `https://wcd.delhi.gov.in`.
        *   Bihar: Replaced timing-out `ekalyan.bih.nic.in` with live `https://medhasoft.bihar.gov.in/`.
        *   Kerala: Upgraded `socialsecuritymission.gov.in` from HTTP to HTTPS (`https://socialsecuritymission.gov.in`).
        *   Poshan Tracker: Updated redirect to `https://www.poshantracker.in`.
        *   Added verified official portals for West Bengal (`wbhealth.gov.in`), UP BOCW (`website.upbocw.in`), Rajasthan Jan Aadhaar (`janaadhaar.rajasthan.gov.in`), AP WDCW (`wdcw.ap.gov.in`), Karnataka DWCD (`dwcd.karnataka.gov.in`), MP Sambal (`sambal.mp.gov.in`), Gujarat Health (`gujhealth.gujarat.gov.in`), Assam NHM (`nhm.assam.gov.in`), Punjab NHM (`nhm.punjab.gov.in`), and Jharkhand JRHMS (`jrhms.jharkhand.gov.in`).

### **Task 22: Legal Rights & Workplace Protections for Pregnant Women (`GovernmentSchemes.tsx`)**
*   **Details:**
    *   **Placement & UI Integration:** Added a comprehensive legal benefits section directly below the "Official Central Government Portals" footer with matching brand typography (`font-serif` Playfair headers, `font-sans` Nunito body), brand color palette (`text-charcoal`, `bg-cream/40`, `border-border`, `text-sage`, `bg-sage-pale/25`), and responsive cards.
    *   **Core Statutory Benefits Covered:**
        1. 26 Weeks Fully Paid Maternity Leave (`Section 5(3)`, Maternity Benefit (Amendment) Act, 2017).
        2. Absolute Immunity from Dismissal or Termination (`Section 12`, Maternity Benefit Act, 1961) including Supreme Court precedent covering contract and temporary staff.
        3. Exemption from Heavy, Standing, or Hazardous Duties (`Section 4(3)`, Maternity Benefit Act, 1961).
        4. Mandatory Nursing Breaks & Crèche Access (`Section 11 & 11A`, Maternity Benefit Act, 2017).
        5. Paid Recovery Leave for Miscarriage or Complications (`Section 9 & 10`, Maternity Benefit Act, 1961).
        6. Universal Free Nutrition & Cash Grants (`Section 4`, National Food Security Act, 2013).
    *   **Structured Format:** For each benefit, clearly delineated: (a) *Benefit Provided by Government*, (b) *Key Protection* (highlighted in callout with shield icon), and (c) *Legal Source (hyperlinked)* linking directly to official government portals (`labour.gov.in`, `nfsa.gov.in`).

### **Task 23: Fix Legal Protections GUI & Dark Mode Polish (`GovernmentSchemes.tsx`)**
*   **Details:**
    *   **Fixed Squished Title & Badge Overlap:** Resolved the issue where card titles were wrapping character-by-character into 6 vertical lines because badges were placed side-by-side with long multi-word titles. Restructured the card header to a vertical stack with a top meta row (icon + category tag on left, status badge on right) and the title occupying 100% of the card width below it.
    *   **Comprehensive Dark Mode Styling:** Fixed low-contrast dark text on dark backgrounds (`dark:text-white`, `dark:text-gray-200`, `dark:text-gray-300`, `dark:bg-[#1E293B]`, `dark:bg-white/[0.03]`, `dark:border-white/10`).
    *   **Dark-Mode Harmonized Badges:** Updated all statutory badges to support both light and dark modes with proper background tints, readable text, and subtle borders.
    *   **Official Portals Dark Theme:** Styled the "Official Central Government Portals" footer card for full dark mode contrast.

### **Task 24: Single Box Per Row End-to-End Layout (`GovernmentSchemes.tsx`)**
*   **Details:**
    *   **Single Box Per Row:** Replaced the 2-column grid (`md:grid-cols-2`) with a full-width single-box-per-row layout (`flex flex-col gap-6`).
    *   **Full End-to-End Expansion:** Each legal benefit card now expands across 100% of the container width (`w-full`), giving maximum breathing room for titles, complete benefit explanations, callout boxes, and legal source citations without any horizontal truncation or squishing.

### **Task 25: Remove Redundant STATUTORY RIGHTS Badge & Subtitle (`GovernmentSchemes.tsx`)**
*   **Details:**
    *   **Removed Header Badge:** Removed the green `STATUTORY RIGHTS` badge from the top-right of the Legal Rights section header.
    *   **Eliminated Repetitive Words:** Removed the redundant `Statutory Entitlement` eyebrow from each card and adjusted the section subtitle to avoid word repetition, creating a cleaner, more streamlined header and card layout.

### **Task 26: Remove All Badge Pills from Legal Protection Cards (`GovernmentSchemes.tsx`)**
*   **Details:**
    *   **Removed Card Badges:** Removed all individual badge pills (`26 WEEKS PAID LEAVE`, `DISMISSAL IMMUNITY`, `SAFETY SAFEGUARD`, `CHILDCARE & NURSING`, `6 WEEKS RECOVERY`, `Universal Right`) from the legal protection card headers.
    *   **Clean Headline Alignment:** With the badge pills removed, the card headers now feature a minimalist, balanced layout consisting of the category icon paired directly with the full-width serif title.

### **Task 27: Remove Small Badge Pills from Maternity & Health Schemes Cards (`GovernmentSchemes.tsx`)**
*   **Details:**
    *   **Removed Scheme Header Badges:** Removed all small badge pills (`Central Govt`, `State Scheme`, `FREE SERVICE`, `₹5,000 CASH`, `₹1,400 CASH`, `100% FREE DELIVERY`, `UP TO ₹5 LAKH`, `FREE NUTRITION`, etc.) from the scheme cards in the "Maternity & Health Schemes" grid.
    *   **Polished Card Headers & Dark Mode:** Redesigned scheme card headers to feature a prominent icon paired directly with the scheme name in a clean, uncluttered layout with dark mode contrast classes applied.

### **Task 28: Single Box Per Row Layout for Pregnancy Food Guide (`NutritionTracker.tsx`)**
*   **Details:**
    *   **Full-Width Single Box Per Row:** Replaced the uneven 2-column grid with a stacked single-box-per-row layout (`flex flex-col gap-5`), giving each food safety tier (`AVOID`, `CAUTION`, `SAFE`) an end-to-end full-width box (`w-full`).
    *   **Responsive Multi-Column Food Grid:** Formatted food items inside each tier into a clean responsive multi-column grid (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5`) with polished item cards and full dark mode support, eliminating awkward whitespace.

### **Task 29: Dynamic Custom Topics & Details in Notes & Journal (`Notes.tsx`, `store.tsx`, `types.ts`, `pdfExport.ts`, `syncEngine.ts`)**
*   **Details:**
    *   **Add Custom Topics:** Users can now add custom journal topics with personalized titles and helper prompts directly within the Notes & Journal section.
    *   **Quick Inspiration Suggestions:** Provided one-click prefill chips for common pregnancy topics (e.g. Postpartum Meal Prep, Doula Queries, Pediatrician Checklist, Baby Registry Must-Haves, Sibling/Pet Prep, Work Leave).
    *   **Delete & Confirmation:** Allowed users to remove any custom topic with confirmation, safely cleaning up the stored notes.
    *   **State, PDF & Sync Integration:** Wired `customNoteTopics` into `PlannerState`, live peer-to-peer WebRTC Partner Sync, and PDF document generation.

---

## 📅 2026-07-05

### **Task: Premium Features & Vision Documentation**
*   **Details:**
    *   **Promo Banner & Checkout (`PromoBanner.tsx`, `CheckoutPage.tsx`):** Added a sliding announcement banner for the `BLOOM30` promotion and enabled promo code support in the checkout flow.
    *   **Product Vision (`PRODUCT_VISION.md`):** Added a comprehensive product vision document detailing the executive summary, feature scope, and business potential of the app.

---

## 📅 2026-06-28

### **Task 1: Repository Migration & Pregnancy Tracking Enhancements**
*   **Details:**
    *   **Repository Renaming:** The GitHub repository was successfully renamed to `https://github.com/sukratkaushik/project_bloom`.
    *   **Pregnancy Tracker Updates (`PregnancyTracker.tsx`, `weeklyData.ts`):** Fetched and deployed the latest comprehensive updates to the week-by-week pregnancy tracking data and UI components.
    *   **Dockerization (`Dockerfile`):** Added a new Dockerfile to the repository to support containerized environments.

### **Task 2: Payment Gateway & Checkout Flow Fixes (Razorpay)**
*   **Details:**
    *   **Razorpay Pop-up Fix (`functions/src/index.ts`):** Resolved an issue where the Razorpay checkout pop-up was failing to load by removing broken legacy validations from the backend.
    *   **Receipt Naming Optimization:** Optimized the receipt string generation logic in `createPaymentOrder` to adhere to Razorpay's 40-character limit constraint.
    *   **Checkout UI Unified (`CheckoutPage.tsx`, `Header.tsx`):** Created a new reusable `<Header />` component and applied it to the checkout page to fix the mismatched header issue and unify the layout.

---

## 📅 2026-05-20

### **Task: Partner Sync UI Polish**
*   **Details:**
    *   **Symmetric Column Layout (`PartnerSync.tsx`):** Restructured the "Generate Sync Code" and "Connect to Partner" columns using `flex flex-col` with `mt-auto` alignment. Added a matching placeholder input ("Code will appear here") on the left column so both buttons ("Start Hosting" / "Connect") render at the exact same vertical position.
    *   **Deployment:** Frontend deployed to Firebase Hosting.

---

## 📅 2026-05-19

### **Task 1: AskOurPregnancy AI Multimodal Integration & Backend Migration**
*   **Details:**
    *   **Secure Backend Proxy (`functions/src/index.ts`):** Transitioned the AI backend from an insecure client-side Gemini SDK to a highly secure Firebase Cloud Function (`chatWithAI`), proxying requests to a Qwen2.5-72B-Instruct model on Hugging Face.
    *   **Regional Optimization:** Migrated the cloud functions to `asia-south1` (Mumbai) to minimize latency for Indian users and reduce operational costs.
    *   **Native App Context Injection:** Rewrote the AI's System Instructions to enforce clinical constraints and explicitly instruct the AI to act as the built-in "AskOurPregnancy" assistant, preventing it from recommending competitor apps.
    *   **Document Parsing Service:** Implemented a new `parseDocument` Cloud Function using `pdf-parse@1.1.1` to process uploaded PDF documents on the backend securely.
    *   **Frontend Multimodal UI (`AskOurPregnancy.tsx`):** Added a paperclip attachment UI supporting `.pdf`, `.txt`, and `.md` files. Extracted text is invisibly injected into the AI context, allowing users to safely query clinical documents and diet plans.
    *   **Deployment:** Configured CORS and IAM policies ("Allow unauthenticated invocations") for all functions in Google Cloud Console. All code deployed successfully to Firebase Hosting and Functions.

### **Task 2: AI Food Scanner Migration**
*   **Details:**
    *   **New Cloud Function (`analyzeFood`):** Created a new 2nd Gen Cloud Function that uses the `Qwen/Qwen2.5-VL-72B-Instruct` Vision-Language model via Hugging Face to analyze food images server-side.
    *   **Frontend Migration (`FoodScanner.tsx`):** Removed the broken client-side `GoogleGenAI` SDK and rewired the component to call the secure `analyzeFood` function via `httpsCallable`.
    *   **Model Fix:** Initially deployed with `Qwen2.5-VL-7B` which wasn't available on the user's HF tier; switched to the `72B` variant to match the existing text model access.

### **Task 3: Baby Name Generator Migration**
*   **Details:**
    *   **Frontend Migration (`BabyNames.tsx`):** Removed the client-side `GoogleGenAI` SDK import and rewired the component to use the existing `chatWithAI` Cloud Function with a custom `systemPrompt` for JSON-only name generation.
    *   **Backend Enhancement (`chatWithAI`):** Made the function accept optional `systemPrompt` and `maxTokens` parameters from callers, allowing it to serve both the chatbot (medical prompt, 500 tokens) and the Name Generator (JSON prompt, 500 tokens). Previously hardcoded to 150 tokens.
    *   **Bundle Size Reduction:** Removing the `@google/genai` SDK from the frontend reduced the production bundle by ~273 KB.

### **Task 4: App Reload Fix**
*   **Details:**
    *   **Root Cause:** The app was visibly "reloading" 3-4 times on startup/login due to two issues: (1) A `key` prop on the main `<div>` in `App.tsx` that included `currentHash`, `isAuthReady`, and `splashFinished` — causing React to destroy and recreate the entire DOM tree on every state change, triggering repeated 700ms fade-in animations. (2) An `isRestoring` state flag in `store.tsx` that briefly forced the Splash Screen to re-appear during cloud data restoration.
    *   **Fix (`App.tsx`):** Removed the composite `key` prop so React can smoothly transition between components without full DOM unmounting.
    *   **Fix (`store.tsx`):** Removed all `isRestoring` state mutations so the auth flow completes without flashing the Splash Screen mid-login.

---

## 📅 2026-05-08

### **Task: Feature-by-Feature Refinement Phase**
*   **Details:**
    *   Entered a structured feature-by-feature development phase to polish each section of the dashboard individually.
    *   All code is deployed to `ourpregnancy.in` and pushed to GitHub (`main` branch).

---

## 📅 2026-05-07

### **Task 1: Database Integration & Cloud Sync Engine**
*   **Details:**
    *   **CloudSync Service (`src/cloudSync.ts`):** Developed a bidirectional synchronization engine using debounced batch writes to optimize Firestore quota.
    *   **Automated Sync Hooks (`src/db.ts`):** Integrated Dexie hooks to automatically queue local tracking data (Kicks, Vitals, Mood, Hydration, etc.) for background sync to Firestore.
    *   **Multi-Device Restoration:** Updated `store.tsx` to automatically pull down all historical `trackingData` subcollections when a user logs in on a new device.
    *   **Onboarding Persistence:** Implemented `saveUserProfile` and `getUserProfile` to persist the `isSetup` flag in Firestore, allowing returning users to bypass the setup wizard.
    *   **Data Privacy & Retention:** Implemented an automated 2-year data cleanup policy inside `CloudSync` and added a privacy notice to the `Profile.tsx` UI.
    *   **Security:** Created and deployed strict `firestore.rules` allowing only authenticated owners to read/write their data.
    *   **Testing:** Verified type safety (`tsc`) and ran a successful production build.

### **Task 2: Setup Page & Navigation Improvements**
*   **Details:**
    *   **Setup Page Rename:** Changed the onboarding wizard header from "Let's get started" to "Setup".
    *   **Adjust Setup Button (`Sidebar.tsx`):** Added a new "⚙️ Adjust Setup" button in the sidebar below the action buttons. Clicking it navigates the user to `#setup` to modify pregnancy parameters.
    *   **Pre-fill on Adjust:** Updated `SetupScreen.tsx` to pre-fill all form fields (due date, pregnancy number, work situation, diet, etc.) from existing state when the user returns to adjust.
    *   **Journey ID Preservation (`store.tsx`):** Modified `generatePlan` to reuse the existing `activeJourneyId` instead of generating a new UUID when adjusting setup, preventing data loss.

### **Task 3: Login/Logout Flow Fixes**
*   **Details:**
    *   **Logout Behavior (`Sidebar.tsx`, `SetupScreen.tsx`):** Ensured `resetPlan()` is called on logout so the Landing Page correctly shows the Google Sign-In button instead of "Open Dashboard".
    *   **Cloud Restore on Re-login (`store.tsx`):** Rewrote `restoreJourney()` to use the `UserProfile` document's `activeJourneyId` for a direct document lookup instead of an unindexed `orderBy('updatedAt')` query that was silently failing due to Firestore security rules. This fixed the bug where returning users were incorrectly routed to the Setup page instead of the Dashboard.
    *   **Redirect Handling (`LandingPage.tsx`):** The `handleRedirectResult` and `handleStart` flows correctly check cloud profile first, restoring the journey and routing to `#dashboard` on success.

### **Task 4: Auto-Save Refactor**
*   **Details:**
    *   **Removed "Save Progress" Button (`Sidebar.tsx`):** Eliminated the manual "💾 Save Progress" button and its associated toast notification from the sidebar.
    *   **Rationale:** The app already auto-saves all user interactions (task checkboxes, notes, vitals, counters, etc.) in real-time to both local Dexie DB and cloud Firestore via the state sync effect in `store.tsx`. The manual save button was misleading users into thinking they needed to press it to persist data.

---

## 📅 2026-05-05

### **Task: Custom Domain Setup & Google Auth Fixes**
*   **Details:**
    *   **Firebase Hosting (`firebase.json`):** Configured SPA rewrites and deployed the site to the custom domain `ourpregnancy.in`.
    *   **Authentication Branding:** Updated `authDomain` in Firebase config to reflect `ourpregnancy.in` on the Google Sign-In popup.
    *   **Auth Flow Robustness (`src/firebase.ts`):** Implemented a hybrid `signInWithPopup` / `signInWithRedirect` flow to fix issues with aggressive browser popup blockers.
    *   **PWA Fix (`vite.config.ts`):** Updated Service Worker `navigateFallbackDenylist` to prevent it from intercepting Firebase authentication redirects.
    *   **Landing Page UI:** Updated the landing page to dynamically show "Go to Dashboard" when an active session is detected.
    *   **Git Cleanup:** Excluded `.firebase/` cache files from version control.
