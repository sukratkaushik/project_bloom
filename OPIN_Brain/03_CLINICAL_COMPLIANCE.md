# OPIN Clinical Compliance & Regulatory Guardrails

> **CRITICAL STANDING RULE:** All agents and developers must adhere to these legal and clinical standards. Violating these rules can lead to criminal liability (PCPNDT Act) or severe regulatory penalties (DPDP Act).

---

## 1. PCPNDT Act Compliance (India) — ZERO TOLERANCE
* **The Law:** Pre-Conception and Pre-Natal Diagnostic Techniques (PCPNDT) Act, 1994 strictly prohibits the determination and disclosure of the sex/gender of a fetus.
* **Strict Application Guardrails:**
  * The app, AI chat, report parsers, and doctor portal must **NEVER** predict, determine, analyze, or discuss fetal gender or sex.
  * System prompts must include hard refusal boundaries against ultrasound gender queries ("boy or girl", "gender prediction", "nub theory", "ramzi theory").
  * Medical report uploads must filter or redact any accidental or overseas gender markers before display.

---

## 2. Medical Device & Diagnostic Boundaries
* **Status:** Our Pregnancy is a **health literacy and self-tracking companion**, NOT a regulated Software as a Medical Device (SaMD) or diagnostic tool.
* **Requirements:**
  * **No Automated Diagnosis:** The app must never state "You have preeclampsia" or "You have gestational diabetes." Instead, phrase as: *"Your blood pressure reading is elevated compared to standard clinical thresholds. Please share this log with your doctor immediately."*
  * **Universal Disclaimers:** Every clinical section (Contraction Timer, Kick Counter, Food Scanner, Medical Parser) must prominently display:
    > *"Educational guidance only. Always consult your obstetrician or midwife for medical evaluation."*
  * **Emergency Warnings:** Any acute red flags (heavy bleeding, sudden vision changes, severe abdominal pain, 5-1-1 contraction rule) must provide immediate 112/emergency and hospital triage prompts.

---

## 3. Data Protection (DPDP Act 2023 & GDPR Standards)
* **Local-First Default:** All health logs belong exclusively to the patient and reside in local browser storage by default.
* **Granular, Distinct Consent:**
  * Linking a doctor via QR code requires an explicit, separate consent confirmation.
  * The patient must see exactly which categories (kicks, BP, reports) are being shared before granting access.
  * **Immediate Revocation:** The patient has an unconditional right to revoke doctor access at any time; access must terminate instantly.
* **Grandfathering Pattern:** Follow the codebase convention `consent === false` (explicit denial) to avoid breaking existing users while respecting opt-outs.
