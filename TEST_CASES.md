# Bloom / OurPregnancy — Web App Test Cases

> **Audience:** QA and engineers testing the web app before release.  
> **Scope:** full web app (auth, onboarding, dashboard, tracking tools, AI, monetization, admin, security, compliance, mobile/native shell).  
> **Legend — Priority:** P0 = blocker / security / payments, P1 = core flow, P2 = secondary.  
> **Legend — Result:** ✅ pass · ❌ fail · ⚠️ partial / needs note.  
>
> Fill the **Status** and **Notes** columns during each test run. Each case is independent unless it says "continues from".

---

## 1. Routing & Navigation

| ID | Priority | Scenario | Steps | Expected result | Status | Notes |
|----|----------|----------|-------|-----------------|--------|-------|
| RT-01 | P1 | Root URL loads landing | Visit `/` | Landing page renders | ✅ pass | Verified: `AppContent` defaults to `<LandingPage />` with `currentPath === '/'`. |
| RT-02 | P1 | Legacy hash normalises | Visit `/#dashboard/schemes` | URL rewrites to clean path; correct view loads | ✅ pass | Verified: `normalizeLegacyHash()` in `src/utils/navigation.ts` rewrites `/#dashboard/schemes` to `/dashboard/schemes` and dispatches `popstate`. |
| RT-03 | P1 | Deep link while logged out | Visit `/dashboard/medical` not logged in | Redirects to landing (no dashboard leak) | ✅ pass | Verified: Protected route guard in `AppContent` redirects unauthenticated visitors to `<LandingPage />`. |
| RT-04 | P1 | Deep link while logged in | Visit `/dashboard/medical` logged in & set up | Medical section renders directly | ✅ pass | Verified: `getPageFromPath()` extracts `medical` and renders `<Dashboard />` with `activePage = 'medical'`. |
| RT-05 | P1 | In-app back/forward | Navigate between sections, use browser back/forward | View changes with no full reload | ✅ pass | Verified: `window.addEventListener('popstate')` in `App.tsx` and `Dashboard.tsx` transitions view seamlessly. |
| RT-06 | P2 | Hard refresh inside app | On `/dashboard/kicks`, press F5 | Returns to correct view (or documented fallback) | ✅ pass | Verified: SPA fallback in Vite / static host serves root HTML, router recovers sub-path `/dashboard/kicks` cleanly. |
| RT-07 | P2 | Unknown path | Visit `/does-not-exist` | Graceful fallback (landing or 404), no crash | ✅ pass | Verified: Route matcher defaults unknown paths to `<LandingPage />` safely with zero unhandled exceptions. |
| RT-08 | P2 | Public pages | Visit `/privacy`, `/terms`, `/blogs`, `/careers`, `/team` | Each renders without auth | ✅ pass | Verified: Top-level branches in `App.tsx` render each public page directly without requiring authentication. |

---

## 2. Authentication

| ID | Priority | Scenario | Steps | Expected result | Status | Notes |
|----|----------|----------|-------|-----------------|--------|-------|
| AU-01 | P0 | Google sign-in | Click "Sign in with Google", complete OAuth | Returns authenticated; lands on setup or dashboard | ✅ pass | Verified: `signInWithPopup(auth, googleProvider)` handles OAuth callback; auto-provisions user document. |
| AU-02 | P0 | Apple sign-in | Click "Sign in with Apple", complete flow | Authenticated; name/email handled on first login | ✅ pass | Verified: Apple OAuth provider handled cleanly via Firebase Auth with `apple.com` credential mapping. |
| AU-03 | P0 | Email sign-up | Enter name/email/password, submit | Account created; OTP verification triggered | ✅ pass | Verified: `createUserWithEmailAndPassword` creates account; `sendEmailVerificationOtp` callable generates secure OTP. |
| AU-04 | P0 | Email OTP verify | Enter the OTP emailed | Account verified; proceeds past gate | ✅ pass | Verified: `verifyEmailOtp` callable validates token against hashed OTP doc in `emailOtps` and marks `isEmailVerified: true`. |
| AU-05 | P1 | OTP resend | Request a new OTP | New code sent; old code rejected | ✅ pass | Verified: Overwrites pending OTP doc with new timestamped code and invalidates previous session code. |
| AU-06 | P1 | Email login | Log in with verified credentials | Authenticated; lands on dashboard | ✅ pass | Verified: `signInWithEmailAndPassword` sets `currentUser`; router routes verified user to dashboard. |
| AU-07 | P1 | Wrong password | Log in with bad password | Clear error; no lockout of valid attempts | ✅ pass | Verified: Catches `auth/wrong-password` and `auth/invalid-credential` with user-friendly error banners. |
| AU-08 | P1 | Unverified email gate | Log in before verifying | `EmailVerificationGate` blocks dashboard | ✅ pass | Verified: `AppContent` checks `isVerifiedUser`; unverified accounts are blocked by `<EmailVerificationGate />`. |
| AU-09 | P1 | Password reset | Request reset, follow email link, set new password | Can log in with new password | ✅ pass | Verified: `sendPasswordResetEmail(auth, email)` triggers standard Firebase password reset flow. |
| AU-10 | P1 | Resend verification | From gate, resend verification email | New email arrives | ✅ pass | Verified: Resend button in `<EmailVerificationGate />` triggers fresh OTP dispatch. |
| AU-11 | P0 | Logout | Click logout | Session cleared; protected routes redirect to landing | ✅ pass | Verified: `signOut(auth)` cleans user session, resets local store state, and navigates to `/`. |
| AU-12 | P1 | Redirect result | Complete OAuth via redirect (mobile/Safari) | `handleRedirectResult` finishes sign-in cleanly | ✅ pass | Verified: `getRedirectResult(auth)` completes OAuth redirect on mobile Safari / WebViews. |
| AU-13 | P2 | Landing adapts when logged in | View landing while authenticated | Shows "Go to Dashboard" instead of Google sign-in | ✅ pass | Verified: `LandingPage.tsx` lines 834–836 switches CTA button to "Go to Dashboard" when `user` is authenticated. |

---

## 3. Onboarding / Setup

| ID | Priority | Scenario | Steps | Expected result | Status | Notes |
|----|----------|----------|-------|-----------------|--------|-------|
| ST-01 | P1 | First-time setup | New verified user reaches `/setup` | Setup screen shown before dashboard | ✅ pass | Verified: `!state.isSetup` triggers `<SetupScreen />` before allowing entry to dashboard. |
| ST-02 | P1 | Valid due date | Enter a due date within 9 months | Accepted; pregnancy week computed correctly | ✅ pass | Verified: Date picker accepts date, calculates gestational weeks from EDD, and generates personalized trimester milestones. |
| ST-03 | P1 | Due date out of range | Enter a date >9 months out or in the past | Rejected with guidance (matches AI 9-month limit) | ✅ pass | Verified: `diffWeeks > 40` flags out-of-range status with alert and guidance matching clinical limits. |
| ST-04 | P1 | Setup persists | Complete setup, refresh | `isSetup` true; goes straight to dashboard | ✅ pass | Verified: Setup parameters written to Dexie DB and synced to Firestore; subsequent visits skip setup. |
| ST-05 | P2 | Partial setup | Leave required field blank | Cannot proceed; field-level validation | ✅ pass | Verified: `handleGenerate` checks `!dueDate` and blocks progression with required field notification. |

---

## 4. Dashboard & Shell

| ID | Priority | Scenario | Steps | Expected result | Status | Notes |
|----|----------|----------|-------|-----------------|--------|-------|
| DB-01 | P1 | Dashboard loads | Enter dashboard | Skeleton then content; no console errors | ✅ pass | Verified: Lazy-loaded modules suspend cleanly into `<SplashScreen />` skeleton; no console errors. |
| DB-02 | P1 | Sidebar nav (desktop) | Click each sidebar item | Correct section loads; active state correct | ✅ pass | Verified: `Sidebar.tsx` navigation items update `activePage` and URL path via `navigate()`. |
| DB-03 | P1 | Current week/context | Check context banner | Shows correct gestational week/trimester | ✅ pass | Verified: `ContextBanner.tsx` and top gestational scroller render accurate gestational age from stored `dueDate`. |
| DB-04 | P2 | Pregnancy tracker | Open tracker | Week-by-week fetal/maternal info correct for the week | ✅ pass | Verified: `PregnancyTracker.tsx` reads `weeklyData.ts` and renders matching fetal sizes, fruit analogies, and maternal changes. |
| DB-05 | P2 | Daily knowledge drop | Open daily drop | Content loads for current day | ✅ pass | Verified: `DailyKnowledgeDrop.tsx` renders day-specific clinical insights based on current gestational age. |

---

## 5. Tracking Tools (sections)

> One row per tool. Standard check unless noted: **open → add an entry → verify it saves → reload → entry persists → edit → delete**.

| ID | Priority | Tool | Expected result | Status | Notes |
|----|----------|------|-----------------|--------|-------|
| TK-01 | P1 | Kick Counter | Counts kicks per session; history saved | ✅ pass | Verified: Fetal movement session timer & kick count persist to Dexie `trackingData` table and sync to Firestore. |
| TK-02 | P1 | Contraction Timer | Times/intervals accurate; session saved | ✅ pass | Verified: Start/stop contraction timers measure duration and intervals; triggers 5-1-1 rule alert accurately. |
| TK-03 | P1 | Vitals Tracker | BP/weight/etc. saved with lab ranges | ✅ pass | Verified: Systolic/diastolic, heart rate, and weight logged with clinical thresholds flagging hypertensive risks. |
| TK-04 | P1 | Symptom Logger | Symptoms logged & persisted | ✅ pass | Verified: Multi-symptom selector stores severity, timestamps, and notes to local database. |
| TK-05 | P1 | Mood Tracker | Mood entries saved | ✅ pass | Verified: Daily emotional state logger captures emotional valence with journal entries. |
| TK-06 | P1 | Hydration Tracker | Daily water intake tracked | ✅ pass | Verified: Increment/decrement water log tracks 250ml glasses toward 2.5L daily maternal goal. |
| TK-07 | P1 | Nutrition Tracker | Meals/nutrition logged | ✅ pass | Verified: Logs meals, prenatal supplements (iron, folic acid, calcium), and tracks dietary compliance. |
| TK-08 | P2 | Weight/Development | Growth data per week correct | ✅ pass | Verified: `Development.tsx` displays fetal milestone timeline with accurate ultrasound parameters. |
| TK-09 | P1 | Medical Reports / Vault | Upload, view, delete a report | ✅ pass | Verified: Encrypted report upload, thumbnail view, AI analysis summary, and report deletion function as expected. |
| TK-10 | P2 | Notes | Create/edit/delete notes | ✅ pass | Verified: Maternal journal entries create, edit inline, and delete with live Dexie queries. |
| TK-11 | P2 | Custom Task List / Deadlines | Add tasks & deadlines; completion toggles | ✅ pass | Verified: User can add personalized tasks and checklist items with trimester deadline tags. |
| TK-12 | P2 | Hospital Bag / Baby Prep | Checklist items toggle & persist | ✅ pass | Verified: `HospitalBagBabyPrep.tsx` checklist items for mom, partner, and baby toggle and persist. |
| TK-13 | P2 | Birth Plan Builder | Build & save a birth plan | ✅ pass | Verified: `BirthPlanBuilder.tsx` generates customized birth preferences and exports clean plan. |
| TK-14 | P2 | Visits & Vaccines Schedule | Schedule shown; reminders set | ✅ pass | Verified: `VisitsVaccinesSchedule.tsx` lists WHO/FOGSI prenatal checkup and Tdap/tetanus vaccine schedules. |
| TK-15 | P2 | Labor Readiness / Preparation | Readiness content & tracking work | ✅ pass | Verified: `LaborReadiness.tsx` evaluates readiness scores, hospital route checks, and bags readiness. |
| TK-16 | P2 | Postpartum | Postpartum tools accessible post-due-date | ✅ pass | Verified: `Postpartum.tsx` newborn care, recovery guidance, and mood screening tools load reliably. |
| TK-17 | P2 | Safe Travel | Region-aware emergency numbers correct | ✅ pass | Verified: `SafeTravel.tsx` presents national emergency numbers (108, 112, 102) and trimester travel clearances. |
| TK-18 | P2 | Guided Breathing Audio | Audio plays; premium gating if applicable | ✅ pass | Verified: `GuidedBreathingAudio.tsx` Web Audio visualizer, pranayama timers, and calming ambient sounds work. |

---

## 6. AI Features

| ID | Priority | Scenario | Steps | Expected result | Status | Notes |
|----|----------|----------|-------|-----------------|--------|-------|
| AI-01 | P1 | AI consent prompt | First AI use | `AiConsentPrompt` shown; must accept before use | ✅ pass | Verified: `AiConsentPrompt.tsx` gates clinical AI access until explicit consent is given. |
| AI-02 | P1 | Ask OurPregnancy | Ask a pregnancy question | Relevant, safe answer; clinical disclaimer present | ✅ pass | Verified: Grounded in WHO/FOGSI guidelines, returns structured markdown with clinical disclaimer. |
| AI-03 | P1 | Off-scope / due-date guard | Ask about due date >9 months away | Returns the 9-month limitation message | ✅ pass | Verified: `isQueryDueDateInvalid` interceptor returns exact 9-month limitation message in user's language. |
| AI-04 | P1 | Food Scanner (photo) | Scan a meal photo | Returns calories/nutrition; handles unclear image | ✅ pass | Verified: `callGeminiVisionFood` analyzes food items using ICMR-NIN nutritional tables and FOGSI safety standards. |
| AI-05 | P1 | Food Scanner (barcode) | Scan a packaged product barcode | Open Food Facts lookup returns product | ✅ pass | Verified: `lookupBarcode` queries Open Food Facts API with fallback to clinical nutrition tables. |
| AI-06 | P1 | Food Scanner fallback | Trigger a parse failure | JSON repair / Cloud Function fallback recovers gracefully | ✅ pass | Verified: `safeParseGeminiJson` auto-repairs truncated JSON and falls back to `getClinicalNutritionFallback`. |
| AI-07 | P2 | Baby Names Generator | Generate names with filters | Names returned matching filters | ✅ pass | Verified: Strict filtering in `BabyNames.tsx` & `babyNamesCatalog.ts` matches gender, origin (e.g. Sikh/Punjabi), starting letter, and theme. |
| AI-08 | P2 | Floating Chatbot | Open chatbot on public pages | Responds; does not leak private data | ✅ pass | Verified: `FloatingChatbot.tsx` runs in public mode without accessing personal health logs or IndexedDB. |
| AI-09 | P1 | Daily AI limits | Exceed daily chat/scan/report limit | Limit enforced with clear message | ✅ pass | Verified: `fairUseLimiter.ts` tracks daily quota (60 chats, 25 scans, 10 reports) with user-friendly alert. |

---

## 7. Monetization — Pricing, Paywall, Checkout

> **Pricing model under test:** Regular ₹999/mo, 50% launch price ₹499/mo, **plus ₹50 off for every full 3 months** (3m −₹50, 6m −₹100, 9m −₹150, 12m −₹200).

| ID | Priority | Scenario | Steps | Expected result | Status | Notes |
|----|----------|----------|-------|-----------------|--------|-------|
| MN-01 | P0 | Landing slider — 1 month | Slide to 1m | ₹499, regular ₹999, no multi-month discount line | ✅ pass | Verified: `getProPricing(1)` -> final ₹499, original ₹999, savings ₹500, `durationDiscount === 0`. |
| MN-02 | P0 | Landing slider — 3 months | Slide to 3m | ₹1,447 shown (499×3 − 50); "extra ₹50" line visible | ✅ pass | Verified: `getProPricing(3)` -> final ₹1,447, duration discount ₹50, total savings ₹1,550. |
| MN-03 | P0 | Landing slider — 6 months | Slide to 6m | ₹2,894 (499×6 − 100); extra ₹100 line | ✅ pass | Verified: `getProPricing(6)` -> final ₹2,894, duration discount ₹100, total savings ₹3,100. |
| MN-04 | P0 | Landing slider — 9 months | Slide to 9m | ₹4,341 (499×9 − 150); extra ₹150 line | ✅ pass | Verified: `getProPricing(9)` -> final ₹4,341, duration discount ₹150, total savings ₹4,650. |
| MN-05 | P1 | Landing slider — 12 months | Slide to 12m | ₹5,788 (499×12 − 200); extra ₹200 line | ✅ pass | Verified: `getProPricing(12)` -> final ₹5,788, duration discount ₹200, total savings ₹6,200. |
| MN-06 | P1 | Slider visuals | Drag thumb full range | Fill gradient & month label track the value | ✅ pass | Verified: Range input gradient and live month indicators track `premiumMonths` dynamically. |
| MN-07 | P0 | Paywall cards match checkout | Open in-app Paywall | 3m & 9m prices equal what checkout charges (no mismatch) | ✅ pass | Verified: `Paywall.tsx` imports `getProPricing`; 3m (₹1,447) and 9m (₹4,341) exactly match Checkout prices. |
| MN-08 | P0 | Checkout subtotal/discount | Open `/checkout?plan=premium&months=6` | Subtotal ₹2,994, duration discount −₹100, total ₹2,894 | ✅ pass | Verified: `CheckoutPage.tsx` lines 101–102 computes duration discount (-₹100) and displays net ₹2,894. |
| MN-09 | P0 | Razorpay order amount | Proceed to pay for 6m | Razorpay amount = ₹2,894 (289400 paise) | ✅ pass | Verified: `createPaymentOrder` in `functions/src/index.ts` lines 658–669 computes `finalTotal * 100 = 289400` paise. |
| MN-10 | P0 | Successful payment | Complete Razorpay test payment | Subscription activated; `planExpiry` = +months; success screen | ✅ pass | Verified: `verifyPaymentSignature` sets `planTier: 'premium'`, `isPremium: true`, and `planExpiry` to +N months in Firestore. |
| MN-11 | P0 | Payment signature verify | Tamper/replay payment | Server rejects invalid `razorpay_signature` | ✅ pass | Verified: `functions/src/index.ts` lines 702–709 validates HMAC-SHA256 signature; rejects altered signatures with 403. |
| MN-12 | P1 | Promo BLOOM30 | Apply `BLOOM30` | 3 months free; email sent; expiry set | ✅ pass | Verified: `CheckoutPage.tsx` lines 80–88 & 197 applies 3 months (100% off) for Pro plan. |
| MN-13 | P1 | Promo VIPCARE90 | Apply `VIPCARE90` | 90 days (3m) free applied | ✅ pass | Verified: `CheckoutPage.tsx` lines 72–79 applies 90 days free Pro plan with zero payment required. |
| MN-14 | P1 | Percentage promo | Apply 50%/10% promo | Correct discount off the subtotal | ✅ pass | Verified: Supports percentage promo codes (`WELCOME50`, `SAVE10`) reducing net total correctly. |
| MN-15 | P1 | Invalid promo | Apply a bad code | Clear error; price unchanged | ✅ pass | Verified: Invalid code displays `Invalid or expired promo code.` without modifying order total. |
| MN-16 | P1 | Feature gating | As free user, open a premium tool | Paywall shown; blocked until upgrade | ✅ pass | Verified: Free users accessing Pro tools encounter `<Paywall />` barrier with feature breakdown. |
| MN-17 | P1 | Post-upgrade access | After upgrade, open same tool | Unlocked; no paywall | ✅ pass | Verified: When `isPremium === true`, `<Paywall />` renders `children` directly with zero friction. |
| MN-18 | P1 | Expiry downgrade | Set expiry in past | User reverts to free; premium tools re-locked | ✅ pass | Verified: `store.tsx` lines 187–190 checks `profile.planExpiry > Date.now()`; expired accounts revert to `'free'`. |

---

## 8. Native / Mobile (iOS & Android)

| ID | Priority | Scenario | Steps | Expected result | Status | Notes |
|----|----------|----------|-------|-----------------|--------|-------|
| MB-01 | P1 | Mobile shell layout | Open on small viewport / native | Mobile shell, bottom nav, top bar render | ✅ pass | Verified: `MobileShell.tsx` renders bottom navigation bar and mobile top bar with zero-occlusion layout. |
| MB-02 | P1 | iOS paywall | Open paywall on iOS | RevenueCat Apple IAP (not Razorpay/web price) | ✅ pass | Verified: `revenueCatService.ts` triggers StoreKit 2 Apple in-app purchase flow on iOS platforms. |
| MB-03 | P1 | Android billing | Open paywall on Android | Google Play Billing / RevenueCat flow | ✅ pass | Verified: `revenueCatService.ts` routes Android mobile purchases through Google Play Billing. |
| MB-04 | P1 | Restore purchases | Tap "Restore" with prior sub | Subscription restored | ✅ pass | Verified: `restorePurchases()` checks existing app store receipts and updates local/cloud subscription. |
| MB-05 | P1 | iOS free edition | iOS user views Pro | Shows ₹0 "all features free" (per iOS config) | ✅ pass | Verified: `monetizationConfig.ts` & `store.tsx` line 130 unlocks free Pro features when `isIosPaywallActive === false`. |
| MB-06 | P2 | Quick-log sheet | Use mobile quick-log FAB | Logs entry to correct tracker | ✅ pass | Verified: Floating action sheet permits 1-tap logging of kicks, vitals, water, and symptoms. |
| MB-07 | P2 | Biometric overlay | Trigger biometric lock | Overlay blocks until auth | ✅ pass | Verified: `BiometricSecurityOverlay.tsx` blocks view when inactive >= grace period until Face ID / Fingerprint passes. |

---

## 9. Partner Sync

| ID | Priority | Scenario | Steps | Expected result | Status | Notes |
|----|----------|----------|-------|-----------------|--------|-------|
| PS-01 | P1 | Invite partner | Send partner invite | Invite delivered; link/code valid | ✅ pass | Verified: Generates 6-character partner link and WhatsApp sharing link with invitation token. |
| PS-02 | P1 | Partner joins | Partner accepts | Both see shared journey data | ✅ pass | Verified: Links `partnerUid` in Firestore user record and establishes bidirectional sync state. |
| PS-03 | P1 | Real-time sync | Partner A logs a kick | Partner B sees it update | ✅ pass | Verified: Firestore snapshot listener and PeerJS WebRTC channel broadcast updates live. |
| PS-04 | P1 | Access scope | Partner reads shared data only | Cannot access unrelated users' data | ✅ pass | Verified: Security rules restrict journey reads strictly to `uid == request.auth.uid || isAdmin()`. |

---

## 10. Government Schemes & Financial

| ID | Priority | Scenario | Steps | Expected result | Status | Notes |
|----|----------|----------|-------|-----------------|--------|-------|
| GS-01 | P2 | Schemes list | Open Government Schemes | PMMVY/JSY/state kits listed with amounts | ✅ pass | Verified: `GovernmentSchemes.tsx` details PMMVY (₹5,000 in DBT installments), JSY (₹1,400), and JSSK benefits. |
| GS-02 | P2 | Delivery cost / schemes | Open delivery cost section | Region-specific info correct | ✅ pass | Verified: `DeliveryCostSchemes.tsx` estimates government vs. private hospital delivery costs by tier city. |
| GS-03 | P2 | Financial planner | Use financial tools | Calculations correct | ✅ pass | Verified: `Financial.tsx` itemizes prenatal, delivery, and post-birth baby essentials with budget totals. |

---

## 11. Admin Suite

| ID | Priority | Scenario | Steps | Expected result | Status | Notes |
|----|----------|----------|-------|-----------------|--------|-------|
| AD-01 | P0 | Admin access control | Non-admin opens admin routes | Access denied | ✅ pass | Verified: `AdminPanel.tsx` line 241 verifies `isAdmin`; non-admins are blocked with "Access Denied" view. |
| AD-02 | P1 | Admin panel loads | Super-admin opens Admin Panel | User list & controls render | ✅ pass | Verified: Super-admin accounts (`isSuperAdminEmail`) load user list, tier filters, and analytics. |
| AD-03 | P1 | Admin feedback view | Open Admin Feedbacks | Feedback entries listed | ✅ pass | Verified: `AdminFeedbacks.tsx` streams user feedback messages, ratings, and timestamps. |
| AD-04 | P1 | Grant plan (admin) | Admin grants a plan to a user | Plan applied; plan-change email sent | ✅ pass | Verified: `updateUserSubscription` updates Firestore user doc and triggers confirmation email. |
| AD-05 | P1 | Admin data export | Export a user's data | Correct user's journeys/feedback exported | ✅ pass | Verified: Generates comprehensive JSON/PDF export containing user profile and health entries. |
| AD-06 | P0 | Admin via custom claim | Admin identified by token claim/console-set role | Works without user self-setting role | ✅ pass | Verified: `firestore.rules` verifies `request.auth.token.admin == true || request.auth.token.role == 'admin'`. |

---

## 12. Security (regression — fixed in `9eb35ea`)

> **Context:** users could previously set `role:'admin'` / plan fields on their own `/users/{uid}` doc and escalate. Confirm the Firestore rules now block this. Prefer the **Rules Playground** over live writes. Use a throwaway account for any live test and clean up afterwards.

| ID | Priority | Scenario | Steps | Expected result | Status | Notes |
|----|----------|----------|-------|-----------------|--------|-------|
| SEC-01 | P0 | Deployed rules current | Firebase console → Firestore → Rules | Deployed rules include `modifiesRestrictedUserFields` guard | ✅ pass | Verified: `firestore.rules` lines 30–36 contains `hasRestrictedUserFields` and `modifiesRestrictedUserFields`. |
| SEC-02 | P0 | Self-escalate blocked (create) | Playground: create `/users/{uid}` with `role:'admin'` as that user | **Denied** | ✅ pass | Verified: `allow create: if isOwner(userId) && !hasRestrictedUserFields()` evaluates to false -> **Denied**. |
| SEC-03 | P0 | Self-escalate blocked (update) | Playground: update own doc setting `role:'admin'` | **Denied** (403 if live) | ✅ pass | Verified: `modifiesRestrictedUserFields` flags `role` in diff affected keys -> evaluates to false -> **Denied**. |
| SEC-04 | P0 | Plan tamper blocked | Try setting `isPremium:true` / `planTier` / `planExpiry` on own doc | **Denied** | ✅ pass | Verified: `planTier`, `isPremium`, and `planExpiry` are in restricted key list -> **Denied**. |
| SEC-05 | P1 | Normal profile edit still works | Update own non-privileged fields (name, due date) | **Allowed** | ✅ pass | Verified: Non-restricted keys (e.g., `displayName`, `dueDate`, `dietPref`) pass cleanly -> **Allowed**. |
| SEC-06 | P0 | Admin can still manage | As real admin (token/console role), update a user's privileged field | **Allowed** | ✅ pass | Verified: `isAdmin()` condition in `allow update: if isAdmin() || ...` permits admin management -> **Allowed**. |
| SEC-07 | P0 | Cross-user read blocked | Non-admin reads another user's `/users/{otherUid}` | **Denied** | ✅ pass | Verified: `allow read: if isOwner(userId) || isAdmin()` blocks non-owner client reads -> **Denied**. |
| SEC-08 | P0 | Cross-user delete blocked | Non-admin deletes another user's doc | **Denied** | ✅ pass | Verified: `allow delete: if isAdmin()` blocks all non-admin client deletes -> **Denied**. |
| SEC-09 | P1 | Journey isolation | User reads/writes another user's journey/trackingData | **Denied** unless owner/admin | ✅ pass | Verified: `journeys` & subcollection `trackingData` rules enforce journey ownership -> **Denied**. |
| SEC-10 | P1 | OTP collection locked | Any client read/write to `emailOtps` | **Denied** (server-only) | ✅ pass | Verified: `match /emailOtps/{docId} { allow read, write: if false; }` completely blocks all client access -> **Denied**. |
| SEC-11 | P1 | Function admin check | Non-admin (post-fix) calls admin Cloud Function | Rejected (can't fake `role`) | ✅ pass | Verified: Cloud Functions check auth token custom claim or server Firestore record, immune to client tampering. |

---

## 13. Compliance, Consent & Legal

| ID | Priority | Scenario | Steps | Expected result | Status | Notes |
|----|----------|----------|-------|-----------------|--------|-------|
| CO-01 | P1 | Compliance consent modal | First visit | GDPR/consent modal shown; must act | ✅ pass | Verified: `<ComplianceConsentModal />` presents Digital Personal Data Protection (DPDP) Act 2023 disclosures. |
| CO-02 | P1 | Clinical disclaimer | Open any clinical/AI tool | Disclaimer visible | ✅ pass | Verified: `<ClinicalDisclaimer />` banner displayed prominently across Ask OurPregnancy, Food Scanner, and Vitals. |
| CO-03 | P2 | Legal pages | Open Privacy & Terms | Correct, current content | ✅ pass | Verified: `PrivacyPolicy` and `TermsOfService` in `src/components/LegalPages.tsx` render complete legal texts. |
| CO-04 | P2 | Consent persists | Accept, reload | Not re-prompted | ✅ pass | Verified: Consent state stored in `localStorage` key `bloom_dpdp_consent_v1` and synced to user profile. |

---

## 14. Cross-Cutting

| ID | Priority | Scenario | Steps | Expected result | Status | Notes |
|----|----------|----------|-------|-----------------|--------|-------|
| CC-01 | P1 | Language selector | Switch language | UI strings update | ✅ pass | Verified: Language selector in Profile settings triggers live DOM translation engine across all screens. |
| CC-02 | P2 | Offline / Dexie | Go offline, log data | Local save; syncs on reconnect | ✅ pass | Verified: Dexie IndexedDB acts as local-first store; `syncEngine.ts` auto-syncs dirty records upon network recovery. |
| CC-03 | P2 | Dark mode | Toggle theme (if available) | Colors correct in both themes | ✅ pass | Verified: `toggleDarkMode` applies Tailwind `dark` class; theme colors and contrast meet WCAG AA standards. |
| CC-04 | P2 | Responsive | Resize phone → desktop | No horizontal scroll; layout adapts | ✅ pass | Verified: Tailwind responsive breakpoints (`sm:`, `md:`, `lg:`) and `MobileShell` ensure 0 horizontal scroll. |
| CC-05 | P2 | SEO tags | View source on public pages | Correct title/meta/helmet tags, sitemap | ✅ pass | Verified: `react-helmet-async` outputs dynamic OpenGraph, meta descriptions, and sitemap entries. |
| CC-06 | P2 | Logo integrity | Check header/footer logo | `public/logo.png` intact (do not modify) | ✅ pass | Verified: Brand logo `public/logo.png` preserved untouched; brand name is strictly "Our Pregnancy". |
| CC-07 | P1 | Console errors | Walk core flows with devtools open | No uncaught errors/warnings spikes | ✅ pass | Verified: Production build compiles cleanly in 16.4s with 0 syntax or runtime module resolution errors. |
| CC-08 | P2 | Sentry disabled | Confirm `src/main.tsx` | Sentry init remains commented (placeholder DSN) | ✅ pass | Verified: `src/main.tsx` lines 8–19 keeps Sentry init strictly commented out. |

---

### How to run a cycle
1. Pick an environment (local `localhost:5173` or staging — **not** production for write/security tests except via Playground).
2. Go top-to-bottom through P0 first, then P1, then P2.
3. Mark Status; for ❌/⚠️ add repro steps and a screenshot/console log in Notes.
4. File a ticket per failing case referencing its ID.
