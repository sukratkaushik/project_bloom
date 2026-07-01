# Product Vision & Feature Scope

## 1. Executive Summary

### The Vision
**Bloom** (branded as **Our Pregnancy**) is a local-first, privacy-respecting, all-in-one digital companion for the pregnancy journey. Our vision is to empower expectant parents with advanced AI tools, medical trackers, and peer-to-peer partner synchronization—all while maintaining absolute data sovereignty. By storing records locally on-device and utilizing peer-to-peer sync, Bloom ensures that sensitive medical data remains private, secure, and out of the hands of advertising brokers.

### The Problem
Traditional pregnancy tracking apps frequently exploit user trust, harvesting and selling sensitive maternal health data to insurance agencies and advertisers. Furthermore, standard applications are plagued by disruptive ads, lack offline functionality during critical labor moments, and fail to provide clinical interoperability, leaving parents with fragmented, commercialized tools during their most vulnerable journey.

### The Business Potential
Positioned in the rapidly expanding **FemTech** sector (projected to reach $75 Billion globally by 2030), Bloom targets the high-value segment of privacy-conscious parents. Utilizing a freemium SaaS model, it offers premium AI-driven features (food scanners, medical document analysis) alongside its offline-first core trackers. Its compliance with the **FHIR R4** standard sets up lucrative enterprise B2B integration pathways with hospitals, private clinics, and obstetric networks, creating a robust, multi-stream revenue engine.

---

## 2. Feature Breakdown

### 🤰 Pregnancy Tracker
* **Vision:** A visual guide that demystifies fetal growth.
* **Approach:** Displays a week-by-week timeline of baby milestones, size analogies, and maternal body changes using dynamic slider controls.
* **Scope:** Covers weeks 1 to 40 with growth metrics, development reports, and trimester indicators.

### 🍎 Baby Size Comparison
* **Vision:** Relatable baby scale comparisons.
* **Approach:** Uses unique, non-repeated plant, fruit, and object emojis to represent the baby's size week-by-week.
* **Scope:** 40 custom size levels, length/weight progress cards, and a medical disclaimer.

### 📚 Daily Knowledge Drop
* **Vision:** Delivering evidence-based maternal education.
* **Approach:** Displays a fresh, bite-sized health card daily containing clinically backed tips tailored to the current week of pregnancy.
* **Scope:** Dynamically rotates advice cards based on gestational age and developmental status.

### 💬 AskOurPregnancy AI Chatbot
* **Vision:** Instant, safe, and context-aware clinical answers.
* **Approach:** An LLM proxy system utilizing a serverless gateway to query Hugging Face without exposing API keys.
* **Scope:** Clinical-grade prompts with strict boundary guidelines and text/document attachment reading.

### 👶 Baby Name Generator
* **Vision:** Streamlining the name selection process.
* **Approach:** Uses AI to generate custom name ideas filtered by origin, starting letter, meaning, gender, and length.
* **Scope:** Multi-filter query form returning structured JSON name lists directly from the AI.

### 📝 Birth Plan Builder
* **Vision:** Empowering parent preferences in the delivery room.
* **Approach:** A step-by-step wizard capturing labor, delivery, pain management, and newborn care preferences.
* **Scope:** Interactive preferences form compiling data into printable PDF/text documents.

### ⏱️ Contraction Timer
* **Vision:** Precise labor onset tracking.
* **Approach:** An offline-capable stopwatch logging interval frequency, duration, and pain levels.
* **Scope:** Session logs, average trend tracking, and automated hospital recommendations.

### 🎯 Decision Tracker
* **Vision:** De-cluttering pregnancy choices.
* **Approach:** Guides users through binary choices on critical topics (like feeding, cord blood, and vaccinations).
* **Scope:** Logs choice status, research pros and cons, and exports reports.

### 💰 Financial Planner
* **Vision:** Eliminating delivery budget anxiety.
* **Approach:** An offline budget tool tracking nursery costs, delivery fees, and loss of income.
* **Scope:** Cost categorization, budget targets, and financial progress tracking.

### 🔍 Food Safety Scanner
* **Vision:** Instant dietary reassurance.
* **Approach:** Employs multimodal AI vision (Qwen2.5-VL) to analyze food safety via photo upload or text query.
* **Scope:** Secure Cloud Function scanner returning simple traffic-light safety ratings.

### 🏛️ Government Schemes Finder
* **Vision:** Maximizing access to social support.
* **Approach:** A searchable directory linking regional maternity benefit schemes to user eligibility criteria.
* **Scope:** Location-based schemes, benefit descriptions, and enrollment links.

### 👜 Hospital Bag Checklist
* **Vision:** Stress-free packing preparation.
* **Approach:** Checklists divided into separate tabs for mother, partner, and newborn baby.
* **Scope:** Item checkboxes, custom items, and visual progress indicator.

### 💧 Hydration Tracker
* **Vision:** Maintaining healthy amniotic fluid levels.
* **Approach:** Visual logger tracking daily target water consumption in cups/milliliters.
* **Scope:** Daily progress progress bar, quick-add buttons, and historical tracking logs.

### 👣 Fetal Kick Counter
* **Vision:** Daily reassurance of baby health.
* **Approach:** Active session tracker counting movements with time limits and automated logs.
* **Scope:** 10-kick session logs, average tracking duration, and abnormal movement prompts.

### 📈 Labor Readiness Score
* **Vision:** Predicting labor onset through biometrics.
* **Approach:** Uses algorithm scoring physical signs, fatigue, Braxton Hicks frequency, and optional vitals.
* **Scope:** Daily diagnostic scoring card and trend analysis.

### 📄 Medical Report Parser
* **Vision:** Translating complex laboratory metrics.
* **Approach:** Secure PDF/TXT document upload processed by a secure Cloud Function using clinical AI models.
* **Scope:** Plain-language explanations of test results, metrics, and abbreviations.

### 🧠 Mood & Mental Health Tracker
* **Vision:** Prioritizing maternal emotional wellness.
* **Approach:** Daily emotional slider logging mood score, physical feelings, and mental triggers.
* **Scope:** Visual trend charts and national helpline access cards.

### 💊 Nutrition & Supplement Tracker
* **Vision:** Guaranteeing daily prenatal vitamin intake.
* **Approach:** Checklist monitoring daily consumption of vitamins, folic acid, iron, and custom supplements.
* **Scope:** Custom checklists, logs, and daily recurrence timers.

### 🔗 Partner Sync (P2P)
* **Vision:** Direct, private data synchronization.
* **Approach:** Employs PeerJS (WebRTC) for direct device-to-device sharing without routing through server databases.
* **Scope:** Connection codes, sync status indicators, and selective section permission filters.

### ✈️ Safe Travel Planner
* **Vision:** Mitigating travel risks during trimesters.
* **Approach:** Questionnaire calculating trip risk based on trimester, duration, destination, and complications.
* **Scope:** Safety score breakdown, transit recommendations, and medical emergency checklist.

### 🩹 Symptom Logger
* **Vision:** Early warning system for physical changes.
* **Approach:** Checklist logging common symptoms (headaches, swelling) and checking against red flags.
* **Scope:** Severity trackers, symptom lists, and automatic clinical warning flags.

### 🩺 Vitals Tracker
* **Vision:** Home health tracking to clinical standards.
* **Approach:** Form log tracking blood pressure, weight, and blood sugar with FHIR-compliant export.
* **Scope:** Interactive growth graphs, logs, and FHIR R4 JSON export.

### 📋 Task Checklists
* **Vision:** Organizing timeline tasks.
* **Approach:** Staged list manager filterable by trimester, work situation, and medical status.
* **Scope:** Development, Medical, Prep, Deadlines, and Postpartum checklists with auto-save.
