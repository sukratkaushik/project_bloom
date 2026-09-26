# Full Stack of Agentic AI at Our Pregnancy (OPIN)

> **India's 1st Local-First Maternal Clinical Intelligence Platform**  
> Architecture & Technology Stack Reference

---

## Executive Summary

Our Pregnancy (OPIN) leverages an advanced, privacy-first **Agentic AI Stack** tailored specifically for maternal health. Unlike conventional cloud-dependent RAG applications that funnel sensitive patient records to third-party endpoints, OPIN executes on a **Local-First, Zero-Data-Leak** clinical paradigm:
- **Local-First Persistence:** Clinical tracking (kicks, contractions, vitals, nutrition) runs on Dexie.js (IndexedDB) with zero mandatory cloud sync.
- **P2P Synchronization:** Device-to-device partner mirroring via WebRTC (PeerJS) without storing health records on servers.
- **Serverless Clinical AI Gateway:** Multimodal clinical queries, lab report parsing, and food safety vision run via hardened Cloud Functions in `asia-south1` routing to Qwen 2.5-72B & Qwen 2.5-VL-72B with zero client API keys.
- **Clinical Triage Guardrails:** Strict compliance with FOGSI (Federation of Obstetric and Gynaecological Societies of India) and ACOG guidelines with automated emergency escalation (pre-eclampsia 140/90 mmHg, 5-1-1 labor rule).

---

## The 10 Layers of OPIN's Agentic AI Stack

```text
 ┌──────────────────────────────────────────────────────────────┐
 │ Layer 1:  Frontend & Mobile Clients                          │
 │           React 19 • Tailwind CSS 4 • Capacitor • Workbox PWA│
 ├──────────────────────────────────────────────────────────────┤
 │ Layer 2:  Multimodal Ingestion (Clinical Data)               │
 │           Tesseract OCR • USG/Lab PDF Parser • Camera Vision │
 ├──────────────────────────────────────────────────────────────┤
 │ Layer 3:  Chunking & Clinical Normalization                  │
 │           Trimester Slicer • FOGSI/ACOG • Dexie Schema Normal│
 ├──────────────────────────────────────────────────────────────┤
 │ Layer 4:  Embeddings & Clinical Vectors                      │
 │           BGE-Small Medical • MiniLM-L6 • Hugging Face Hub   │
 ├──────────────────────────────────────────────────────────────┤
 │ Layer 5:  Vector & Local Database                            │
 │           Dexie.js (BloomDB v3) • Firestore • WebRTC PeerJS  │
 ├──────────────────────────────────────────────────────────────┤
 │ Layer 6:  Retrieval & Context Layer                          │
 │           Gestational Timeline • Health Connect • Triage Engine│
 ├──────────────────────────────────────────────────────────────┤
 │ Layer 7:  Prompt Engineering & Clinical Guardrails           │
 │           Emergency Triage Rules • Indian Myth Buster Guard  │
 ├──────────────────────────────────────────────────────────────┤
 │ Layer 8:  Maternal LLMs & Vision                             │
 │           Qwen 2.5-72B Instruct • Qwen 2.5-VL-72B • Offline  │
 ├──────────────────────────────────────────────────────────────┤
 │ Layer 9:  Infra & Serverless Runtime                         │
 │           Firebase Functions (asia-south1) • Google Play AAB │
 ├──────────────────────────────────────────────────────────────┤
 │ Layer 10: Observability & Privacy Audit                      │
 │           Local Privacy Auditor • Secret Mgr • Health Audit  │
 └──────────────────────────────────────────────────────────────┘
```

---

## Detailed Layer Breakdown

### Layer 1: Frontend & Mobile Clients
* **React 19:** Functional components, React Context state (`PlannerProvider`), and hooks for immediate responsive interaction.
* **Tailwind CSS 4:** Unified design system (`@tailwindcss/vite`) with custom Sandalwood (`#FDFBF7`), Tulsi Mint (`#E9F5E9`), and Sage Green palettes.
* **Capacitor Android:** Native Android runtime compiling Project Bloom into signed APK and AAB packages for Google Play release.
* **Workbox PWA:** Service worker caching the entire application shell, offline clinical algorithms, and tracking tables.

### Layer 2: Multimodal Ingestion (Clinical Data & Documents)
* **Tesseract OCR:** Client-side optical character recognition extracting numerical vitals from physical lab printouts.
* **USG & Biomarker Parser:** Structured extraction of ultrasound markers (CRL, BPD, AC, FL, AFI) and maternal blood panels (CBC, HbA1c, OGTT, TSH).
* **Camera Vision Ingestion:** Direct mobile camera capture for food plate safety checks (papaya, unpasteurized cheese, caffeine audit).
* **Audio / STT Input:** Web Speech & Whisper integration allowing expectant mothers to log symptoms and kick counts hands-free.

### Layer 3: Chunking & Clinical Normalization
* **Gestational Week Slicer:** Slices maternal knowledge and medical records strictly by week (Week 1 through Week 42) and trimester.
* **FOGSI & ACOG Guideline Normalizer:** Maps symptom descriptions against Indian clinical obstetric protocols and international standards.
* **Dexie Schema Normalizer:** Structures raw user inputs into 7 typed stores: Journeys, Kicks, Contractions, Vitals, Mood, Hydration, Supplements.
* **FHIR R4 Clinical Transformer:** Standardizes blood pressure, glucose, and fetal movements into HL7 FHIR Observation and CarePlan schemas.

### Layer 4: Embeddings & Clinical Vectors
* **BGE-Small Medical:** Specialized dense representations for clinical terms, trimester symptoms, and anatomical descriptions.
* **MiniLM-L6:** Ultra-fast, low-memory semantic search for offline and mobile vector comparisons.
* **Hugging Face Inference:** Vector representation pipelines for maternal FAQs and evidence-based clinical papers.

### Layer 5: Vector & Local Database
* **Dexie.js (BloomDB v3):** Primary offline database using browser IndexedDB. Zero cloud latency; instant reads and writes even without cell connectivity.
* **Firebase Firestore (`asia-south1`):** Optional encrypted cloud vault for authenticated users seeking multi-device cloud backup.
* **WebRTC PeerJS (P2P Sync):** Real-time, direct device-to-device synchronization between mother and partner/father with no intermediate database.
* **FHIR R4 Portable Export:** User-controlled clinical export into encrypted JSON and PDF formats for obstetrician review.

### Layer 6: Retrieval & Context Layer
* **Gestational Timeline Engine:** Dynamically injects the mother's current week, baby size analogies, and trimester-specific physiological changes into every AI prompt.
* **Android Health Connect Bridge:** Queries native wearable sensors for heart rate, blood oxygen, sleep quality, and daily steps.
* **Clinical Triage Filter:** Real-time heuristic monitor triggering automated high-risk banners (BP $\ge$ 140/90 mmHg, 5-1-1 contraction rule, reduced fetal movement).
* **Indian Dietary Context:** Injects regional food items (ghee, saffron, dates, methi, jaggery, coconut water) into nutritional calculations.

### Layer 7: Prompt Engineering & Clinical Guardrails
* **Clinical Triage Guardrails:** Enforces non-prescriptive, supportive guidance; prevents hallucinated medication dosages; insists on physician consultation for red-flag symptoms.
* **Indian Myth Buster:** Evaluates traditional Ayurvedic advice and cultural folklore against modern evidence-based maternal medicine.
* **Trimester-Adaptive System Prompts:** Modulates tone and focus from First Trimester nausea/viability to Third Trimester birth planning and labor prep.

### Layer 8: Maternal LLMs & Vision
* **Qwen 2.5-72B Instruct:** Primary clinical reasoning model hosted on dedicated serverless endpoints for 24/7 natural conversational support.
* **Qwen 2.5-VL-72B:** Vision-language model evaluating photos of meal plates, prescription labels, and ultrasound report summaries.
* **Offline Heuristics Engine:** Deterministic rule-based clinical engine running on-device when internet connectivity is completely unavailable.
* **Structured JSON Output Enforcer:** Forces strict JSON output schemas for seamless UI rendering (cards, checklists, timeline events).

### Layer 9: Infra & Serverless Runtime
* **Firebase Cloud Functions (Node.js 20):** Serverless gateway hosted in Mumbai (`asia-south1`) guaranteeing sub-50ms latency in India.
* **Firebase Edge Hosting:** Globally distributed CDN serving optimized assets, custom domain SSL (`ourpregnancy.in`), and PWA manifests.
* **Google Play Release Pipeline:** Capacitor build pipeline generating production-ready Android application bundles (AAB).
* **Cloud Secret Manager:** Zero client API key policy; all Hugging Face and LLM credentials reside securely in serverless function environments.

### Layer 10: Observability & Privacy Audit
* **Local-Only Data Privacy Auditor:** Regular verification that tracking tables remain on-device unless explicitly synced by the user.
* **Self-Service Account Purge:** Hardened Cloud Function (`deleteMyOwnAccount`) permanently wiping Firestore documents, auth records, and local stores.
* **Client-Side Error Boundaries:** Graceful degradation and toast notifications preventing white screens during mobile connectivity drops.
* **Serverless Health Telemetry:** Error tracking and latency metrics via Firebase Console without tracking personally identifiable health data (PII).

---

*Document maintained by Project Bloom Engineering Team • Live in Production at [ourpregnancy.in](https://ourpregnancy.in)*
