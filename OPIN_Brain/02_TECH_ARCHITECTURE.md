# OPIN Technical Architecture & Stack

## 1. High-Level Architecture
Our Pregnancy is an offline-first Progressive Web App (PWA) with local-first persistence, serverless AI gateways, and P2P partner synchronization.

```text
┌────────────────────────────────────────────────────────────┐
│                    CLIENT ARCHITECTURE                     │
│                                                            │
│   React 19 + TypeScript 5.8 + Tailwind CSS 4 + Vite 6     │
│                                                            │
│   ┌────────────────────────────────────────────────────┐   │
│   │ Local Database: Dexie.js (IndexedDB)               │   │
│   │ 7 Stores: Journeys, Kicks, Contractions, Vitals,   │   │
│   │ Mood, Hydration, Supplements, Symptoms             │   │
│   └─────────────────────────┬──────────────────────────┘   │
│                             │ (Offline-First Reactivity)   │
│                             ▼                              │
│   ┌────────────────────────────────────────────────────┐   │
│   │ Workbox Service Worker (PWA Cache & Offline Shell) │   │
│   └────────────────────────────────────────────────────┘   │
└──────────────┬──────────────────────────────┬──────────────┘
               │                              │
      (Optional Sync/Auth)           (AI Multimodal Requests)
               ▼                              ▼
┌──────────────────────────────┐ ┌───────────────────────────┐
│       FIREBASE CLOUD         │ │  SERVERLESS AI GATEWAY    │
│  - Firebase Auth (Google)    │ │  - Cloud Functions Node   │
│  - Firestore (asia-south1)   │ │  - Qwen2.5-72B (Text)     │
│  - Custom Domain Hosting     │ │  - Qwen2.5-VL-72B (Vision)│
│  - Razorpay Payments         │ │  - Zero client API keys   │
└──────────────────────────────┘ └───────────────────────────┘
```

## 2. Core Technologies

### Frontend
* **UI Library:** React 19 (Hooks, Context API with `PlannerProvider`).
* **Language:** TypeScript 5.8 (Strict typing across state and stores).
* **Styling:** Tailwind CSS 4 (`@tailwindcss/vite`).
* **Icons:** Lucide React.
* **PWA & Offline:** `vite-plugin-pwa` with Workbox auto-updating service worker.

### Data Storage & State
* **Local-First Engine:** Dexie.js (IndexedDB wrapper, `BloomDB v3`). All tracking data (kicks, vitals, contractions, tasks) is stored locally first.
* **Reactivity:** `useLiveQuery` from `dexie-react-hooks` triggers instant UI updates without manual re-fetching.
* **P2P Partner Sync:** WebRTC via PeerJS for direct device-to-device sharing without intermediate cloud persistence.
* **Cloud Database:** Firebase Firestore (located in `asia-south1` for low latency in India).

### AI & Backend Processing
* **Gateway:** Firebase Cloud Functions in `asia-south1`.
* **Models:** Hugging Face Inference endpoints hosting `Qwen/Qwen2.5-72B-Instruct` (clinical chat, baby names, lab report parsing) and `Qwen/Qwen2.5-VL-72B-Instruct` (food safety scanner).
* **Security:** API keys and Hugging Face secrets live entirely inside Cloud Functions; zero tokens exposed to the client.

### Interoperability & Mobile Strategy
* **Clinical Export:** Native FHIR R4 mapper (`src/utils/fhirIntegration.ts`) converting blood pressure, weight, and kick metrics to HL7 Observation resources.
* **Mobile Bridge:** Capacitor-ready for zero-rewrite compilation to native Android APK/AAB and iOS packages.
