# Comprehensive Clinical & Regulatory Compliance Audit Report

* **Auditor:** Chief Compliance & Clinical Risk Auditor (`compliance_agent`)
* **Date:** 2026-09-17
* **Governing Specifications:**
  * `agents/specs/compliance_agent.md`
  * `OPIN_Brain/03_CLINICAL_COMPLIANCE.md`
  * Pre-Conception and Pre-Natal Diagnostic Techniques (PCPNDT) Act, 1994 (India)
  * Digital Personal Data Protection (DPDP) Act, 2023 / GDPR
  * HL7 FHIR R4 Observation Specification

---

## 1. Overall Audit Status

### 🔴 FAILED (BLOCKING)

> **EXECUTIVE AUDIT SUMMARY:**  
> While Project Bloom demonstrates commendable groundwork—including an explicit PCPNDT interceptor in cloud functions, a dedicated PCPNDT UI banner on `MedicalReports.tsx`, local-first storage, and valid FHIR R4 Observation structures—the application currently exhibits **critical regulatory and clinical liability non-compliances** that prevent sign-off for public release.
>
> 1. **Mandatory Universal Disclaimer Omission:** The standing clinical requirement from `OPIN_Brain/03_CLINICAL_COMPLIANCE.md` mandates that *every* clinical tracking and AI feature prominently display:  
>    `"Educational guidance only. Always consult your obstetrician or midwife for medical evaluation."`  
>    Currently, **7 out of 9 clinical sections** (`ContractionTimer`, `KickCounter`, `FoodScanner`, `VitalsTracker`, `SymptomLogger`, `LaborReadiness`, and `FloatingChatbot`) fail to display this exact mandatory disclaimer.
> 2. **PCPNDT Defense-in-Depth Vulnerabilities:**
>    * `FloatingChatbot.tsx` does not pass a system prompt to `chatWithAI`, falling back to a backend prompt that completely lacks PCPNDT prohibition rules.
>    * `chatWithAI` does not execute `sanitizePCPNDTContent()` on its output replies.
>    * `parseDocument` (the PDF parser used in `AskOurPregnancy.tsx`) returns raw text without PCPNDT redaction, exposing overseas reports with gender markers directly to the AI context.
>    * The redaction regex in `sanitizePCPNDTContent()` misses clinical genetic and karyotype markers (e.g. `46,XY`, `46,XX`, `SRY gene`, `Fetal Sex: M/F`).
> 3. **Acute Red Flag & Emergency Triage Deficiencies:**
>    * `SymptomLogger.tsx` lacks emergency triage warnings when high-risk symptoms (Severe Spotting, Severe Cramping, Severe Headache) are logged.
>    * Existing red flag warnings in `ContractionTimer`, `KickCounter`, and `VitalsTracker` mention emergency number 108 in plain text, but lack active `tel:112` / `tel:108` direct emergency triage links and 112 primary routing.
> 4. **Statutory Gaps in Public Surfaces:** Neither `LandingPage.tsx` nor `TermsOfService` contains the statutory PCPNDT Act declaration or universal medical disclaimer.

---

## 2. Feature-by-Feature Compliance Matrix

| Feature / Component | PCPNDT Status | Medical Disclaimer | Automated Diagnosis Boundary | Emergency Triage (112/108) | DPDP Consent & Privacy | Overall Section Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **AskOurPregnancy (`AskOurPregnancy.tsx`)** | 🟡 Partial | 🟡 Custom phrasing | 🟢 Safe (Informational) | 🔴 Missing acute triage | 🟢 Granular toggle | 🟡 WARNING |
| **Floating Chatbot (`FloatingChatbot.tsx`)** | 🔴 Vulnerable | 🔴 Missing | 🟢 Safe (Conversational) | 🔴 Missing acute triage | 🟢 Granular toggle | 🔴 FAIL |
| **Contraction Timer (`ContractionTimer.tsx`)** | 🟢 Compliant | 🔴 Custom, non-standard | 🟢 Safe (5-1-1 heuristic) | 🟡 108 text only (No tel link) | 🟢 Local-first (Dexie) | 🟡 WARNING |
| **Kick Counter (`KickCounter.tsx`)** | 🟢 Compliant | 🔴 Missing mandatory text | 🟢 Safe (Count-to-10) | 🟡 108 text only (No tel link) | 🟢 Local-first (Dexie) | 🟡 WARNING |
| **Food Scanner (`FoodScanner.tsx`)** | 🟢 Compliant | 🔴 Substandard note | 🟢 Safe (Nutritional check) | N/A | 🟢 Granular toggle | 🟡 WARNING |
| **Medical Reports (`MedicalReports.tsx`)** | 🟢 Banner present | 🟡 Verification note only | 🟢 Safe (Decipher aid) | N/A | 🟢 Cloud encrypted | 🟡 WARNING |
| **Vitals Tracker (`VitalsTracker.tsx`)** | 🟢 Compliant | 🔴 Missing mandatory text | 🟢 Safe (Standard stages) | 🟡 108 text only (No tel link) | 🟢 Local-first (Dexie) | 🟡 WARNING |
| **Symptom Logger (`SymptomLogger.tsx`)** | 🟢 Compliant | 🔴 Completely missing | 🟢 Safe (Self-log) | 🔴 No red flag triggers | 🟢 Local + Cloud sync | 🔴 FAIL |
| **Labor Readiness (`LaborReadiness.tsx`)** | 🟢 Compliant | 🟡 Demo note only | 🟢 Safe (Advisory heuristic) | N/A | 🟢 Local-first | 🟡 WARNING |
| **Baby Names (`BabyNames.tsx`)** | 🟡 Needs clarification | N/A | N/A | N/A | 🟢 Local-first | 🟡 WARNING |
| **Safe Travel Guide (`SafeTravel.tsx`)** | 🟢 Compliant | 🔴 Missing mandatory text | 🟢 Safe (ACOG guidelines) | 🔴 No emergency dialer | 🟢 Local-first | 🟡 WARNING |
| **FHIR R4 Module (`fhirIntegration.ts`)** | 🟢 Compliant | N/A | 🟢 Pure data schema | N/A | 🟢 OAuth 2.0 system | 🟢 PASS |
| **Partner Sync (`PartnerSync.tsx`)** | 🟢 Compliant | N/A | N/A | N/A | 🟢 Granular categories | 🟢 PASS |
| **Terms of Service (`LegalPages.tsx`)** | 🔴 Missing PCPNDT | 🟢 Comprehensive | 🟢 Clear disclaimer | N/A | 🟢 Rights outlined | 🟡 WARNING |
| **Landing Page (`LandingPage.tsx`)** | 🔴 Missing PCPNDT | 🔴 Completely missing | 🟢 Product copy | N/A | 🟢 Encrypted note | 🔴 FAIL |
| **Cloud Functions (`functions/src/index.ts`)** | 🟡 Redaction gaps | 🔴 Missing in default prompt | 🟢 Safe extraction | N/A | 🟢 asia-south1 data host | 🟡 WARNING |

---

## 3. Detailed Risk Breakdown

### Category A: PCPNDT Compliance (India) — Zero Tolerance

1. **Backend System Prompt Bypass via Floating Chatbot (`functions/src/index.ts` line 183):**
   * *Finding:* When queries originate from `FloatingChatbot.tsx`, no `systemPrompt` parameter is passed. The backend falls back to `defaultSystemPrompt` (lines 183–191), which contains **zero instructions prohibiting fetal sex determination**.
   * *Impact:* If a user phrases a sex-determination query in a manner not matched by the static array in `isPCPNDTGenderQuery` (e.g., `"explain the ultrasound genital tuber orientation"`, `"analyze nub angle in this scan"`), the LLM will answer without knowing sex determination is illegal under Indian law.
2. **Unsanitized Chat Output (`functions/src/index.ts` line 223):**
   * *Finding:* `chatWithAI` immediately returns `result.choices[0].message.content` without piping it through `sanitizePCPNDTContent()`.
   * *Impact:* If the model inadvertently generates phrases like `"the fetus is male"` or `"it is a boy"`, it is delivered directly to the user.
3. **Unsanitized PDF Document Parsing (`functions/src/index.ts` line 253):**
   * *Finding:* In `parseDocument`, the extracted text from uploaded PDF files (`data.text`) is returned verbatim without invoking `sanitizePCPNDTContent()`.
   * *Impact:* An expectant mother uploading an overseas report or NIPT test with fetal gender has that text fed unredacted into `AskOurPregnancy.tsx`.
4. **Gaps in `sanitizePCPNDTContent` Regex Pattern (`functions/src/index.ts` line 507):**
   * *Finding:* The current regex `/\b(male fetus|female fetus|boy fetus|girl fetus|...)\b/gi` misses:
     * Genetic karyotypes: `46,XY`, `46,XX`, `47,XXY`
     * Clinical indicators: `SRY gene positive/detected`, `Y-chromosome sequences present`
     * Standard abbreviations: `Sex: M`, `Sex: F`, `Gender: M`, `Gender: F`
     * Fetal markers: `Fetal Sex: XY`, `Fetal Sex: XX`
5. **Gaps in `isPCPNDTGenderQuery` Pattern Matching (`functions/src/index.ts` line 110):**
   * *Finding:* Omits queries such as:
     * `"gender prediction"` (only `"predict gender"` is listed)
     * `"what is the gender"` / `"what is the sex"`
     * `"chinese gender"` / `"chinese pregnancy chart"` / `"mayan gender"`
     * `"bache ka ling"` / `"bacha ladka hai ya ladki"` / `"ling pata karna"`
     * `"nipt gender"` / `"nipt sex"`
6. **Baby Names Generator Ambiguity (`BabyNames.tsx`):**
   * *Finding:* `BabyNames.tsx` presents a toggle for `"Gender focus: Boy | Girl | Neutral"`. While legally benign (it is merely a filter for baby naming inspiration), it lacks a clear note clarifying that this is strictly a naming tool and not a prenatal sex predictor.

---

### Category B: Medical Liability & Device Boundaries

1. **Non-Compliance with Mandatory Universal Disclaimer Text:**
   * *Mandate:* Under `OPIN_Brain/03_CLINICAL_COMPLIANCE.md`, Section 2:
     > Every clinical section (Contraction Timer, Kick Counter, Food Scanner, Medical Parser) must prominently display:
     > *"Educational guidance only. Always consult your obstetrician or midwife for medical evaluation."*
   * *Current State:*
     * `ContractionTimer.tsx`: Shows *"This timer is a guide only. Always follow your doctor's specific instructions about when to go to hospital."* (Non-standard phrasing).
     * `KickCounter.tsx`: Shows only ACOG clinical commentary; **no disclaimer present**.
     * `FoodScanner.tsx`: Shows a small footer note: `*Nutritional values are estimates...` only after scanning; **no prominent banner**.
     * `VitalsTracker.tsx`: Shows PMSMA scheme info; **no universal disclaimer**.
     * `SymptomLogger.tsx`: **Zero disclaimer present**.
     * `LaborReadiness.tsx`: Shows conceptual demonstration disclaimer, but lacks the standardized universal text.
     * `SafeTravel.tsx`: **Zero disclaimer present**.
     * `FloatingChatbot.tsx`: **Zero disclaimer present** in the chat window.
2. **Absence of Medical Disclaimer on Public Landing Page (`LandingPage.tsx`):**
   * *Finding:* Visitors can inspect app features, pricing tiers, and clinical capabilities on the landing page without encountering any medical liability disclaimer in the footer or feature hero sections.
3. **Automated Diagnosis Boundary Assessment:**
   * *Finding:* 🟢 **PASSED.** None of the audited modules generate declarative diagnostic statements such as `"You have preeclampsia"` or `"You have gestational diabetes."` `VitalsTracker.tsx` classifies readings strictly into blood pressure stages (`"High Stage 2 — Contact your doctor"`, `"Hypertensive Crisis"`), which complies with clinical risk boundary rules.

---

### Category C: Acute Red Flag & Emergency Triage Safeguards

1. **Symptom Logger Acute Red Flag Omission (`SymptomLogger.tsx`):**
   * *Finding:* When a user selects `Severity.SEVERE` for symptoms such as `SPOTTING`, `CRAMPING`, or `HEADACHE`, the log is saved quietly without triggering an emergency triage warning.
   * *Clinical Risk:* Severe bleeding or cramping in pregnancy can indicate ectopic pregnancy, miscarriage, or placental abruption; severe headache can indicate impending eclampsia.
   * *Mandate:* Immediate triage prompt directing the patient to call emergency services (112/108) or proceed to the nearest maternity triage unit.
2. **Emergency Numbers Incompleteness & Clickable Dialer Absence:**
   * *Finding:* `ContractionTimer.tsx`, `KickCounter.tsx`, and `VitalsTracker.tsx` instruct users to `"call 108"` in plain text.
   * *Remediation:* In India, **112** is the unified national emergency helpline (equivalent to 911), while 108 is the dedicated ambulance service. Prompts must specify `"112 / 108"` and include an active `<a href="tel:112">` / `<a href="tel:108">` button for panic-safe one-tap dialing.
3. **Safe Travel Warning Signs Lack Triage Links (`SafeTravel.tsx` line 545):**
   * *Finding:* Lists severe warning signs (vaginal bleeding, severe abdominal pain, sudden swelling) in red text, but does not provide an emergency call button or triage instructions.

---

### Category D: Data Privacy, DPDP Act & Doctor Linking

1. **Local-First & Encryption Architecture:**
   * *Finding:* 🟢 **PASSED.** Tracking logs reside primarily in local IndexedDB (`Dexie`) and sync to user-isolated Firestore collections using authenticated UID boundaries (`firestore.rules` Task 33).
2. **AI Processing Consent Architecture:**
   * *Finding:* 🟢 **PASSED.** Granular consent toggle (`aiProcessingConsent`) is implemented in `SetupScreen.tsx` and `Profile.tsx`, utilizing the `consent === false` grandfathering pattern (`AiConsentPrompt.tsx`).
3. **Doctor Portal QR Onboarding & Granular Consent:**
   * *Finding:* 🟡 **FORWARD-LOOKING WARNING.** The Doctor Portal specification (`OPIN_Brain/04_DOCTOR_PORTAL_SPEC.md`) requires patients scanning clinic desk standees (`VIPCARE90`) to grant explicit, granular consent categorized by tracking stream (kicks, BP, reports) with instant revocation. While `PartnerSync.tsx` supports granular task/category sync, the dedicated Doctor Link onboarding screen is pending implementation and must strictly adhere to DPDP Section 6 explicit consent standards before pilot launch.

---

### Category E: FHIR R4 Interoperability Validation

1. **HL7 FHIR R4 Observation Schema (`src/utils/fhirIntegration.ts`):**
   * *Blood Pressure (`mapBloodPressureToFHIR`):*
     * LOINC Code: `85354-9` (Blood pressure panel). Valid.
     * Components: Systolic `8480-6` (`mm[Hg]`), Diastolic `8462-4` (`mm[Hg]`). Valid.
     * Category: `http://terminology.hl7.org/CodeSystem/observation-category` -> `vital-signs`. Valid.
     * Status: `final`. Valid.
   * *Body Weight (`mapWeightToFHIR`):*
     * LOINC Code: `29463-7` (Body weight). Valid.
     * UCUM Code: `kg`. Valid.
     * Status: `final`. Valid.
   * *Fetal Kick Count (`mapFetalKickCountToFHIR`):*
     * LOINC Code: `57083-8` (Fetal movement count). Valid.
     * *Observation:* Missing standard `category` element (should include `exam` or `survey`).
     * UCUM Code: `"{kicks}"` is an acceptable UCUM annotation, though standard FHIR unit code is `1` with unit `"kicks"`.
   * *Authentication & Transport (`EHRFHIRClient`):*
     * OAuth 2.0 Client Credentials flow with automatic token renewal and `system/Observation.write` scope. Conforms to SMART on FHIR backend services specification.

---

## 4. Required Remediations & Action Plan

Before moving to release or launching the OB-GYN clinic pilot campaign, the following remediations must be executed:

### Remediation 1: Deploy Standardized Clinical Disclaimer Banner Component
Create a universal reusable banner component `src/components/ClinicalDisclaimer.tsx` and integrate it at the top or bottom of every clinical section:
```tsx
import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface ClinicalDisclaimerProps {
  className?: string;
  compact?: boolean;
}

export const ClinicalDisclaimer: React.FC<ClinicalDisclaimerProps> = ({ className = '', compact = false }) => {
  return (
    <div className={`bg-amber-500/10 border border-amber-500/25 rounded-[14px] p-3.5 flex items-start gap-3 text-charcoal dark:text-gray-200 ${className}`}>
      <ShieldAlert className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
      <div className="text-[12.5px] leading-relaxed">
        <strong className="font-semibold text-amber-900 dark:text-amber-300">Medical Notice: </strong>
        Educational guidance only. Always consult your obstetrician or midwife for medical evaluation.
      </div>
    </div>
  );
};
```
*Apply to:*
* `ContractionTimer.tsx`
* `KickCounter.tsx`
* `FoodScanner.tsx`
* `VitalsTracker.tsx`
* `SymptomLogger.tsx`
* `LaborReadiness.tsx`
* `SafeTravel.tsx`
* `FloatingChatbot.tsx` (as a persistent header/footer tag inside chat window)

---

### Remediation 2: Strengthen Backend PCPNDT Guardrails (`functions/src/index.ts`)

1. **Inject PCPNDT & Disclaimer Instructions into `defaultSystemPrompt` and `scopeConstraint`:**
   Ensure every AI prompt executed through `chatWithAI` unconditionally enforces PCPNDT prohibition:
   ```ts
   const defaultSystemPrompt = `You are Bloom AI, a helpful, warm, and supportive AI prenatal assistant for the pregnancy app 'Our Pregnancy'.
   You answer all questions related to maternal health, trimesters, gestational weeks, pregnancy travel safety, exercises, diet/nutrition, fetal growth, labor preparation, emotional well-being, baby care, and postpartum recovery. Keep answers warm, encouraging, concise, and rooted in safe medical guidelines (ACOG/WHO).
   
   CRITICAL LEGAL & CLINICAL MANDATES:
   1. PCPNDT ACT (1994) COMPLIANCE: Under Indian law, fetal sex determination or prediction is strictly illegal. You must NEVER predict, determine, deduce, or discuss fetal gender or sex under any circumstances (including ultrasound markers, nub theory, ramzi theory, Chinese gender charts, or heart rate myths). If asked, refuse immediately and state that prenatal sex determination is strictly prohibited under the PCPNDT Act, 1994.
   2. MEDICAL DISCLAIMER: You provide informational and educational guidance only, not a clinical diagnosis or medical prescription. Always advise users to consult their obstetrician or doctor for medical advice.`;
   ```

2. **Sanitize `chatWithAI` Response Content:**
   ```ts
   if (result.choices && result.choices.length > 0 && result.choices[0].message) {
     const rawContent = result.choices[0].message.content.trim();
     return { reply: sanitizePCPNDTContent(rawContent) };
   }
   ```

3. **Sanitize PDF Extracted Text in `parseDocument`:**
   ```ts
   if (fileName.toLowerCase().endsWith('.pdf')) {
     const pdfParse = require('pdf-parse');
     const data = await pdfParse(buffer);
     return { text: sanitizePCPNDTContent(data.text) };
   }
   ```

4. **Expand `sanitizePCPNDTContent` Regex:**
   ```ts
   const pcpndtRegex = /\b(male fetus|female fetus|boy fetus|girl fetus|fetus is a boy|fetus is a girl|baby is a boy|baby is a girl|it is a boy|it's a boy|it is a girl|it's a girl|gender:\s*(male|female|boy|girl|m|f|xy|xx)|sex:\s*(male|female|m|f|xy|xx)|fetal sex:\s*(male|female|m|f|xy|xx)|fetal gender:\s*(male|female|boy|girl)|karyotype:\s*46,\s*(xy|xx)|46,\s*xy|46,\s*xx|sry\s*(gene)?:\s*(positive|detected|present)|y-chromosome\s*(detected|present))\b/gi;
   ```

5. **Expand `isPCPNDTGenderQuery` Keyword Patterns:**
   Add `"gender prediction"`, `"sex prediction"`, `"what is the gender"`, `"what is the sex"`, `"can you tell the gender"`, `"can you tell the sex"`, `"chinese gender"`, `"chinese calendar"`, `"gender chart"`, `"bache ka ling"`, `"bacha ladka hai ya ladki"`, `"ling pata"`, `"ling check"`, `"nipt gender"`, `"nipt sex"`.

---

### Remediation 3: Implement Acute Red Flag Emergency Action Component
Create `src/components/EmergencyTriageBanner.tsx` providing active emergency call links:
```tsx
import React from 'react';
import { PhoneCall, AlertTriangle } from 'lucide-react';

interface EmergencyTriageBannerProps {
  title: string;
  message: string;
  className?: string;
}

export const EmergencyTriageBanner: React.FC<EmergencyTriageBannerProps> = ({ title, message, className = '' }) => {
  return (
    <div className={`p-4 rounded-[16px] bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-red-900 dark:text-red-200 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-[14px] leading-tight mb-0.5">{title}</h4>
          <p className="text-[12.5px] text-red-800 dark:text-red-300 leading-snug">{message}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
        <a
          href="tel:112"
          className="flex-1 sm:flex-initial px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-[10px] text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
        >
          <PhoneCall size={14} /> Call 112 (National Emergency)
        </a>
        <a
          href="tel:108"
          className="flex-1 sm:flex-initial px-3.5 py-2 bg-white dark:bg-slate-800 border border-red-300 hover:bg-red-50 text-red-700 dark:text-red-300 rounded-[10px] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <PhoneCall size={14} /> Call 108 (Ambulance)
        </a>
      </div>
    </div>
  );
};
```
*Apply to:*
* `SymptomLogger.tsx`: Trigger automatically whenever `severity === Severity.SEVERE` is logged for `SPOTTING`, `CRAMPING`, or `HEADACHE`.
* `ContractionTimer.tsx`: Replace plain-text 5-1-1 alert with the active `EmergencyTriageBanner`.
* `KickCounter.tsx`: Display during delayed movement sessions (<10 kicks in 2 hours).
* `VitalsTracker.tsx`: Display whenever systolic ≥ 160 or diastolic ≥ 110 (Hypertensive Crisis).

---

### Remediation 4: Legal Terms & Public Landing Page Disclaimers

1. **Update `TermsOfService` (`src/components/LegalPages.tsx`):**
   Add an explicit section:
   ```markdown
   ## 2. Compliance with Indian Law (PCPNDT Act, 1994)
   Our Pregnancy strictly adheres to The Pre-Conception and Pre-Natal Diagnostic Techniques (Prohibition of Sex Selection) Act, 1994 of India. The platform, its artificial intelligence algorithms, and medical report parsing tools strictly prohibit and refuse any determination, prediction, or disclosure of fetal sex or gender under any circumstances. Users are strictly prohibited from attempting to use the platform for fetal sex determination.
   ```
2. **Update `LandingPage.tsx` and `Footer.tsx`:**
   Add statutory educational disclaimer and PCPNDT compliance notice in the footer tier:
   ```html
   <p className="text-[11px] text-light/80 mt-2 max-w-[800px] mx-auto text-center leading-relaxed">
     Disclaimer: Our Pregnancy is a maternal health literacy and planning companion. It is not a medical device and does not provide clinical diagnoses. Always consult your obstetrician or doctor for medical advice. In strict compliance with the PCPNDT Act, 1994, Our Pregnancy does not determine or disclose fetal sex.
   </p>
   ```
3. **Clarify Baby Names Header (`BabyNames.tsx`):**
   Add a subtext below the title:
   `"Naming inspiration only. In strict accordance with the PCPNDT Act 1994, Bloom AI does not predict or determine fetal sex."`

---

## 5. Auditor Recommendation & Next Steps

* **Status:** 🔴 **BLOCKED FOR RELEASE** until Remediations 1, 2, 3, and 4 are committed and verified.
* **Estimated Engineering Effort:** ~2.5 hours (pure frontend + cloud function updates, zero schema breaking changes).
* **Next Step:** Present this audit report to the user and request authorization to execute the remediation plan.
