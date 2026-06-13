# Our Pregnancy — YOUR Pregnancy Companion 

> A comprehensive pregnancy companion that helps expectant parents track milestones, health vitals, tasks, and decisions — securely synced across devices via Firebase, with offline support via IndexedDB.

🌐 **Live at [ourpregnancy.in](https://ourpregnancy.in)**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646cff.svg)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Installable-brightgreen.svg)]()
[![Firebase](https://img.shields.io/badge/Firebase-Hosted-FFCA28.svg)](https://ourpregnancy.in)

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
   - [High-Level Architecture Diagram](#high-level-architecture-diagram)
   - [Component Hierarchy](#component-hierarchy-uml-component-diagram)
   - [Entity-Relationship Diagram](#entity-relationship-er-diagram)
   - [State Management Flow](#state-management-flow)
   - [Peer-to-Peer Sync Sequence Diagram](#peer-to-peer-sync-sequence-diagram)
5. [Project Structure](#project-structure)
6. [Getting Started](#getting-started)
7. [Environment Variables](#environment-variables)
8. [License](#license)

---

## Overview

**Bloom** (branded as **Our Pregnancy**) is a React + TypeScript Progressive Web App (PWA) designed as an all-in-one pregnancy planner. It guides users through all three trimesters with curated checklists, medical appointment tracking, financial planning, health logging, and AI-powered tools — all while prioritising **data privacy** through local-first storage with IndexedDB (Dexie.js).

The app is live at **[ourpregnancy.in](https://ourpregnancy.in)** and supports:

- **Offline operation** via PWA service workers
- **Peer-to-peer partner sync** via WebRTC (PeerJS) — no central server needed for sharing
- **Google Authentication** via Firebase Auth with custom domain branding
- **Firebase Hosting** on custom domain (`ourpregnancy.in`) with SSL
- **AI integration** via secure Firebase Cloud Functions proxying Hugging Face models (Qwen2.5-72B for text, Qwen2.5-VL-72B for vision) — no API keys exposed client-side
- **FHIR R4 interoperability** for exporting health data to enterprise EHR systems (Epic, Cerner)
- **PDF export** of the entire pregnancy care plan via jsPDF

---

## Key Features

| Category | Features |
|---|---|
| **Pregnancy Tracker** | Week-by-week baby development with fruit-size comparisons, body changes, trimester progress |
| **Task Management** | Curated checklists for Development milestones, Medical appointments, Preparation, Financial tasks, Deadlines, Postpartum — filterable by trimester, work situation, and pregnancy flags (high-risk, multiples, IVF, mental health) |
| **Health Tracking** | Kick counter, Contraction timer, Vitals tracker (BP & weight), Mood tracker, Hydration tracker, Nutrition/supplement tracker, Symptom logger |
| **AI-Powered Tools** | Food safety scanner (Qwen VL-72B Vision), AskOurPregnancy chatbot, Baby name generator with cultural/meaning filters, PDF/TXT document parsing |
| **Planning Tools** | Birth plan builder, Hospital bag checklist, Government schemes finder, Decision tracker (birth setting, pain relief, feeding, etc.) |
| **Labor Readiness** | Predictive labor readiness score using biometrics (HRV, RHR, BBT, Braxton Hicks frequency) |
| **Partner Sync** | Real-time P2P data sync via WebRTC with granular permission controls (read-only / edit, per-section exclusions) |
| **Export** | Full PDF export of pregnancy plan, decisions, checklists, vitals, and hospital bag |
| **EHR Integration** | FHIR R4 compliant data mapping for Blood Pressure, Weight, and Fetal Kick Count with OAuth 2.0 EHR client |
| **UI/UX** | Calm Mode (reduces visual clutter), Dark Mode, critical-only filter, responsive design, installable PWA |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 with TypeScript |
| **Build Tool** | Vite 6 with HMR |
| **Styling** | Tailwind CSS 4 (via `@tailwindcss/vite`) |
| **State Management** | React Context API (`PlannerProvider` / `usePlanner` hook) |
| **Local Database** | Dexie.js (IndexedDB wrapper) — 7 object stores |
| **Authentication** | Firebase Auth (Google Sign-In) |
| **Cloud Persistence** | Firebase Firestore (optional, for state backup) |
| **AI / ML** | Hugging Face Inference API via Firebase Cloud Functions — `Qwen/Qwen2.5-72B-Instruct` (text), `Qwen/Qwen2.5-VL-72B-Instruct` (vision) |
| **P2P Sync** | PeerJS (WebRTC) for real-time partner data sync |
| **PDF Export** | jsPDF |
| **EHR Interop** | Custom FHIR R4 mapper + OAuth 2.0 client |
| **PWA** | vite-plugin-pwa with auto-update service worker |
| **Icons** | Lucide React |

---

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BLOOM PWA (Client)                          │
│                                                                     │
│  ┌────────────┐  ┌───────────────┐  ┌────────────────────────────┐ │
│  │  Landing   │→ │ SetupScreen   │→ │        Dashboard           │ │
│  │   Page     │  │ (Onboarding)  │  │   (20+ feature sections)   │ │
│  └────────────┘  └───────────────┘  └────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              State Management (React Context)                 │  │
│  │            PlannerProvider  →  usePlanner() hook              │  │
│  └───────────────────┬───────────────────────┬──────────────────┘  │
│                      │                       │                      │
│  ┌───────────────────▼──────┐  ┌─────────────▼────────────────┐   │
│  │  Dexie.js (IndexedDB)    │  │  Firebase Firestore (Cloud)  │   │
│  │  • kickSessions          │  │  • State backup/restore      │   │
│  │  • contractionSessions   │  │  • Cross-device persistence  │   │
│  │  • vitalsLogs            │  └──────────────────────────────┘   │
│  │  • moodLogs              │                                      │
│  │  • hydrationLogs         │  ┌──────────────────────────────┐   │
│  │  • supplementLogs        │  │  SyncEngine (PeerJS/WebRTC)  │   │
│  │  • symptomLogs           │  │  • Host / Connect modes      │   │
│  └──────────────────────────┘  │  • Permission-based sharing  │   │
│                                 │  • Bidirectional state sync  │   │
│                                 └──────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
         ┌──────────────┼──────────────────────────┐
         ▼              ▼                          ▼
  ┌─────────────┐ ┌──────────────────────────┐ ┌────────────┐
  │  Firebase   │ │  Firebase Cloud Functions │ │  EHR/FHIR  │
  │  Auth       │ │  (asia-south1 / Mumbai)  │ │  Server    │
  │  (Google)   │ │  ├─ chatWithAI           │ │ (Epic etc) │
  └─────────────┘ │  ├─ analyzeFood          │ └────────────┘
                  │  └─ parseDocument         │
                  │         │                  │
                  │         ▼                  │
                  │  Hugging Face Inference    │
                  │  (Qwen2.5-72B / VL-72B)   │
                  └──────────────────────────┘
```

### Component Hierarchy (UML Component Diagram)

```
                              ┌──────────┐
                              │   App    │
                              │ (Router) │
                              └────┬─────┘
                                   │
            ┌──────────────────────┼───────────────────────┐
            │                      │                       │
     ┌──────▼───────┐  ┌──────────▼──────────┐  ┌─────────▼──────┐
     │ LandingPage  │  │    SetupScreen      │  │   Dashboard    │
     │ (Auth + CTA) │  │ (Multi-step wizard) │  │                │
     └──────────────┘  └─────────────────────┘  └───────┬────────┘
                                                        │
                                         ┌──────────────┼──────────┐
                                         │              │          │
                                   ┌─────▼─────┐ ┌─────▼────┐ ┌───▼───┐
                                   │  Sidebar  │ │  Header  │ │ Main  │
                                   │ (Nav)     │ │ (Stats)  │ │Content│
                                   └───────────┘ └──────────┘ └───┬───┘
                                                                  │
  ┌───────────────────────────────────────────────────────────────┐
  │                    Dashboard Sections (21 pages)               │
  ├──────────────────┬──────────────────┬──────────────────────────┤
  │ PregnancyTracker │ Development      │ Medical                  │
  │ Preparation      │ Financial        │ Decisions                │
  │ Deadlines        │ Postpartum       │ SymptomLogger            │
  │ LaborReadiness   │ FoodScanner      │ AskBloom (AI Chatbot)    │
  │ KickCounter      │ ContractionTimer │ VitalsTracker            │
  │ MoodTracker      │ HydrationTracker │ NutritionTracker         │
  │ HospitalBag      │ BirthPlanBuilder │ GovernmentSchemes        │
  │ BabyNames        │ PartnerSync      │ Notes                    │
  │ Profile          │                  │                          │
  └──────────────────┴──────────────────┴──────────────────────────┘
```

### Entity-Relationship (ER) Diagram

The app uses two storage layers: **Dexie.js (IndexedDB)** for time-series health data and **React Context + Firestore** for planning state. All Dexie tables share a `journeyId` foreign key that ties records to a specific pregnancy journey.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     DEXIE.JS (IndexedDB) — BloomDB v3                   │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────┐         ┌─────────────────────────┐
  │   kickSessions      │         │  contractionSessions    │
  ├─────────────────────┤         ├─────────────────────────┤
  │ PK  id (auto++)     │         │ PK  id (auto++)         │
  │ FK  journeyId ──────┼────┐    │ FK  journeyId ──────────┼────┐
  │     kicks: Array     │    │    │     contractions: Array  │    │
  │     startTime        │    │    │     startTime            │    │
  │     endTime          │    │    │     endTime              │    │
  │     targetKicks      │    │    │     ended                │    │
  └─────────────────────┘    │    └─────────────────────────┘    │
                              │                                   │
  ┌─────────────────────┐    │    ┌─────────────────────────┐    │
  │    vitalsLogs       │    │    │      moodLogs           │    │
  ├─────────────────────┤    │    ├─────────────────────────┤    │
  │ PK  id (auto++)     │    │    │ PK  id (auto++)         │    │
  │ FK  journeyId ──────┼────┤    │ FK  journeyId ──────────┼────┤
  │     timestamp        │    │    │     timestamp            │    │
  │     type (BP|Weight) │    │    │     mood                 │    │
  │     systolic?        │    │    │     energy               │    │
  │     diastolic?       │    │    │     notes?               │    │
  │     pulse?           │    │    └─────────────────────────┘    │
  │     weight?          │    │                                   │
  │     unit?            │    │    ┌─────────────────────────┐    │
  │     notes?           │    │    │    hydrationLogs        │    │
  └─────────────────────┘    │    ├─────────────────────────┤    │
                              │    │ PK  id (auto++)         │    │
  ┌─────────────────────┐    │    │ FK  journeyId ──────────┼────┤
  │  supplementLogs     │    │    │     timestamp            │    │
  ├─────────────────────┤    │    │     glasses              │    │
  │ PK  id (auto++)     │    │    │     goal                 │    │
  │ FK  journeyId ──────┼────┤    │     notes?               │    │
  │     timestamp        │    │    └─────────────────────────┘    │
  │     supplements[]    │    │                                   │
  │     notes?           │    │    ┌─────────────────────────┐    │
  └─────────────────────┘    │    │     symptomLogs         │    │
                              │    ├─────────────────────────┤    │
                              │    │ PK  id (auto++)         │    │
                              └────│ FK  journeyId ──────────┼────┘
                                   │     timestamp            │
                                   │     symptoms[]           │
                                   │     severity             │
                                   │     notes?               │
                                   └─────────────────────────┘

  All tables indexed on: [id, journeyId]
```

#### PlannerState (React Context + Firestore)

```
┌───────────────────────────────────────────────────────────────┐
│                     PlannerState                              │
├───────────────────────────────────────────────────────────────┤
│  Profile & Setup                                              │
│  ├─ dueDate, lmp, t1End, t2End                               │
│  ├─ pregnancyNum (first | subsequent)                         │
│  ├─ workSit (employed | selfemployed | remote | ...)          │
│  ├─ flags: { highRisk, multiples, ivf, mentalHealth }         │
│  ├─ isSetup, hasStartedOnboarding                             │
│  └─ activeJourneyId (links to Dexie FK)                       │
│                                                               │
│  Task Tracking                                                │
│  ├─ checked: Record<taskId, boolean>                          │
│  ├─ assigned: Record<taskId, string>                          │
│  ├─ assigneeNotes: Record<taskId, string>                     │
│  ├─ deletedTasks: Record<taskId, boolean>                     │
│  └─ customTasks: CustomTask[]                                 │
│                                                               │
│  Financial                                                    │
│  ├─ budgetEst: Record<itemId, number>                         │
│  ├─ budgetAct: Record<itemId, number>                         │
│  └─ customBudgetItems: BudgetItem[]                           │
│                                                               │
│  Decisions & Planning                                         │
│  ├─ decisions: Record<decisionId, string>                     │
│  ├─ decisionNotes: Record<decisionId, string>                 │
│  ├─ birthPlan: Record<string, any>                            │
│  ├─ hospitalBagItems: HospitalBagItem[]                       │
│  ├─ notes: Record<sectionId, string>                          │
│  └─ favoriteNames: BabyName[]                                 │
│                                                               │
│  UI Preferences                                               │
│  ├─ critFilter: boolean                                       │
│  ├─ isCalmModeActive: boolean                                 │
│  └─ isDarkModeActive: boolean                                 │
│                                                               │
│  Sync                                                         │
│  ├─ syncPermissions: { mode, excludedTaskIds, per-section }   │
│  └─ isPartnerReadOnly: boolean                                │
└───────────────────────────────────────────────────────────────┘
```

### State Management Flow

```
  ┌──────────────────────────────────────────────────────────┐
  │                   PlannerProvider                         │
  │                                                          │
  │  ┌────────────────────┐    ┌──────────────────────────┐  │
  │  │  useState(state)   │◄───│  Firebase onSnapshot()   │  │
  │  │                    │    │  (load on auth change)    │  │
  │  └────────┬───────────┘    └──────────────────────────┘  │
  │           │                                              │
  │  ┌────────▼───────────┐                                  │
  │  │  updateState(patch) │                                  │
  │  │  (merges partial)   │                                  │
  │  └────────┬───────────┘                                  │
  │           │                                              │
  │           ├──────────────────┐                            │
  │           │                  │                            │
  │  ┌────────▼──────────┐  ┌───▼──────────────────────┐    │
  │  │  setState(merged) │  │  saveToFirestore(merged)  │    │
  │  │  (local render)   │  │  (debounced cloud save)   │    │
  │  └───────────────────┘  └──────────────────────────┘    │
  │                                                          │
  │  useEffect: on state change → syncEngine.broadcastState()│
  └──────────────────────────────────────────────────────────┘

  Components access state via:
    const { state, updateState } = usePlanner();
```

### Peer-to-Peer Sync Sequence Diagram

```
  Partner A (Host)                    Partner B (Joiner)
  ══════════════                      ══════════════════
       │                                    │
       │  1. initHost()                     │
       │  ───────────►                      │
       │  PeerJS generates ID               │
       │                                    │
       │  2. Share Peer ID (QR/text)        │
       │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─►│
       │                                    │
       │                3. connectToPartner(peerId)
       │                ◄───────────────────│
       │                                    │
       │  4. WebRTC DataChannel opens       │
       │  ◄─────────────────────────────────│
       │                                    │
       │  5. broadcastState(filteredState)   │
       │  ─────────────────────────────────►│
       │     { state: {...},                │
       │       dexie: {kickSessions, ...},  │
       │       config: {mode: 'edit'} }     │
       │                                    │
       │  6. onStateReceived()              │
       │  ◄─────────────────────────────────│
       │     Partner B sends their state    │
       │                                    │
       │  7. Continuous bidirectional sync   │
       │  ◄────────────────────────────────►│
       │     (filtered by syncPermissions)  │
       │                                    │

  Permission Controls:
  ┌──────────────────────────────────────────────┐
  │  syncPermissions: {                          │
  │    mode: 'edit' | 'read',                    │
  │    excludedTaskIds: string[],                │
  │    dev, prep, medical, finance, ...: boolean │
  │  }                                           │
  └──────────────────────────────────────────────┘
```

### FHIR Integration Class Diagram

```
  ┌────────────────────────────────────────┐
  │         fhirIntegration.ts             │
  ├────────────────────────────────────────┤
  │                                        │
  │  «interface» BloomBloodPressure        │
  │  «interface» BloomWeight               │
  │  «interface» BloomFetalKick            │
  │        │                               │
  │        ▼  (mapped by)                  │
  │  mapBloodPressureToFHIR() ──┐          │
  │  mapWeightToFHIR() ─────────┤          │
  │  mapFetalKickCountToFHIR() ─┘          │
  │        │                               │
  │        ▼  produces                     │
  │  «interface» FHIRObservation (R4)      │
  │  «interface» FHIRCodeableConcept       │
  │  «interface» FHIRQuantity              │
  │        │                               │
  │        ▼  consumed by                  │
  │  ┌──────────────────────────────────┐  │
  │  │      EHRFHIRClient              │  │
  │  ├──────────────────────────────────┤  │
  │  │ - config: EHRClientConfig       │  │
  │  │ - accessToken: string           │  │
  │  │ - tokenExpiresAt: number        │  │
  │  ├──────────────────────────────────┤  │
  │  │ - authenticate(): Promise<str>  │  │
  │  │ + postObservation(obs): boolean │  │
  │  └──────────────────────────────────┘  │
  │        │                               │
  │        ▼  connects to                  │
  │  EHR Server (Epic / Cerner)            │
  │  via OAuth 2.0 Client Credentials      │
  └────────────────────────────────────────┘
```

---

## Project Structure

```
Project_Bloom/
├── index.html                    # HTML entry point (SEO meta tags)
├── package.json                  # Dependencies & scripts
├── vite.config.ts                # Vite + PWA + Tailwind config
├── tsconfig.json                 # TypeScript config
├── metadata.json                 # App metadata
├── firebase.json                 # Firebase Hosting config (SPA rewrites)
├── .firebaserc                   # Firebase project binding
├── firebase-applet-config.json   # Firebase project credentials
├── firestore.rules               # Firestore security rules
├── OPstatus.md                   # Project status log (changelog)
├── AGENTS.md                     # AI agent instructions
├── functions/                    # Firebase Cloud Functions (backend)
│   ├── package.json              # Backend dependencies (pdf-parse, etc.)
│   ├── tsconfig.json
│   └── src/
│       └── index.ts              # chatWithAI, analyzeFood, parseDocument
├── public/                       # Static assets (PWA icons, logo)
│   ├── logo.png
│   ├── pwa-192x192.svg
│   └── pwa-512x512.svg
├── branding/                     # Brand assets (protected — do not modify)
│   └── logos/
└── src/
    ├── index.css                 # Tailwind imports + custom theme
    ├── main.tsx                  # React entry point
    ├── App.tsx                   # Root component (hash-based routing)
    ├── types.ts                  # TypeScript interfaces & types
    ├── store.tsx                 # PlannerProvider (Context + Firestore)
    ├── db.ts                     # Dexie.js database schema (BloomDB v3)
    ├── firebase.ts               # Firebase init, Auth (popup + redirect), Firestore
    ├── syncEngine.ts             # PeerJS WebRTC sync engine
    ├── data.ts                   # Static task/decision/budget data
    ├── weeklyData.ts             # Week-by-week pregnancy development data
    ├── utils.ts                  # Date formatting utilities
    ├── utils/
    │   ├── fhirIntegration.ts    # FHIR R4 mappers + EHR OAuth client
    │   ├── laborPrediction.ts    # Predictive labor readiness algorithm
    │   └── pdfExport.ts          # jsPDF pregnancy plan export
    ├── landing/
    │   └── LandingPage.tsx       # Marketing landing page with Google Auth
    └── components/
        ├── SetupScreen.tsx       # Multi-step onboarding wizard
        ├── Dashboard.tsx         # Main dashboard shell
        ├── Sidebar.tsx           # Navigation sidebar
        ├── TaskCard.tsx          # Reusable task checklist card
        ├── LegalPages.tsx        # Privacy Policy & Terms of Service
        ├── FloatingChatbot.tsx   # AI chatbot overlay
        ├── SplashScreen.tsx      # Loading splash screen
        └── sections/             # Feature-specific pages (29 sections)
            ├── PregnancyTracker.tsx
            ├── Development.tsx
            ├── Medical.tsx
            ├── Preparation.tsx
            ├── Financial.tsx
            ├── Decisions.tsx
            ├── Deadlines.tsx
            ├── Postpartum.tsx
            ├── SymptomLogger.tsx
            ├── LaborReadiness.tsx
            ├── FoodScanner.tsx
            ├── AskOurPregnancy.tsx
            ├── KickCounter.tsx
            ├── ContractionTimer.tsx
            ├── VitalsTracker.tsx
            ├── MoodTracker.tsx
            ├── HydrationTracker.tsx
            ├── NutritionTracker.tsx
            ├── HospitalBag.tsx
            ├── BirthPlanBuilder.tsx
            ├── GovernmentSchemes.tsx
            ├── BabyNames.tsx
            ├── PartnerSync.tsx
            ├── DailyKnowledgeDrop.tsx
            ├── Notes.tsx
            ├── Profile.tsx
            └── Feedback.tsx
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- A **Firebase project** with Authentication (Google provider), Firestore, and Cloud Functions enabled
- A **Hugging Face API key** stored in Firebase Secret Manager (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/sukratkaushik/Project_Bloom.git
cd Project_Bloom

# Install dependencies
npm install
```

### Configuration

Firebase configuration is stored in `firebase-applet-config.json`. AI keys are managed via Firebase Secret Manager:

```bash
# Set your Hugging Face API key in Firebase Secret Manager
firebase functions:secrets:set HUGGINGFACE_API_KEY

# Firebase project credentials are in firebase-applet-config.json
# Update with your project's values
```

For EHR integration (optional):

```env
EHR_CLIENT_ID=your_ehr_client_id
EHR_CLIENT_SECRET=your_ehr_client_secret
EHR_TOKEN_ENDPOINT=https://authorization.epic.com/oauth2/token
EHR_FHIR_BASE_URL=https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4
```

### Development

```bash
# Start the development server
npm run dev

# Build for production
npm run build
```

The app runs on `http://localhost:5173` by default.

---

## Deployment

The app is deployed on **Firebase Hosting** at [ourpregnancy.in](https://ourpregnancy.in).

### Deploy Commands

```bash
# Build production bundle
npm run build

# Deploy to Firebase Hosting only
firebase deploy --only hosting

# Deploy Cloud Functions only
firebase deploy --only functions

# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy everything (hosting + functions + firestore rules)
firebase deploy
```

### Custom Domain Setup

- **Domain:** `ourpregnancy.in` (registered on GoDaddy)
- **DNS:** A record → `199.36.158.100` (Firebase Hosting IP)
- **SSL:** Automatically provisioned by Firebase
- **Auth Domain:** `ourpregnancy.in` (Google sign-in shows branded domain)

### Firebase Services Used

| Service | Purpose |
|---|---|
| **Hosting** | Serves the SPA with CDN, custom domain, and SSL |
| **Authentication** | Google Sign-In (popup with redirect fallback) |
| **Firestore** | Cloud persistence for planner state and journey data |
| **Cloud Functions (2nd Gen)** | Secure AI backend (`chatWithAI`, `analyzeFood`, `parseDocument`) deployed in `asia-south1` |
| **Secret Manager** | Stores `HUGGINGFACE_API_KEY` — never exposed to the client |

---

## Environment Variables

| Variable | Location | Required | Description |
|---|---|---|---|
| `HUGGINGFACE_API_KEY` | Firebase Secret Manager | Yes | Hugging Face API key for AI features (chatbot, food scanner, name generator) |
| `EHR_CLIENT_ID` | `.env` | No | OAuth 2.0 client ID for EHR FHIR integration |
| `EHR_CLIENT_SECRET` | `.env` | No | OAuth 2.0 client secret for EHR FHIR integration |
| `EHR_TOKEN_ENDPOINT` | `.env` | No | OAuth 2.0 token endpoint URL |
| `EHR_FHIR_BASE_URL` | `.env` | No | FHIR R4 base URL for the EHR server |

Firebase configuration is stored in `firebase-applet-config.json` and imported by `src/firebase.ts`. AI keys are **never** bundled into the frontend — they are stored in Secret Manager and accessed only by Cloud Functions.

---

## License

This project is licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.
