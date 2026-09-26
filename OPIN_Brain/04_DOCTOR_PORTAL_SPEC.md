# OPIN Doctor Portal (B2B2C) Specification

## 1. Core Philosophy: The 90-Second Clinical Triage
Doctors will never log their own kicks, track water intake, or pack hospital bags. **Do not replicate patient tracking tabs for doctors.**

The Doctor Portal exists for one purpose: **Allow an OB-GYN to review a patient's complete pregnancy vitals and red flags in under 90 seconds.**

---

## 2. The 3 Core Screens in V1

### Screen 1: Patient Roster & Triage
* **Purpose:** The doctor opens this on their clinic iPad or desktop every morning.
* **Layout:** A list of active patients sorted by clinical urgency:
  * 🔴 **High Alert:** Elevated Blood Pressure (≥ 140/90 mmHg), reduced fetal movement session (<10 kicks in 2 hours), or active labor signals (5-1-1 contraction rule).
  * 🟡 **Watch List:** Approaching due date, missed prenatal logs, or high-risk flags (IVF, twin gestation).
  * 🟢 **Normal:** Routine gestational progression.

### Screen 2: Single Patient Record (90-Second Read)
* **Demographics & Gestation:** Due date, gestational age (e.g., Week 28 + 4 days), risk tags.
* **Vitals & Trends:** Graph of systolic/diastolic BP over time, maternal weight curve.
* **Kick Trends:** Daily kick session durations and counts.
* **Labor Readiness:** Contraction frequency/duration if in the third trimester.
* **Lab & Report History:** Plain-language AI-parsed summaries of ultrasound scans and bloodwork.
* **Action:** One-click button to export FHIR R4 JSON bundle or print a PDF clinical note.

### Screen 3: Clinic QR Code & Onboarding Generator
* **Purpose:** The doctor's clinic desk standee.
* **Mechanism:** Displays the doctor's unique registration code and QR link (e.g., `ourpregnancy.in/link?doc=DR_SHARMA`).
* **Incentive:** Automatically activates a 90-day VIP pass (`VIPCARE90`) for the patient upon scanning and consenting.
