# Bloom — Enterprise Testing Plan & Execution Roadmap

> **Document owner:** QA/Engineering Lead
> **Status:** Proposed baseline
> **Last updated:** 2026-04-20
> **Applies to:** Bloom PWA (React 19 + TypeScript), all client-side subsystems and external integrations (Firebase, Gemini, FHIR/EHR, PeerJS).

---

## 1. Purpose & Scope

### 1.1 Why enterprise-grade testing?

Bloom processes **personal health information (PHI)** — blood pressure, contractions, fetal kick counts, pregnancy risk flags — and exchanges data with clinical systems via **FHIR R4**. Defects in this class of software carry patient-safety, regulatory, and reputational risk that normal consumer apps do not. This plan aligns the project with testing practices expected of regulated digital health products (IEC 62304 SOUP discipline, HIPAA Security Rule §164.308(a)(8), GDPR Art. 32, India DPDP Act 2023 §8).

### 1.2 In scope

- Functional correctness of all 21 feature sections
- Data integrity across Dexie (IndexedDB), Firestore, and P2P sync
- FHIR R4 conformance for EHR observations
- Gemini AI prompt/response validation (safety, groundedness)
- PWA behavior: offline, install, service worker updates
- Accessibility (WCAG 2.1 AA)
- Performance (Core Web Vitals, PWA metrics)
- Security (OWASP Top 10, client-side threats, auth flows)
- Privacy (data minimization, consent, deletion)
- Cross-browser and mobile compatibility

### 1.3 Out of scope

- Firebase/GCP infrastructure internals (treated as trusted dependency)
- Third-party EHR servers (contract-tested only)
- Marketing site copy review

### 1.4 Quality objectives

| Objective | Target |
|---|---|
| Line coverage (unit + integration) | ≥ 80% overall, ≥ 95% on health-critical modules |
| Branch coverage on clinical logic | ≥ 90% (BP thresholds, labor prediction, kick count alerts) |
| Lighthouse PWA score (prod build) | ≥ 90 |
| Lighthouse Accessibility score | 100 |
| Largest Contentful Paint (p75 mobile) | < 2.5 s |
| Defect escape rate (prod / month) | < 2 P2, 0 P0/P1 |
| Mean time to detect (MTTD) regression | < 24 h |
| E2E flake rate | < 1% |

---

## 2. Test Strategy

### 2.1 Test pyramid

```
                     ┌──────────────┐
                     │  Manual /    │   ~5%   exploratory, usability, compliance
                     │  Exploratory │
                     ├──────────────┤
                     │     E2E      │  ~10%   critical user journeys
                     ├──────────────┤
                     │  Integration │  ~25%   store + Dexie, sync engine, FHIR client
                     ├──────────────┤
                     │     Unit     │  ~60%   pure logic, components, hooks, utils
                     └──────────────┘
```

### 2.2 Risk-based prioritization

Every feature is classified at PR time:

| Class | Definition | Gate |
|---|---|---|
| **P0 — Patient safety** | Labor readiness, kick counter, contraction timer, BP thresholds, FHIR export | Unit + integration + E2E mandatory; human review |
| **P1 — Health data integrity** | Vitals logging, symptom logger, Dexie persistence, partner sync permissions | Unit + integration mandatory |
| **P2 — Planning & UX** | Task lists, budget, hospital bag, baby names, theming | Unit or component test |
| **P3 — Cosmetic** | Copy, animations, non-critical styling | Visual regression only |

### 2.3 Test types

| Type | Purpose | Tooling |
|---|---|---|
| **Unit** | Pure functions, reducers, mappers, hooks | Vitest + React Testing Library |
| **Component** | Rendered component behavior, a11y roles | Vitest + RTL + `@testing-library/jest-dom` |
| **Integration** | Context + Dexie, Firestore emulator, sync engine | Vitest + `fake-indexeddb` + Firebase Emulator Suite |
| **Contract** | FHIR R4 resource conformance | HAPI FHIR validator (docker) + AJV JSON Schema |
| **E2E** | Full user journeys across onboarding → dashboard → export | Playwright (Chromium, WebKit, Firefox, mobile viewports) |
| **Visual regression** | UI drift on key screens | Playwright screenshots + pixel diff (or Chromatic) |
| **Accessibility** | WCAG 2.1 AA | `@axe-core/playwright`, manual screen-reader passes (VoiceOver, NVDA) |
| **Performance** | Web Vitals, bundle size, TTI | Lighthouse CI, `size-limit`, WebPageTest |
| **Security** | SAST, dependency CVEs, secret scan | `npm audit`, Snyk/Dependabot, Gitleaks, Semgrep |
| **Privacy** | Data-flow audit, consent enforcement | Manual DPIA + automated "no-PII-in-logs" linting |
| **PWA / Offline** | Service worker, cache invalidation, offline flows | Playwright offline mode + manual install tests |
| **Localization** | RTL readiness, date/number locale | Playwright locale matrix |
| **Load / stress** | Firestore write contention, Dexie under 10k records | k6, custom scripts |
| **Chaos** | Network loss during P2P sync, mid-sync tab close | Playwright network throttling, manual |
| **Compliance** | HIPAA/GDPR/DPDP requirement traceability | Spreadsheet-based traceability matrix |

### 2.4 Test data management

- **Synthetic pregnancy profiles** — fixtures in `tests/fixtures/` covering: first-time, high-risk, multiples, IVF, mental-health-flagged, each trimester.
- **No real PHI** in any test artifact, snapshot, or CI log. Enforced by pre-commit regex on `ssn|dob|aadhaar|mrn`.
- **Deterministic clocks** — tests mock `Date.now()` to fixed values so week calculations and due-date math are reproducible.
- **Test doubles** — Gemini API stubbed with recorded fixtures; Firestore via emulator; PeerJS via in-process peer pair.

### 2.5 Environments

| Env | Purpose | Data | Access |
|---|---|---|---|
| **local** | Dev loop, pre-commit | Fixtures + emulators | Engineer |
| **ci** | PR validation | Fixtures + emulators | Automated |
| **preview** | Per-PR Firebase Hosting channel | Seeded synthetic accounts | Reviewers |
| **staging** | Release candidate | Synthetic data on dedicated Firebase project | QA, stakeholders |
| **production** | Live | Real PHI — read-only monitoring, no test writes | Restricted |

---

## 3. Coverage by Subsystem

### 3.1 State management (`store.tsx`, `types.ts`)
- Unit: every reducer / `updateState` path with boundary cases
- Integration: Context + Firestore onSnapshot debounced write correctness
- Property-based: `fast-check` fuzzing for state merge invariants

### 3.2 Dexie persistence (`db.ts`)
- Schema migrations between v1 → v2 → v3 (data preservation, indexes)
- Concurrent write ordering for kick / contraction sessions
- Quota exhaustion handling

### 3.3 Sync engine (`syncEngine.ts`)
- Host/joiner handshake unit tests with mocked DataChannel
- Permission filtering — verify excluded sections are stripped on the wire
- Bidirectional convergence — after N exchanges both peers reach same state hash
- Chaos: drop connection mid-sync, reconnect, verify no data loss or duplication

### 3.4 FHIR integration (`utils/fhirIntegration.ts`)
- Mapper unit tests against canonical R4 examples
- Resource validation through HAPI FHIR validator in CI
- OAuth client: token expiry, refresh, failure modes
- Network contract tests against Epic and Cerner sandboxes (nightly)

### 3.5 Labor prediction (`utils/laborPrediction.ts`)
- Golden-dataset regression tests (biometric vectors → expected score bands)
- Boundary tests on HRV, RHR, BBT thresholds
- Clinical review sign-off required when thresholds change

### 3.6 AI features (`AskBloom`, `FoodScanner`, `BabyNames`)
- Prompt-snapshot tests — prompt template + fixtures → locked responses
- Safety evals: harmful/medical-misadvice prompts must route to safe fallback
- JSON-mode schema validation (AJV) on `BabyNames` responses
- Rate-limit / quota error handling

### 3.7 PWA shell
- Service worker: install, activate, update, skipWaiting flow
- Offline-first: app bootstraps with no network
- IndexedDB survives update cycles

### 3.8 Clinical UX components
- Kick counter: timer accuracy, low-count alert thresholds
- Contraction timer: 5-1-1 rule trigger
- BP: preeclampsia threshold (≥140/90) surfaces warning
- Accessibility: keyboard-only flows on all P0 components

---

## 4. CI/CD Quality Gates

### 4.1 Pre-commit (local)
- `tsc --noEmit`
- ESLint + Prettier
- Gitleaks (block on secrets)
- Changed-file unit tests

### 4.2 Pull request (required checks)
1. Typecheck (`npm run lint`)
2. Unit + component + integration tests
3. FHIR contract validation
4. `npm audit --audit-level=high`
5. `size-limit` (block on >5% bundle growth)
6. Lighthouse CI against preview URL (block on budget regression)
7. Axe a11y smoke on 3 key pages
8. E2E smoke (5 min critical-path subset)
9. Coverage delta (cannot drop > 0.5%)
10. Semgrep security SAST

### 4.3 Merge to `main`
- Full E2E matrix (Chromium, WebKit, Firefox, mobile Chrome, mobile Safari)
- Deploy to `staging`
- Synthetic monitoring probe

### 4.4 Release to production
- Manual QA sign-off on release checklist
- Security review sign-off for changes touching auth, sync, or FHIR
- Canary rollout via Firebase Hosting channels (5% → 25% → 100%)
- Sentry error-budget check at each ramp

### 4.5 Continuous / scheduled
- Nightly: full E2E + contract tests against live EHR sandboxes
- Weekly: dependency audit, Lighthouse trend, flake analysis
- Monthly: dependency upgrade PRs, threat-model review

---

## 5. Tooling Stack (proposed)

| Concern | Tool | Rationale |
|---|---|---|
| Unit / component / integration | **Vitest** + **React Testing Library** | Native to Vite; fastest path |
| DOM matchers | `@testing-library/jest-dom` | Standard |
| IndexedDB in Node | `fake-indexeddb` | Dexie-compatible |
| Firebase | **Firebase Emulator Suite** | Deterministic Auth + Firestore |
| E2E | **Playwright** | Multi-browser, mobile emulation, traces |
| Visual regression | Playwright screenshots → **Chromatic** or `playwright-pixelmatch` | Trade: Chromatic is managed, pixelmatch is free |
| Accessibility | `@axe-core/playwright` + manual SR | WCAG automation + human verification |
| Performance | **Lighthouse CI**, `size-limit` | Budgeted regressions |
| Security SAST | **Semgrep** (free tier) | React/TS rulepacks |
| Secret scan | **Gitleaks** | Pre-commit + CI |
| Dependencies | **Dependabot** + `npm audit` | Automated CVE patching |
| FHIR validation | **HAPI FHIR validator** (Docker) | Reference implementation |
| Load | **k6** | Scriptable, CI-friendly |
| Monitoring | **Sentry** (already integrated), Firebase Performance | Error + perf telemetry |
| Coverage | Vitest `c8` / Istanbul | Standard |

---

## 6. Roles & RACI

| Activity | Eng | QA Lead | Security | Clinical advisor | PM |
|---|---|---|---|---|---|
| Write unit / component tests | **R** | A | I | I | I |
| Write E2E journeys | R | **R, A** | I | C | I |
| Clinical threshold review | C | I | I | **R, A** | I |
| FHIR conformance sign-off | R | C | I | **A** | I |
| Security review (auth/sync) | R | I | **R, A** | I | I |
| Release gate decision | R | R | R | R | **A** |
| Defect triage | R | **A** | C | C | R |

R = Responsible, A = Accountable, C = Consulted, I = Informed.

---

## 7. Entry & Exit Criteria

### 7.1 Entry — a story enters QA
- Acceptance criteria written and reviewed
- Unit + component tests passing locally
- Preview deploy green on Lighthouse, Axe, typecheck
- No P0/P1 CVEs in dependencies

### 7.2 Exit — a release ships
- All P0 journeys pass on the full browser matrix
- Coverage and bundle-size budgets met
- Zero open P0/P1 defects
- Security review complete for in-scope changes
- Rollback plan documented
- Release notes + user-facing changelog

---

## 8. Defect Management

**Severity:**
- **P0** — incorrect clinical guidance, data loss, auth bypass, PHI leak
- **P1** — sync divergence, blocked critical journey, a11y blocker
- **P2** — broken secondary feature, workaround exists
- **P3** — cosmetic

**SLAs:** P0 fix within 24 h + post-mortem; P1 within 3 business days; P2 next release; P3 backlog.

**Workflow:** issue filed → triaged with severity + component label → reproduced with failing test → fixed → regression test added → post-merge verification on preview.

---

## 9. Metrics & Reporting

Tracked weekly on a QA dashboard:

- Coverage: overall %, per-module %, trend
- Test count by level and trend
- Flake rate (re-run rate on main)
- Defect-escape rate (prod bugs / month) by severity
- Lighthouse PWA / Perf / A11y scores over time
- Bundle size over time
- Mean time to detect & resolve regressions
- Security: open CVEs by severity, mean patch latency

Quarterly report to leadership: quality posture, top risks, investment asks.

---

## 10. Compliance Traceability

A spreadsheet (`compliance-matrix.xlsx`) maps every applicable clause to the test(s) that evidence it:

| Regulation | Clause | Requirement | Test evidence |
|---|---|---|---|
| HIPAA Security | §164.308(a)(8) | Periodic technical evaluation | Quarterly pen-test report + this plan |
| HIPAA Security | §164.312(a)(1) | Access control | Auth integration tests, authorization unit tests |
| GDPR | Art. 25 | Data protection by design | DPIA + privacy unit tests |
| GDPR | Art. 17 | Right to erasure | E2E: delete account purges Dexie + Firestore |
| DPDP 2023 | §8(5) | Accuracy of data | Mapper unit tests, FHIR validation |
| WCAG 2.1 | AA | Non-discrimination | Axe CI + manual SR pass |
| FHIR R4 | Conformance | Observation profile | HAPI validator in CI |

---

# 11. Execution Roadmap

Twenty-four-week phased rollout. Each phase has explicit deliverables, owners, and exit criteria; later phases assume earlier deliverables are in place.

### Phase 0 — Baseline & alignment (Weeks 0–1)

**Goal:** know where we are and agree on where we're going.

| Activity | Owner | Deliverable |
|---|---|---|
| Current-state audit (coverage = 0, no CI) | QA Lead | Gap report |
| Tooling decision (this plan §5) | Eng Lead + QA | ADR merged |
| Threat model + DPIA v1 | Security | Doc in `/docs/security/` |
| Risk register | PM | Prioritized list |

**Exit:** plan adopted, tooling approved, budget signed off.

---

### Phase 1 — Foundations (Weeks 2–4)

**Goal:** make tests cheap to write and impossible to ignore.

- Install Vitest, RTL, `fake-indexeddb`, coverage reporting
- Wire GitHub Actions: typecheck, lint, unit tests, coverage upload
- Add pre-commit hooks (husky + lint-staged)
- Gitleaks + Dependabot enabled
- First 20 seed unit tests on pure utilities (`utils.ts`, date helpers, labor prediction)
- Coverage gate: no regression from baseline

**Exit:** every PR blocks on typecheck + unit tests; coverage reported; secret scan green.

---

### Phase 2 — Component & integration (Weeks 5–8)

**Goal:** cover the state layer and UI contract.

- Component tests for every P0/P1 section (Kick, Contraction, Vitals, Labor, FHIR triggers)
- Integration tests: PlannerProvider + Dexie via `fake-indexeddb`
- Firestore emulator in CI, tests for load/save cycles
- Axe smoke across 5 highest-traffic screens
- Coverage target: **60% overall, 85% on P0 modules**

**Exit:** PR gate adds component/integration/a11y; coverage targets met.

---

### Phase 3 — End-to-end & critical journeys (Weeks 9–12)

**Goal:** validate the app from the user's perspective.

- Playwright configured for Chromium + WebKit + mobile Chrome
- Ten critical-path journeys scripted:
  1. Onboarding (guest + Google)
  2. Set due date → week correctly calculated
  3. Log a kick session → appears in history
  4. Run contraction timer → 5-1-1 alert triggers
  5. Log BP ≥ 140/90 → warning shown
  6. Add custom task → syncs to partner
  7. Partner connect (host+join in two tabs) → state converges
  8. FHIR export → valid R4 bundle downloaded
  9. Install PWA → works offline
  10. Sign out → local cache cleared per policy
- Preview deploy per PR (Firebase Hosting channels)
- Lighthouse CI with budgets

**Exit:** E2E smoke on every PR, full matrix on merge to main.

---

### Phase 4 — Security, privacy, compliance (Weeks 13–16)

**Goal:** externalize assurance.

- Semgrep ruleset tuned for React/TS and healthcare patterns
- Third-party pen test against staging
- DPIA finalized and signed
- Traceability matrix completed (§10)
- HAPI FHIR validator wired into CI
- Gemini safety eval suite (prompts + expected-safe responses)
- Privacy lint: no PHI in Sentry breadcrumbs, logs, analytics

**Exit:** pen-test remediation complete; compliance matrix reviewed by counsel.

---

### Phase 5 — Performance, chaos, PWA (Weeks 17–20)

**Goal:** prove the app holds up in the real world.

- `size-limit` bundle budgets per route
- Lighthouse CI budgets tightened to targets (§1.4)
- k6 load test for Firestore write bursts
- Chaos suite: network toggling during P2P sync, tab closure, IndexedDB quota
- Offline / install / update E2E cases
- Cross-browser matrix expanded (BrowserStack or SauceLabs if needed)
- Visual regression adopted

**Exit:** all budgets green; chaos suite passes; PWA install flow verified on iOS Safari + Android Chrome.

---

### Phase 6 — Continuous improvement (Week 21+)

**Goal:** keep quality ratcheting up, not drifting down.

- Coverage ratchet: gate blocks any drop > 0.5%
- Flake dashboard; quarantine & fix flakes within one sprint
- Quarterly threat-model review
- Nightly contract tests against Epic/Cerner sandboxes
- Mutation testing pilot (`Stryker`) on clinical logic modules
- Test debt backlog reviewed each sprint
- Annual pen test
- Clinical advisor re-validates thresholds annually or on guideline change

**Exit criteria:** ongoing — this is the steady state.

---

## 12. Investment Summary

| Phase | Duration | Headcount | Key cost drivers |
|---|---|---|---|
| 0 | 2 wk | 0.5 QA + 0.25 Sec | Planning |
| 1 | 3 wk | 1 QA + 0.5 Eng | Tooling |
| 2 | 4 wk | 1 QA + 1 Eng | Coverage build-up |
| 3 | 4 wk | 1 QA + 0.5 Eng | Playwright infra, BrowserStack license |
| 4 | 4 wk | 0.5 QA + 1 Sec + counsel | Pen test, DPIA |
| 5 | 4 wk | 1 QA + 0.5 Eng | Load/perf tooling |
| 6 | ongoing | 0.5 QA steady | License renewals |

---

## 13. Appendix — Immediate next steps (Week 1 actionable)

1. Adopt this plan as an ADR: `/docs/adr/0001-testing-plan.md`
2. Add `"test": "vitest"` and `"test:e2e": "playwright test"` scripts to [package.json](package.json)
3. `npm i -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event fake-indexeddb @vitest/coverage-v8 jsdom`
4. Create `vitest.config.ts` and `tests/setup.ts`
5. Open a seed PR adding the first three tests:
   - `src/utils.ts` — date calculations
   - `src/utils/laborPrediction.ts` — threshold boundaries
   - `src/utils/fhirIntegration.ts` — BP mapper against R4 example
6. Add GitHub Actions workflow `.github/workflows/ci.yml` with typecheck + test + coverage upload
7. Enable Dependabot + Gitleaks
8. Schedule threat-modeling session with clinical advisor and security reviewer
