# Our Pregnancy (OP) - Project Status Log

This file tracks the ongoing development, bug fixes, and deployment tasks for the Project Bloom / Our Pregnancy application.

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
