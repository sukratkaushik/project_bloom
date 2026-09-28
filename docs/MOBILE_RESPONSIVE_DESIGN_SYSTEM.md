# Mobile Responsive Design System & Architecture Specification
**Project Bloom / Our Pregnancy Android Application**  
*Document Version: 2.4.0 • Target Android API: 34+ • Multi-Device Matrix*

---

## 1. Executive Summary & Engineering Thesis

The Indian and global Android device ecosystem is characterized by extreme hardware fragmentation. Real-world users access maternal health applications on devices ranging from compact budget smartphones (e.g., Samsung Galaxy A/M series, Redmi, Vivo, Realme with **~360dp width**) to flagship devices (Google Pixel 8/9, Galaxy S24 with **412dp width**) and foldables.

Historically, hybrid and web-driven Android applications suffer from three critical architectural flaws:
1. **Viewport Clipping & Wrap Breakage:** Designing strictly against 412dp emulator profiles causes text, badges, and action buttons to wrap onto multiple lines or overflow card boundaries on 360dp hardware.
2. **Bottom Navigation Occlusion:** Floating Action Buttons (FABs) pinned to `bottom-20 right-4` collide directly with bottom navigation tabs (specifically the 5th "Vault" tab) when Android 3-button navigation (`||| O <`) raises the window viewport.
3. **Mismatched Grid Cards:** Unconstrained vertical card heights create asymmetric bento grids whenever localized text or dynamic metrics vary across categories.

To permanently eliminate UI distortion across **all** Android form factors, Project Bloom adheres to the **Zero-Occlusion, Density-Independent Mobile Architecture**.

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE TOP BAR (Sticky)                  │
│ [🌸 Our Pregnancy] [✨]    [+ Log] [🇮🇳 EN] [🛡️ 108] [M]     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  Wk 40 of 40   •   Day 280   •   Due: 25 Sept 2026     │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    SCROLLABLE CONTENT AREA                  │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ GESTATIONAL HERO (Live Trimester, Metric Row, Progress) │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ UPCOMING CHECKUP CARD                                   │ │
│ │ Dr. Priya Sharma • Cloudnine               [Scan Checklist]│ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌───────────────────────────┐ ┌───────────────────────────┐ │
│ │ VITALS: Blood Pressure    │ │ VITALS: Fetal Kicks       │ │
│ │ 118/76 mmHg               │ │ 3 / 10 today              │ │
│ │ Pulse 74 bpm              │ │ [+ 1 Kick]                │ │
│ └───────────────────────────┘ └───────────────────────────┘ │
│                                                             │
│ ┌───────────────────────────┐ ┌───────────────────────────┐ │
│ │ RITUAL: Kick Counter      │ │ RITUAL: Hydration Tracker │ │
│ │ 3 / 10 kicks              │ │ 0.25L / 2.5L              │ │
│ │ [+ 1 Kick]                │ │ [+ 250ml Glass]           │ │
│ └───────────────────────────┘ └───────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│            ZERO-OCCLUSION BOTTOM NAVIGATION DOCK            │
│    [📅 Today]  [🧭 Explore]  [🩺 Care]  [✨ AI]  [📁 Vault]  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Android Viewport & Density Tier Matrix

All UI components in Bloom must render deterministically across four standardized density buckets without layout breakage:

| Tier | Viewport Width | Typical Hardware | Target User Segment |
| :--- | :--- | :--- | :--- |
| **Compact (xs)** | **360dp – 380dp** | Samsung Galaxy A14/M14, Pixel 4a, Redmi Note, Realme C-series | ~65% of Indian & Tier 2/3 Maternal Users |
| **Standard (sm)** | **384dp – 400dp** | iPhone 13/14/15, Galaxy S22/S23 | Modern Standard Viewport |
| **Flagship (md)** | **412dp – 430dp** | Pixel 7/8/9 Pro, Galaxy S24+, OnePlus 12 | High-density Modern Flagships |
| **Tablet/Fold (lg+)**| **600dp – 768dp+** | Galaxy Z Fold, Pixel Fold, Tablets | Multi-column Large Screen |

### CSS Breakpoint Tokens (`src/index.css`)
Tailwind CSS v4 custom breakpoints are strictly declared as mobile-first tokens:
```css
@theme {
  --breakpoint-xs: 360px;
  --breakpoint-sm: 390px;
  --breakpoint-md: 412px;
  --breakpoint-lg: 640px;
  --breakpoint-xl: 768px;
}
```

---

## 3. The "Zero-Occlusion" Action Architecture

### 3.1 Elimination of the Floating Action Button (FAB)
* **Problem:** Pinned `fixed bottom-20 right-4` FABs sit ~80px above the screen bottom. On devices with Android 3-button navigation (`||| O <`), the navigation bar occupies 48dp–56dp, pushing the FAB upwards into direct collision with the 5th bottom tab ("Vault").
* **Solution:** Completely remove `SpeedDialFab.tsx` from the mobile viewport. Pinned floating buttons are prohibited in the mobile shell.

### 3.2 The Unified Header Action Bar (`MobileTopBar.tsx`)
Quick logging is elevated to the top header alongside critical maternal actions:
1. **Brand Identity:** `Our Pregnancy` with serif typography (`shrink-0 whitespace-nowrap`), accompanied by an inline PRO sparkle trigger.
2. **`+ Log` Pill Trigger:** Direct trigger that opens the `QuickLogSheet` bottom modal. On compact screens (<390px), the text "Log" is hidden (`hidden sm:inline`), collapsing the button into a pristine 28px `+` pill.
3. **Indic Language Picker (`🇮🇳 EN`):** Instant access to multilingual support (English, Hindi, Tamil, Telugu, Kannada, Bengali, Marathi).
4. **108 SOS Trigger:** One-tap emergency dispatch button styled in safety rose (`bg-rose-50 border-rose-200/90 text-rose-700`).
5. **Profile Avatar:** 28px circular indicator with user's initial, anchored safely within the right margin.

### 3.3 The Contextual Card 1-Tap Pattern
Users perform 80% of daily interactions directly on contextual cards:
* **Hydration Card:** `+ 250ml Glass` (1-tap logs 250ml into Dexie IndexedDB with immediate haptic feedback).
* **Fetal Kicks Card:** `+ 1 Kick` (increments session count with tactile vibration).
* **Supplements Card:** `+ Mark Taken` (toggles Folic Acid, Iron, Calcium compliance).
* **Upcoming Checkup:** `Scan Checklist >` (opens clinical appointment prep modal).

### 3.4 Modal Quick-Log Bottom Sheet (`QuickLogSheet.tsx`)
Triggered via the header `+ Log` button, this sheet provides a focused, thumb-friendly 2x2 grid for rapid entry without navigating away from the dashboard:
* **Water:** `+250ml Water`
* **Kicks:** `Count Kick`
* **Vitals:** `Log Vitals` (Blood Pressure & Pulse modal)
* **Supplements:** `Supplements` (Nutrition checklist)
* **Secondary:** `Ask Bloom AI` & `Scan Meal` (Camera barcode & plate recognition)

---

## 4. Layout Wireframes & Component Design Contracts

### 4.1 Upcoming Checkup Card Contract
```tsx
// Contract: Wrap-safe footer ensuring button never breaks onto 2 lines
<div className="mt-3.5 pt-3 border-t border-sage/20 flex flex-col xs:flex-row xs:items-center justify-between gap-2">
  <div className="flex items-center gap-1.5 text-[11.5px] text-medium min-w-0">
    <Clock size={13} className="text-sage shrink-0" />
    <span className="truncate">Dr. Priya Sharma • Cloudnine</span>
  </div>
  <div className="flex items-center gap-2 shrink-0 self-end xs:self-auto">
    <button className="text-[11.5px] font-bold text-medium hover:text-charcoal">Reschedule</button>
    <button className="bg-sage-dark text-white text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap shrink-0">
      Scan Checklist &gt;
    </button>
  </div>
</div>
```
* **Guarantee:** On 360dp devices, if the clinician title is long, the footer stacks gracefully without overflowing horizontally or wrapping "Scan Checklist" into two lines.

### 4.2 Bento Grid Equalization Contract
To prevent ragged columns, all 2-column bento grids adhere to rigid dimensional contracts:
* **Vitals Cards:** `min-h-[148px] flex flex-col justify-between`
* **Ritual Cards:** `min-h-[156px] flex flex-col justify-between`
* **Action Buttons:** Standardized `h-8` height with `whitespace-nowrap`.

---

## 5. Hardware Safe-Area Inset Management

Native Android status bars, display cutouts (notches / punch-holes), and navigation bars vary dynamically across manufacturers. Project Bloom manages insets natively via CSS environment variables:

```tsx
// Top Bar Safe Inset
className={`${
  isNative ? 'pt-[max(2.75rem,env(safe-area-inset-top))]' : 'pt-[max(0.65rem,env(safe-area-inset-top))]'
}`}

// Bottom Navigation Dock Safe Inset
className="fixed bottom-0 left-0 right-0 z-30 pb-[max(0.85rem,env(safe-area-inset-bottom))] bg-[#FDFBF7]/95 backdrop-blur-md border-t border-border/80"
```

---

## 6. Offline-First State & Storage Pipeline

All maternal health logs are recorded using an offline-first, reactive database pipeline:
1. **Client Storage:** Dexie.js (IndexedDB wrapper) with isolated tables (`hydrationLogs`, `kickSessions`, `vitalsLogs`, `supplementLogs`, `pinnedTools`).
2. **Reactive UI Updates:** Components subscribe via `useLiveQuery()`, ensuring 0ms latency UI updates upon tapping quick-log actions.
3. **Haptic Feedback:** All interactions dispatch through `triggerHaptic()` which proxies to `@capacitor/haptics` on Android with a silent no-op fallback on web preview.
4. **Cloud Sync:** Background sync workers replicate local logs to Firebase Cloud Firestore when network connectivity is established.

---

## 7. Developer Verification & Automated Density Testing

Before committing UI changes, developers and CI agents must verify layouts across both native and simulated density tiers.

### Step-by-Step ADB Emulation Commands:
```bash
# 1. Verify standard Flagship 412dp viewport (Pixel 8 default)
adb shell wm density reset
adb shell wm size reset

# 2. Simulate Compact Samsung Galaxy 360dp viewport
# (1080px width at 480 dpi = exactly 360dp)
adb shell wm density 480

# 3. Take verification screenshot
adb exec-out screencap -p > /tmp/screen_360dp_audit.png

# 4. Restore emulator to default density
adb shell wm density reset
```

### Verification Checklist:
- [x] Zero floating buttons occluding bottom navigation tabs.
- [x] "Our Pregnancy" brand title legible and un-truncated on 360dp and 412dp.
- [x] Header right-action cluster (`+ Log`, `EN`, `108`, Avatar) fits within margins on 360dp.
- [x] Checkup card "Scan Checklist >" button never wraps onto two lines.
- [x] Vitals and Rituals bento cards maintain equal vertical heights across both columns.
- [x] 1-Tap logging updates Dexie DB immediately with toast feedback.
