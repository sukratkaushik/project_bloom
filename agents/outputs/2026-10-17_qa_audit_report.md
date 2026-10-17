# OPIN Quality & Test Engineering (SDET) Audit Report
**Date:** 2026-10-17  
**Auditor:** Lead Quality & Test Engineering Agent (SDET)  
**Target:** Our Pregnancy (OPIN / Bloom) — Android App (Capacitor) & Web Codebase (PWA)  
**Overall Readiness Score:** 🟡 **CONDITIONAL PRODUCTION READINESS (86/100)**  

---

## 1. Executive Summary & Release Scorecard

A comprehensive, multi-dimensional quality and clinical engineering audit was executed against the **Our Pregnancy (OPIN)** repository (`Project_Bloom`). This audit incorporates all updates since the September checkpoint, including the simplified **2-tier pricing architecture** (Free vs Pro), native Google Authentication bridge (`@capacitor-firebase/authentication`), and refined DPDP compliance modal gates.

### Scorecard by Dimension

| Dimension | Weight | Score | Status | Key Highlights |
| :--- | :---: | :---: | :---: | :--- |
| **1. Static Analysis & TypeScript** | 15% | **85%** | 🟡 WARNING | `tsc --noEmit` passed (0 errors). Strict mode fails with 9 errors (7 missing `@types/react-dom`). |
| **2. Database & Dexie.js Integrity** | 20% | **90%** | 🟡 WARNING | IndexedDB v4 schema solid; DPDP erasure verified; `db.contractionRecords` missing cloud hook. |
| **3. Functional Core Flows** | 20% | **96%** | 🟢 PASS | Kick counter (Cardiff 10), 5-1-1 contraction timer, BP classifications, 2-tier plan enforcement. |
| **4. Android Capacitor Readiness** | 15% | **95%** | 🟢 PASS | 7 plugins synced (added `@capacitor-firebase/authentication`); permissions, safe areas, biometrics OK. |
| **5. Non-Functional & Performance** | 15% | **68%** | 🔴 NEEDS WORK | Monolithic JS bundle grew to **2.76 MB** (748 kB gzip). Static vs dynamic import collisions. |
| **6. Clinical & Compliance Safety** | 15% | **86%** | 🟡 WARNING | PCPNDT zero-tolerance verified; login-gated DPDP consent; disclaimers missing on 5 screens. |
| **OVERALL COMPOSITE SCORE** | **100%** | **86%** | 🟡 **CONDITIONAL** | Approved for staged beta/pilot; resolve bundle splitting and disclaimers before public GA. |

---

## 2. Multi-Dimensional Deep-Dive Findings

### Dimension 1: Static Analysis & TypeScript Compilation
* **Standard Verification (`npm run lint` / `tsc --noEmit`):**
  * 🟢 **Result:** **0 Errors.** The active codebase compiles cleanly.
* **Strict Type Verification (`npx tsc --noEmit --strict`):**
  * 🔴 **Result:** **9 Errors across 9 files:**
    * 7 instances of TS7016 (`Could not find a declaration file for module 'react-dom' / 'react-dom/client'`):
      * `src/components/ComplianceConsentModal.tsx:2`
      * `src/components/mobile/AbhaInfoModal.tsx:2`
      * `src/components/mobile/DoctorModal.tsx:2`
      * `src/components/mobile/PartnerModal.tsx:2`
      * `src/components/mobile/RescheduleModal.tsx:2`
      * `src/components/sections/Profile.tsx:2`
      * `src/main.tsx:2`
    * 1 instance of TS7006: `src/components/sections/PartnerSync.tsx:160`: Parameter `id` implicitly has an `any` type (`excluded.filter(id => id !== taskId)`).
    * 1 instance of TS2345: `src/components/sections/PregnancyTracker.tsx:74`: Argument of type `string | null` not assignable to `string | undefined` in `calculateCurrentWeek(state.dueDate)`.
* **Action Item:** Add `@types/react-dom` to devDependencies and patch the 2 simple typing discrepancies.

---

### Dimension 2: Database & Dexie.js Data Integrity
* **IndexedDB Architecture (`src/db.ts`):**
  * `PregnancyTrackerDB` correctly implements incremental schema migration across versions 1 through 4 (`users`, `journeys`, `tasks`, `kickSessions`, `contractionRecords`, `contractionSessions`, `vitalsLogs`, `moodLogs`, `hydrationLogs`, `supplementLogs`, `foodScanLogs`, `appState`, `medicalReports`).
  * Compound indices (`[journeyId+startTime]`, `[journeyId+timestamp]`, `[journeyId+date]`) provide sub-millisecond query performance in `useLiveQuery`.
* **Right to Erasure (DPDP Act Sec 12):**
  * In `src/components/sections/Profile.tsx`, account deletion invokes `deleteMyOwnAccountCallable()`, clears all Dexie tables via `dexieDb.tables.map(t => t.clear())`, and deletes the database via `dexieDb.delete()`.
* **⚠️ Data Integrity Finding (CloudSync Discrepancy):**
  * In `src/db.ts`, sync hooks are attached to `db.contractionSessions` (`setupSyncHooks(db.contractionSessions, 'contraction')`), but **NOT** to `db.contractionRecords`.
  * In `src/cloudSync.ts`, `restoreJourneyData()` only restores `contractionSessions`.
  * **Impact:** Individual contraction start/end/gap entries within a session are preserved locally in IndexedDB, but will not sync to Firestore. Upon cross-device restore, the session metadata appears, but detailed interval graphs will be empty.

---

### Dimension 3: Functional Core Flows
* **Kick Counter (`KickCounter.tsx`):**
  * Cardiff "Count to 10" methodology accurately implemented.
  * 2-hour duration threshold warning alert triggers if movement takes longer than expected.
  * Calendar date filtering and history deletion verified.
* **Contraction Timer (`ContractionTimer.tsx`):**
  * Standard 5-1-1 labor rule algorithm verified (Frequency $\le 5$ min, Duration $\ge 60$ s, Duration of pattern $\ge 1$ hr).
  * Active timer persistence in `localStorage` (`ourpregnancy_active_contraction_start`) ensures state is never lost if the user switches apps or takes a phone call.
  * Direct emergency call trigger (108 / Doctor) fires when the 5-1-1 rule is satisfied.
* **Vitals Tracker (`VitalsTracker.tsx`):**
  * Blood pressure categorization:
    * $\ge 160$ systolic or $\ge 110$ diastolic $\rightarrow$ Hypertensive Crisis (emergency triage prompt)
    * $\ge 140$ systolic or $\ge 90$ diastolic $\rightarrow$ High Stage 2 (doctor consultation prompt)
    * Normal, Elevated, Stage 1 mappings.
  * Adheres to clinical safety boundaries: does not claim automated diagnosis of preeclampsia.
* **Checklists & 2-Tier Model:**
  * Hospital Bag includes localized Indian maternal items (salwar kameez, cotton jhablas, laddoo/dry fruits, cash).
  * 2-tier plan gating (Free vs Pro) cleanly restricts advanced medical reports and AI features without blocking essential safety tracking.

---

### Dimension 4: Android-Specific Capacitor Readiness
* **Plugin Synchronization (`npx cap sync android`):**
  * 🟢 **7 Native Plugins Verified and Synchronized:**
    1. `@aparajita/capacitor-biometric-auth@10.0.0` (Maternal Privacy Shield)
    2. `@capacitor-firebase/authentication@8.5.2` (Native Google Sign-In)
    3. `@capacitor/app@8.1.1`
    4. `@capacitor/haptics@8.0.2`
    5. `@capacitor/health-fitness@1.0.1` (Health Connect Bridge)
    6. `@capacitor/local-notifications@8.3.1`
    7. `@capacitor/status-bar@8.0.3`
* **Android Manifest & Permissions (`android/app/src/main/AndroidManifest.xml`):**
  * `android:allowBackup="false"` prevents unauthorized extraction of local IndexedDB files.
  * `android:usesCleartextTraffic="false"` enforces strict HTTPS transport.
  * Health Connect intents (`ACTION_SHOW_PERMISSIONS_RATIONALE` and `VIEW_PERMISSION_USAGE`) properly declared.
  * Minimized permissions: `READ_HEART_RATE`, `READ_STEPS`, `READ_WEIGHT`, `WRITE_WEIGHT`, `READ_SLEEP`, `READ_BLOOD_PRESSURE`, `READ_OXYGEN_SATURATION`, `READ_BODY_TEMPERATURE`, `READ_BLOOD_GLUCOSE`.
* **Safe-Areas & Layout:**
  * `index.html` has `viewport-fit=cover`.
  * Dynamic insets properly configured with native fallbacks (`max(2.75rem, env(safe-area-inset-top))` and `max(0.6rem, env(safe-area-inset-bottom))`).
* **Native Build Config:**
  * `targetSdkVersion = 36`, `compileSdkVersion = 36`, `minSdkVersion = 26`. Pre-compiled artifacts (`OurPregnancy.apk` [13.8 MB] and `app-release.aab` [12.8 MB]) verified.

---

### Dimension 5: Non-Functional Testing (Offline, Bundle Size, Performance)
* **Offline Resilience & PWA:**
  * `vite-plugin-pwa` with Workbox generates `dist/sw.js` and `dist/workbox-*.js`.
  * 33 static assets precached (~3.84 MB).
  * `navigateFallbackDenylist` correctly excludes Firebase reserved paths (`/__/*`).
  * Offline shell operates seamlessly with Dexie IndexedDB.
* **⚠️ Bundle Size & Code-Splitting (Critical Performance Finding):**
  * Entry bundle `dist/assets/index-HZ3dT4mo.js` is **2,759.25 kB (2.76 MB)** uncompressed (748.52 kB gzip).
  * **Vite Warning:** Colliding static and dynamic imports for:
    1. `firebase/functions` (imported dynamically in `firebase.ts` but statically in 7 components)
    2. `cloudSync.ts` (imported dynamically in `Sidebar.tsx` / `Profile.tsx` but statically in `db.ts` / `store.tsx`)
    3. `pdfExport.ts` (imported dynamically in `Sidebar.tsx` / `Notes.tsx` but statically in `CareTab.tsx` / `VaultTab.tsx` / `MedicalReports.tsx`)
  * **Root Cause:** All 34 dashboard sections in `Dashboard.tsx` are synchronously imported.

---

### Dimension 6: Clinical & Compliance Safety
* **PCPNDT Act 1994 (India) — ZERO TOLERANCE: 🟢 PASSED (FLAWLESS)**
  * Pre-filter regex interceptor in Cloud Functions (`functions/src/index.ts`):
    * `isPCPNDTGenderQuery(message)` checks for terms like `boy or girl`, `nub theory`, `ramzi theory`, `skull theory`, `heart rate gender`, `predict gender`, `fetal sex`, etc.
    * Returns statutory refusal **instantly** without dispatching any call to LLMs.
  * Medical report OCR/parsing pipeline:
    * `pcpndtRegex` actively filters and redacts any fetal gender or sex tokens (`male fetus`, `female fetus`, `it's a boy`, etc.).
  * In-app AI guidance (`AskOurPregnancy.tsx`):
    * Hard refusal boundary prompt embedded.
  * Statutory warning banner displayed prominently on `MedicalReports.tsx`.
* **Universal Medical Disclaimers: 🟡 INCOMPLETE (ACTION REQUIRED)**
  * Rule in `OPIN_Brain/03_CLINICAL_COMPLIANCE.md`:
    > *"Every clinical section (Contraction Timer, Kick Counter, Food Scanner, Medical Parser) must prominently display: 'Educational guidance only. Always consult your obstetrician or midwife for medical evaluation.'"*
  * **Status:** Still missing on `KickCounter.tsx`, `ContractionTimer.tsx`, `VitalsTracker.tsx`, `FoodScanner.tsx`, and `LaborReadiness.tsx`.
* **DPDP Act 2023 & Consent:**
  * Clean consent gating implemented: visitors to public marketing pages browse freely; authenticated users or app sessions receive the bilingual DPDP modal.
  * HL7 FHIR R4 interoperability mappings for BP, weight, and kicks properly coded with LOINC and UCUM.

---

## 3. Prioritized Action Plan

| Priority | Category | Action Item | Estimated Time |
| :---: | :--- | :--- | :---: |
| **P0** | **Compliance** | Add a standardized `<ClinicalDisclaimer />` banner to `KickCounter.tsx`, `ContractionTimer.tsx`, `VitalsTracker.tsx`, `FoodScanner.tsx`, and `LaborReadiness.tsx`. | 30 min |
| **P1** | **Performance** | Code-split the 34 dashboard sections in `Dashboard.tsx` with `React.lazy()` + `Suspense` and resolve the dynamic vs static import collisions (`firebase/functions`, `pdfExport.ts`, `cloudSync.ts`) to reduce initial JS chunk from 2.76 MB to < 350 kB. | 1.5 hr |
| **P1** | **Data Integrity** | Hook `db.contractionRecords` in `db.ts` and add restore handler in `cloudSync.ts` to sync individual contraction intervals to Firestore. | 20 min |
| **P2** | **TypeScript** | Install `@types/react-dom`, fix strict mode errors in `PartnerSync.tsx` and `PregnancyTracker.tsx`, and enable `"strict": true` in `tsconfig.json`. | 30 min |
| **P2** | **Branding** | Harmonize PWA manifest in `vite.config.ts` from `"Bloom Pregnancy Planner"` to `"Our Pregnancy"`. | 5 min |
| **P3** | **Android** | Test enabling `minifyEnabled true` in `android/app/build.gradle` for production releases. | 1 hr |

---

## 4. Release Decision

* **Staging / Internal Pilot:** **APPROVED** 🟢
* **Google Play / Public Web GA:** **HOLD** 🟡 until **P0 (Universal Disclaimers)** and **P1 (Bundle Code-Splitting & Contraction Record Sync)** are completed.
