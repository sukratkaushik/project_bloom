# Our Pregnancy (OP) - Project Status Log

This file tracks the ongoing development, bug fixes, and deployment tasks for the Project Bloom / Our Pregnancy application.

---

## 📅 2026-05-07

### **Task: Database Integration & Cloud Sync Engine**
*   **Details:**
    *   **CloudSync Service (`src/cloudSync.ts`):** Developed a bidirectional synchronization engine using debounced batch writes to optimize Firestore quota.
    *   **Automated Sync Hooks (`src/db.ts`):** Integrated Dexie hooks to automatically queue local tracking data (Kicks, Vitals, Mood, Hydration, etc.) for background sync to Firestore.
    *   **Multi-Device Restoration:** Updated `store.tsx` to automatically pull down all historical `trackingData` subcollections when a user logs in on a new device.
    *   **Onboarding Persistence:** Implemented `saveUserProfile` and `getUserProfile` to persist the `isSetup` flag in Firestore, allowing returning users to bypass the setup wizard.
    *   **Data Privacy & Retention:** Implemented an automated 2-year data cleanup policy inside `CloudSync` and added a privacy notice to the `Profile.tsx` UI.
    *   **Security:** Created and deployed strict `firestore.rules` allowing only authenticated owners to read/write their data.
    *   **Testing:** Verified type safety (`tsc`) and ran a successful production build.

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
