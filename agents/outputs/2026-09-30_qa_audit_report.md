# OPIN Quality & Test Engineering (SDET) Audit Report
**Date:** 2026-09-30  
**Auditor:** Lead Quality & Test Engineering Agent (SDET)  
**Target:** Our Pregnancy (Bloom / OPIN) — Android (Capacitor) & Web (PWA)  
**Overall Readiness Score:** 🟡 **CONDITIONAL PRODUCTION READINESS (84/100)**  

---

## 1. Executive Summary

A comprehensive multi-dimensional quality and clinical engineering audit was executed against the **Our Pregnancy (OPIN / Bloom)** codebase (`Project_Bloom`). The evaluation covered static analysis, data persistence integrity, core maternal flows, native Android readiness, non-functional resilience/performance, and regulatory/clinical compliance (PCPNDT Act 1994 & DPDP Act 2023).

### Scorecard by Dimension

| Dimension | Weight | Score | Status | Key Highlights |
| :--- | :---: | :---: | :---: | :--- |
| **1. Static Analysis & TypeScript** | 15% | **85%** | 🟡 WARNING | `tsc --noEmit` passes (0 errors). Strict mode fails with 9 errors across 4 files. |
| **2. Database & Dexie.js Integrity** | 20% | **88%** | 🟡 WARNING | IndexedDB v4 schema solid; cloud sync hook missing for `db.contractionRecords`. |
| **3. Functional Core Flows** | 20% | **96%** | 🟢 PASS | Kick counter (Cardiff 10), 5-1-1 contraction timer, vitals & hospital bag verified. |
| **4. Android Capacitor Readiness** | 15% | **92%** | 🟢 PASS | 6 plugins synced; permissions, safe areas & `viewport-fit=cover` verified. |
| **5. Non-Functional & Performance** | 15% | **70%** | 🔴 NEEDS WORK | Monolithic bundle (2.08 MB JS). Lack of route/section code-splitting. |
| **6. Clinical & Compliance Safety** | 15% | **85%** | 🟡 WARNING | PCPNDT zero-tolerance enforced. Universal medical disclaimer missing in 5 screens. |
| **OVERALL COMPOSITE SCORE** | **100%** | **84%** | 🟡 **CONDITIONAL** | Safe for staged pilot; resolve disclaimer & bundle optimizations before GA. |

---

## 2. Multi-Dimensional Deep-Dive Findings

### Dimension 1: Static Analysis & TypeScript Compilation
* **Default Build Check (`npm run lint` / `tsc --noEmit`):**
  * **Result:** 🟢 **0 Errors**
  * The production build compiles cleanly without standard compiler errors.
* **Strict Type Check (`tsc --noEmit --strict`):**
  * **Result:** 🔴 **9 Errors across 4 files**
  * `src/components/mobile/DoctorModal.tsx:2`: Missing `@types/react-dom` declaration.
  * `src/main.tsx:2`: Missing `@types/react-dom` declaration.
  * `src/components/sections/PartnerSync.tsx:128, 146, 188, 204, 217, 219`: Discriminated union type mismatch on property `isRadio` / `tasks` and implicit `any` parameter `id`.
  * `src/components/sections/PregnancyTracker.tsx:68`: `calculateCurrentWeek(state.dueDate)` type mismatch (`string | null` passed to `string | undefined`).
* **Recommendation:**
  * Add `@types/react-dom` to devDependencies.
  * Update `calculateCurrentWeek(state.dueDate ?? undefined)`.
  * Add union type guards in `PartnerSync.tsx`.
  * Gradually enable `"strict": true` in `tsconfig.json`.

---

### Dimension 2: Database & Dexie.js Data Integrity
* **Schema & Indexing (`src/db.ts`):**
  * `PregnancyTrackerDB` correctly implements incremental schema migration across versions 1 through 4 (`users`, `journeys`, `tasks`, `kickSessions`, `contractionRecords`, `contractionSessions`, `vitalsLogs`, `moodLogs`, `hydrationLogs`, `supplementLogs`, `foodScanLogs`, `appState`, `medicalReports`).
  * Compound indices (`[journeyId+startTime]`, `[journeyId+timestamp]`, `[journeyId+date]`) provide sub-millisecond query performance in `useLiveQuery`.
* **Data Erasure & Privacy Compliance:**
  * In `src/components/sections/Profile.tsx`, account deletion invokes `deleteMyOwnAccountCallable()`, clears all Dexie tables via `dexieDb.tables.map(t => t.clear())`, and deletes the database via `dexieDb.delete()`. This satisfies DPDP Act 2023 Section 12 (Right to Erasure).
* **⚠️ Data Integrity Finding (CloudSync Discrepancy):**
  * In `src/db.ts`, sync hooks are attached to `db.contractionSessions` (`setupSyncHooks(db.contractionSessions, 'contraction')`), but **NOT** to `db.contractionRecords`.
  * In `src/cloudSync.ts`, `restoreJourneyData()` only restores `contractionSessions`.
  * **Impact:** Individual contraction start/end/gap entries within a session are preserved locally in IndexedDB, but will not sync to Firestore. Upon cross-device restore, the session metadata appears, but detailed interval graphs will be empty.

---

### Dimension 3: Functional Core Flows
* **Kick Counter (`src/components/sections/KickCounter.tsx`):**
  * Follows Cardiff "Count to 10" protocol.
  * Red warning banner triggers if a session duration exceeds 2 hours without reaching 10 kicks (`(lastSession.endTime - lastSession.startTime) > 2 * 60 * 60 * 1000`).
  * Calendar-based filtering and session deletion fully functional.
* **Contraction Timer (`src/components/sections/ContractionTimer.tsx`):**
  * Accurately calculates the 5-1-1 rule:
    * Frequency $\le 5$ minutes apart (first to last start interval divided by gaps)
    * Duration $\ge 60$ seconds average
    * Continuing duration $\ge 1$ hour
  * Active contraction start timestamp persisted in `localStorage` (`ourpregnancy_active_contraction_start`) to prevent data loss if user accidentally switches tabs or receives a phone call.
  * Displays urgent 108 emergency triage prompt when 5-1-1 rule is triggered.
* **Vitals Tracker (`src/components/sections/VitalsTracker.tsx`):**
  * Categorizes blood pressure cleanly:
    * $\ge 160$ systolic or $\ge 110$ diastolic $\rightarrow$ Hypertensive Crisis (hospital triage prompt)
    * $\ge 140$ systolic or $\ge 90$ diastolic $\rightarrow$ High Stage 2 (doctor consultation prompt)
    * Normal, Elevated, Stage 1 mappings.
  * Complies with clinical boundary rules: does not auto-diagnose preeclampsia; frames output as observational recommendations.
* **Checklists & Planning:**
  * Hospital Bag includes localized Indian maternal items (salwar kameez, cotton jhablas, laddoo/dry fruits, cash).
  * Labor readiness score evaluates physiological baseline deviations (HRV, RHR, BBT) without claiming medical diagnosis.

---

### Dimension 4: Android-Specific Capacitor Readiness
* **Plugin Synchronization (`npx cap sync android`):**
  * 🟢 **6 Core Plugins Detected and Synced:**
    1. `@aparajita/capacitor-biometric-auth@10.0.0`
    2. `@capacitor/app@8.1.1`
    3. `@capacitor/haptics@8.0.2`
    4. `@capacitor/health-fitness@1.0.1`
    5. `@capacitor/local-notifications@8.3.1`
    6. `@capacitor/status-bar@8.0.3`
* **Android Manifest & Permissions (`android/app/src/main/AndroidManifest.xml`):**
  * `android:allowBackup="false"` prevents unauthorized extraction of local IndexedDB files.
  * `android:usesCleartextTraffic="false"` enforces strict HTTPS transport.
  * Health Connect intents (`ACTION_SHOW_PERMISSIONS_RATIONALE` and `VIEW_PERMISSION_USAGE`) properly declared.
  * Minimized permissions: `READ_HEART_RATE`, `READ_STEPS`, `READ_WEIGHT`, `WRITE_WEIGHT`, `READ_SLEEP`, `READ_BLOOD_PRESSURE`, `READ_OXYGEN_SATURATION`, `READ_BODY_TEMPERATURE`, `READ_BLOOD_GLUCOSE`.
* **Safe-Areas & Layout:**
  * `index.html` has `viewport-fit=cover`.
  * Mobile shell and navigation bars implement dynamic insets:
    * `pt-[max(2.75rem,env(safe-area-inset-top))]`
    * `pb-[max(0.6rem,env(safe-area-inset-bottom))]`
* **Native Build Configurations:**
  * `targetSdkVersion = 36`, `compileSdkVersion = 36`, `minSdkVersion = 26`.
  * Note: `minifyEnabled` is currently set to `false` in `android/app/build.gradle` (recommended to enable ProGuard/R8 prior to Google Play production upload).

---

### Dimension 5: Non-Functional Testing (Offline, Bundle Size, Performance)
* **Offline Resilience:**
  * `vite-plugin-pwa` with Workbox generates `dist/sw.js` and `dist/workbox-*.js`.
  * 29 static assets precached (~3.02 MB).
  * `navigateFallbackDenylist` correctly excludes Firebase reserved paths (`/__/*`).
  * Offline shell operates seamlessly with Dexie IndexedDB.
* **⚠️ Bundle Size & Code-Splitting (Critical Performance Finding):**
  * Entry bundle `dist/assets/index-DJez6cXy.js` is **2,085.82 kB (2.08 MB)** uncompressed (546.61 kB gzip).
  * Vite issues a chunk size warning (> 500 kB).
  * **Root Cause:** In `src/components/Dashboard.tsx`, all 34 section components (including `FoodScanner.tsx` [71 KB], `AdminPanel.tsx` [35 KB], `GuidedBreathingAudio.tsx` [32 KB], `GovernmentSchemes.tsx` [48 KB], and `Profile.tsx` [46 KB]) are statically imported.
  * In `src/App.tsx`, landing sub-pages (`TeamPage`, `BlogsPage`, `CareersPage`) are also statically imported.
* **PWA Manifest Branding Inconsistency:**
  * In `vite.config.ts`, `manifest.name` is `"Bloom Pregnancy Planner"` and `manifest.short_name` is `"Bloom"`.
  * In `capacitor.config.ts` and `index.html`, the branding is `"Our Pregnancy"`. This should be harmonized.

---

### Dimension 6: Clinical & Compliance Safety
* **PCPNDT Act 1994 (India) — ZERO-TOLERANCE AUDIT: 🟢 PASSED (FLAWLESS)**
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
  * **Audit Result:**
    * `KickCounter.tsx`: ❌ Missing universal educational disclaimer.
    * `ContractionTimer.tsx`: ❌ Missing universal educational disclaimer.
    * `VitalsTracker.tsx`: ❌ Missing universal educational disclaimer.
    * `FoodScanner.tsx`: ❌ Missing universal educational disclaimer.
    * `LaborReadiness.tsx`: ❌ Missing universal educational disclaimer.
    * `MedicalReports.tsx`: 🟢 Contains PCPNDT & clinical advice disclaimers.
* **DPDP Act 2023 & Consent:**
  * Explicit, granular AI processing consent modal with grandfathering pattern (`consent === false` check).
  * HL7 FHIR R4 interoperability mappings for BP, weight, and kicks properly coded with LOINC and UCUM.

---

## 3. Prioritized Action & Remediation Plan

| Priority | Area | Remediation Action | Effort |
| :---: | :--- | :--- | :---: |
| **P0** | **Compliance** | Add a standardized `<ClinicalDisclaimer />` banner component to `KickCounter.tsx`, `ContractionTimer.tsx`, `VitalsTracker.tsx`, `FoodScanner.tsx`, and `LaborReadiness.tsx`. | 30 mins |
| **P1** | **Performance** | Implement `React.lazy()` and `Suspense` for the 34 dashboard tabs in `Dashboard.tsx` and auxiliary landing pages in `App.tsx` to slash the 2.08 MB initial JS bundle below 350 kB. | 1.5 hrs |
| **P1** | **Data Integrity** | Hook `db.contractionRecords` in `src/db.ts` and add its restore case to `src/cloudSync.ts` to prevent data loss on cross-device sync. | 20 mins |
| **P2** | **TypeScript** | Fix the 9 strict compiler errors (`PartnerSync.tsx`, `PregnancyTracker.tsx`, `@types/react-dom`) and enable `"strict": true` in `tsconfig.json`. | 45 mins |
| **P2** | **Branding** | Align PWA manifest in `vite.config.ts` from `"Bloom Pregnancy Planner"` to `"Our Pregnancy"`. | 5 mins |
| **P3** | **Android** | Test enabling `minifyEnabled true` in `android/app/build.gradle` with proper ProGuard keep rules for Capacitor plugins. | 1 hr |

---

## 4. Release Decision

* **Staging / Internal Pilot:** **APPROVED** 🟢
* **Google Play / Public Web GA:** **HOLD** 🟡 until **P0 (Universal Disclaimers)** and **P1 (Bundle Splitting & Contraction Record Sync)** are completed.
