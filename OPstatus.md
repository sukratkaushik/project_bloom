# Our Pregnancy (OP) - Project Status Log

This file tracks the ongoing development, bug fixes, and deployment tasks for the Project Bloom / Our Pregnancy application.

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
    *   **Cleaned Sidebar Utilities (`Sidebar.tsx`):** Removed the toggle switch from desktop & mobile drawers, streamlining the utilities group to Export Care Plan PDF and Log Out.
    *   **Restored Educational Banners & Advisory Notes:** All milestone countdowns, medical tags, and health recommendations render naturally across all 15 feature modules.

### **Task 4: AI Vision Multi-Subject & Non-Food Detection**
*   **Details:**
    *   **Food Scanner Vision AI (`functions/src/index.ts`, `FoodScanner.tsx`):** Upgraded the `analyzeFood` Cloud Function to validate whether an uploaded image contains food or non-food objects.
    *   **Comprehensive Subject Recognition:** Correctly detects children/people, animals/pets, vehicles/automobiles, electronic devices, household objects, and scenery.
    *   **Graceful UI Notification:** Prevents displaying false "Looks safe for pregnancy" badges or empty nutrient tables for non-food images, showing a polite and clear non-food notification instead.

### **Task 5: Bloom AI 3rd Trimester Comprehension & Clean Path Routing**
*   **Details:**
    *   **Classifier Gate Fix (`pregnancyClassifier.ts`):** Removed brittle client-side substring gating that falsely rejected valid prenatal questions (e.g. 8th month travel queries).
    *   **Clinical Prompt Refinement:** Updated `chatWithAI` system instructions to ground answers in ACOG/WHO travel guidelines without dumping repetitive disclaimers.
    *   **Clean Path URL Navigation (`src/utils/navigation.ts`, `App.tsx`, `Dashboard.tsx`):** Migrated from hash routing (`/#dashboard/feature`) to modern clean HTML5 paths (`/dashboard/feature`, `/privacy`, etc.) with full browser history support.

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
